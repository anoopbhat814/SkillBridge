#!/usr/bin/env node
// Verifies that every key in .env.example is defined in the current environment.
const fs = require("fs");
const path = require("path");

const example = fs.readFileSync(path.join(__dirname, "..", ".env.example"), "utf8");
const keys = example
  .split("\n")
  .filter((l) => l.trim() && !l.startsWith("#"))
  .map((l) => l.split("=")[0]);

const missing = keys.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing environment variables:\n  ${missing.join("\n  ")}`);
  process.exit(1);
}
console.log(`All ${keys.length} environment variables are set.`);
