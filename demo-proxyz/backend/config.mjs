export const PORT = process.env.PORT ?? 8080;

const envMaxRows = parseInt(process.env.CONFIG_MAXROWS);
export const CONFIG_MAXROWS = envMaxRows > 0 ? envMaxRows : 12;

export const CONFIG_SENDLOG = process.env.CONFIG_SENDLOG
  ? process.env.CONFIG_SENDLOG === "1" || process.env.CONFIG_SENDLOG === "true"
  : true;

export const CONFIG_IDLETIMEOUT =
  parseInt(process.env.CONFIG_IDLETIMEOUT) || 60;
export const CONFIG_UPDATEFREQ =
  parseInt(process.env.CONFIG_UPDATEFREQ) || 1000;

export const SUBORBITAL_ENV = process.env.SUBORBITAL_ENV;
export const SUBORBITAL_ENV_TOKEN = process.env.SUBORBITAL_TOKEN;

export const SE2_URI_CONFIG = {
  adminUri: "https://api.stg.suborbital.network",
  execUri: "https://edge.stg.suborbital.network",
  builderUri: "https://builder.stg.suborbital.network",
};

// Exec error related limits
export const MAX_RETRIES = 3;
export const MAX_FAILURES = 0;
export const MAX_INFLIGHT = 5;
