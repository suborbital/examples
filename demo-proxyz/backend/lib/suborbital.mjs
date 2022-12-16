import { Suborbital } from "@suborbital/se2";
import {
  SE2_URI_CONFIG,
  MAX_RETRIES,
  MAX_FAILURES,
  MAX_INFLIGHT,
} from "../config.mjs";

import { config } from "../state.mjs";

import { log } from "./logging.mjs";

let execFailures = 0;
let execInflight = 0;

export const suborbital = new Suborbital(config.token, SE2_URI_CONFIG);

export async function exec(input, retries = MAX_RETRIES) {
  const id = JSON.parse(input).id;
  log(` <${id}> Exec start (inflight: ${execInflight})`);

  let requestTime;
  do {
    // Stop conditions for MAX_INFLIGHT and when config.fn is yanked by another failure
    if (execInflight >= MAX_INFLIGHT) break;
    if (!config.fn) break;

    try {
      requestTime = Date.now();

      ++execInflight;
      const runStart = new Date();
      const result = await suborbital.exec.run(
        {
          identifier: config.ident,
          environment: config.env,
          userId: config.user,
          namespace: config.namespace,
          name: config.fn,
        },
        input
      );

      --execInflight;
      log(` <${id}> Exec completed in ${new Date() - runStart}ms`);
      return result;
    } catch (e) {
      --execInflight;
      const sleep = 1000 + Math.floor(Math.random() * 3000);
      log(
        ` <${id}> ${e.request.path} - ${e.code}: ${e.message} (sleeping ${sleep}ms)`
      );
      log(
        ` <${id}> Failure took ${((Date.now() - requestTime) / 1000).toFixed(
          3
        )}s`
      );

      // Delay before retrying
      await new Promise((resolve) => setTimeout(resolve, sleep));
      log(` <${id}> Resumed`);
    }
  } while (--retries > 0);

  // Fn got yanked
  if (!config.fn) {
    log(` <${id}> Interrupted (fn got yanked)`);
    return false;
  }

  // Retries exhausted
  if (retries <= 0) {
    log(
      ` <${id}> MAX_RETRIES (${MAX_RETRIES}) exhausted, given up (failures: ${execFailures})`
    );
    ++execFailures;

    // Maximum inflight limit trigger
  } else if (execInflight >= MAX_INFLIGHT) {
    log(
      ` <${id}> MAX_INFLIGHT exceeded (${execInflight}), disabling exec(${config.fn})`
    );
    ++execFailures;
  }

  // Execution failures triggerdocker run -it --env SUBORBITAL_TOKEN --env SUBORBITAL_ENV=demo.dev -p 8080:8080 se2-demo

  if (execFailures > MAX_FAILURES) {
    log(
      ` <${id}> MAX_FAILURES exceeded (${execFailures}), disabling exec(${config.fn})`
    );
    config.fn = null;

    return false;
  }

  if (!config.fn) {
    log(` <${id}> Interrupted (fn got yanked)`);
  }
  return false;
}
