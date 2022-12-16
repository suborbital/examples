// last request (timestamp) to the backend
export let lastRequest;
export function lastRequestNow() {
  lastRequest = Date.now();
}

lastRequestNow();

// is currently idling?
export let isIdle;

// configuration

import {
  CONFIG_UPDATEFREQ,
  SUBORBITAL_ENV,
  SUBORBITAL_ENV_TOKEN,
} from "./config.mjs";

export const config = {
  token: SUBORBITAL_ENV_TOKEN,
  session: null,
  updateFreq: CONFIG_UPDATEFREQ,
  env: SUBORBITAL_ENV,
  namespace: "default",
  plugin: null, // the plugin name
  user: null,
  ident: null,
  fn: null, // the active, deployed wasm module
  languages: [
    {
      identifier: "javascript",
      pretty: "JavaScript",
    },
    {
      identifier: "typescript",
      pretty: "TypeScript",
    },
    {
      identifier: "rust",
      pretty: "Rust",
    },
  ],
};

export let requestData;
export function clearRequestData() {
  requestData = [];
}

clearRequestData();
