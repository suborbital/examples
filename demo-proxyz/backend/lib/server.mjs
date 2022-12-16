import polka from "polka";
import handler from "serve-handler";

import {
  PORT,
  CONFIG_MAXROWS,
  CONFIG_IDLETIMEOUT,
  CONFIG_UPDATEFREQ,
  CONFIG_SENDLOG,
} from "../config.mjs";

import {
  config,
  lastRequestNow,
  requestData,
  clearRequestData,
} from "../state.mjs";

import { log, logs } from "./logging.mjs";

import { sendJson, sendText } from "./server-helpers.mjs";

import { suborbital } from "./suborbital.mjs";

polka()
  // Refresh lastRequest on any request
  .use((req, res, next) => {
    lastRequestNow();
    next();
  })

  // Demo config
  .get("/api/config", (req, res) => sendJson(res, config))

  // Demo server request data endpoint
  .get("/api/data", (req, res) => {
    const response = { data: requestData, logs: CONFIG_SENDLOG ? logs : null };

    sendJson(res, response);
  })

  // Demo server full recent logs
  .get("/api/logfile", (req, res) => {
    sendText(res, fullLogs);
  })

  // Configure the suborbital backend
  // receives user (tenant name) and plugin (plugin module name) as JSON
  .post("/api/plugin", async (req, res) => {
    // Poor man's simple JSON payload parser :)
    let pdata = "";
    req.on("data", (d) => (pdata += d.toString()));

    // Wait until full request has been received
    await new Promise((resolve) => req.on("end", resolve));

    const { plugin, user, done } = JSON.parse(pdata);
    config.plugin = plugin;
    config.user = user;

    // Build the ident
    config.ident = config.env + "." + user;

    // Is this an editor token request or a deployment request?
    if (done) {
      // New wasm function was deployed
      config.fn = config.plugin;

      log(`New Wasm plugin for ${config.ident} got deployed: ${plugin}`);

      clearRequestData();
      log(`Request log reset`);
    } else {
      try {
        const tenant = await suborbital.admin.getTenant({
          envToken: config.token,
          environment: config.env,
          tenant: config.user,
        });
        console.log(`tenant.name (${tenant.tenant})`);
      } catch (e) {
        console.log(`The "${config.user}" tenant does not exist yet`);
      }

      // Ensure that the tenant exists
      await suborbital.admin.createTenant({
        envToken: config.token,
        environment: config.env,
        tenant: config.user,
      });

      // Update the builder/tenant session token
      const session = await suborbital.admin.getSessionToken({
        envToken: config.token,
        environment: config.env,
        tenant: config.user,
        namespace: config.namespace,
        plugin: config.plugin,
      });
      config.session = session;

      log(`Plugin for ${config.ident} updated: ${plugin}`);
    }

    // Send back the updated config
    sendJson(res, config);
  })

  // Static files
  .get(
    "*",
    async (req, res) =>
      await handler(req, res, { public: "./www", directoryListing: false })
  )
  .listen(PORT, (err) => {
    if (err) throw err;
    log(`> Proxyz started on http://localhost:${PORT}`);
    log(`> Env: ${config.env}`);
    log(`> Rows: ${CONFIG_MAXROWS}`);
    log(`> Timeout: ${CONFIG_IDLETIMEOUT}`);
    log(`> Updates: ${CONFIG_UPDATEFREQ}ms`);
  });
