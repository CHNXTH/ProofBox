import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { basename, resolve } from "node:path";

const target = resolve(process.argv[2] || "proofbox.aix");

if (!existsSync(target)) {
  console.error(`File not found: ${target}`);
  console.error("Usage: node scripts/md5.mjs path/to/proofbox.aix");
  process.exit(1);
}

const hash = createHash("md5").update(readFileSync(target)).digest("hex");
console.log(`${hash}  ${basename(target)}`);
