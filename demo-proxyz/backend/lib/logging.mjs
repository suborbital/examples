// Logging
export let logs = [];

export let fullLogs = "";

export function log(...args) {
  logs.push(args.join(" "));
  console.log(...args);
}

export function clearLogs() {
  // Add logs to full log
  fullLogs += logs.join("\n") + "\n";

  logs.length = 0;
}
