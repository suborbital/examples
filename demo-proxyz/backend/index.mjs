#!/bin/env node
import { makeUpARequest } from "./lib/requests.mjs";
import { log } from "./lib/logging.mjs";
import { exec } from "./lib/suborbital.mjs";

import { CONFIG_MAXROWS } from "./config.mjs";

import { config, isIdle, requestData, clearRequestData } from "./state.mjs";

import "./lib/suborbital.mjs";

import "./lib/server.mjs";

let data = [];

const reqSpdMin = 0.2;
const reqSpdMax = 1;

// When to generate the next request
const nextReq = () =>
  Math.floor((reqSpdMin + (reqSpdMax - reqSpdMin) * Math.random()) * 1000);

newReq("now");

function newReq(now = false) {
  const next = now ? 0 : nextReq();

  if (isIdle) {
    // Don't generate requests in idle mode
    setTimeout(newReq, IDLE_INTERVAL);
  } else {
    // Generate more requests
    setTimeout(getReq, next);
  }
}

function getReq() {
  // Add a new request
  const { request } = makeUpARequest();
  requestData.push(request);
  log(
    `${request.request_start.toISOString()} [${request.id}] ${request.method} ${
      request.status
    } ${request.uri}`
  );

  // Pipe it through the Wasm handler
  if (config.ident && config.fn) {
    exec(JSON.stringify(request)).then((wasmresult) => {
      // Run succeeded?
      if (wasmresult) {
        const tags = wasmresult.result;

        // New tags!
        if (tags?.length) {
          // Update the request (if it's already discarded in requestData, it will be gc-d after this anyway)
          request.tags = tags;

          log(`${new Date().toJSON()} [${request.id}] >> ${tags.join(", ")}`);
        }
      }
    });
  }

  // keep request data CONFIG_MAXROWS long (FIFO)
  if (requestData.length > CONFIG_MAXROWS) {
    const lastRequests = requestData.slice(-CONFIG_MAXROWS);
    clearRequestData();
    requestData.push(...lastRequests);
  }

  // Schedule another request
  newReq();
}
