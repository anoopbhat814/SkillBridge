function log(level, msg, meta = {}) {
  const line = { level, msg, ts: new Date().toISOString(), ...meta };
  (level === "error" ? console.error : console.log)(JSON.stringify(line));
}

export const logger = {
  info: (msg, meta) => log("info", msg, meta),
  warn: (msg, meta) => log("warn", msg, meta),
  error: (msg, meta) => log("error", msg, meta),
};
