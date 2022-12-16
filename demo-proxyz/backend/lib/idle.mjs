import { CONFIG_IDLETIMEOUT } from "../config.mjs";
import { isIdle, lastRequest } from "../state.mjs";

isIdle = false;
lastRequest = Date.now();

const IDLE_INTERVAL = 10 * 1000;
const IDLE_THRESHOLD = CONFIG_IDLETIMEOUT * 1000;

// Put the generator process in sleep when the client (browser)
// has been inactive for a while
setInterval(() => {
  if (Date.now() - lastRequest > IDLE_THRESHOLD) {
    if (!isIdle) {
      log("No recent interactions, sleeping.");
      isIdle = true;
    }
  } else {
    if (isIdle) {
      log("Recently queried, waking up generator, clearing log.");
      isIdle = false;
      logs = [];
      fullLogs = "";
    }
  }
}, IDLE_INTERVAL);
