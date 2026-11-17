#!/usr/bin/env node
// Builds grouped release notes from conventional-commit subjects read on stdin.
const lines = require("fs").readFileSync(0, "utf8").split("\n").filter(Boolean);
const groups = { feat: "Features", fix: "Fixes", perf: "Performance", docs: "Docs" };
const out = {};

for (const line of lines) {
  const m = /^(\w+)(?:\(([^)]+)\))?!?: (.+)$/.exec(line);
  if (!m || !groups[m[1]]) continue;
  (out[m[1]] ||= []).push(m[2] ? `**${m[2]}**: ${m[3]}` : m[3]);
}

for (const [type, title] of Object.entries(groups)) {
  if (!out[type]) continue;
  console.log(`### ${title}`);
  out[type].forEach((l) => console.log(`- ${l}`));
  console.log();
}
