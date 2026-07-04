import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const requiredRootFiles = ["AGENTS.md", "app.js", "app.json", "app.wxss"];
const errors = [];

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    errors.push(`Invalid JSON: ${path} (${error.message})`);
    return null;
  }
}

for (const file of requiredRootFiles) {
  const path = join(root, file);
  if (!existsSync(path)) errors.push(`Missing root file: ${file}`);
}

const appJson = readJson(join(root, "app.json"));
if (appJson) {
  if (!Array.isArray(appJson.pages) || appJson.pages.length === 0) {
    errors.push("app.json must contain a non-empty pages array");
  } else {
    for (const page of appJson.pages) {
      for (const ext of [".js", ".wxml", ".wxss", ".json"]) {
        const file = join(root, `${page}${ext}`);
        if (!existsSync(file)) errors.push(`Missing page file: ${page}${ext}`);
        if (ext === ".json" && existsSync(file)) readJson(file);
      }
    }
  }
}

const jsFiles = [
  "app.js",
  "utils/flowPresets.js",
  "utils/evidenceStore.js",
  "utils/summary.js",
  "utils/device.js",
  "pages/index/index.js",
  "pages/flow/index.js",
  "pages/summary/index.js"
];

for (const file of jsFiles) {
  const path = join(root, file);
  if (!existsSync(path)) {
    errors.push(`Missing JS file: ${file}`);
    continue;
  }
  const result = spawnSync(process.execPath, ["--check", path], {
    encoding: "utf8"
  });
  if (result.status !== 0) {
    errors.push(`Syntax error in ${file}:\n${result.stderr || result.stdout}`);
  }
}

const agents = readFileSync(join(root, "AGENTS.md"), "utf8");
for (const keyword of ["start_unboxing_flow", "capture_evidence", "mark_abnormal", "record_sn"]) {
  if (!agents.includes(keyword)) errors.push(`AGENTS.md missing tool contract: ${keyword}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("ProofBox AIUI project check passed.");
