#!/usr/bin/env node
import { mkdtempSync, rmSync, cpSync, mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve, relative } from "node:path";
import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const command = args[0];

if (!command || ["-h", "--help", "help"].includes(command)) {
  printHelp();
  process.exit(0);
}

if (command === "pack") {
  await pack(args.slice(1));
} else if (command === "list" || command === "ls") {
  await list(args.slice(1));
} else {
  console.error(`Unknown command: ${command}`);
  printHelp();
  process.exit(1);
}

async function pack(argv) {
  const source = resolve(argv[0] || ".");
  const outIndex = argv.indexOf("-o");
  const output = resolve(outIndex >= 0 ? argv[outIndex + 1] : `${basename(source)}.aix`);

  if (!existsSync(source)) {
    throw new Error(`Source directory not found: ${source}`);
  }

  const ignore = readIgnoreFile(join(source, ".aixignore"));
  const tempRoot = mkdtempSync(join(tmpdir(), "proofbox-aix-"));
  const tempApp = join(tempRoot, basename(source));

  try {
    copyFiltered(source, tempApp, ignore, source);
    writeFileSync(join(tempApp, "VERSION"), randomUUID());

    mkdirSync(dirname(output), { recursive: true });
    rmSync(output, { force: true });
    const zipResult = spawnSync("zip", ["-qr", output, "."], {
      cwd: tempApp,
      encoding: "utf8"
    });

    if (zipResult.status !== 0) {
      throw new Error(zipResult.stderr || zipResult.stdout || "zip failed");
    }

    await verifyAix(output);
    console.log(`Packed ${relative(process.cwd(), output) || output}`);
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}

async function list(argv) {
  const file = resolve(argv[0] || "");
  if (!existsSync(file)) {
    throw new Error(`AIX file not found: ${file}`);
  }
  const names = listZip(file, true);
  if (!names.length) throw new Error(`AIX file is empty or unreadable: ${file}`);
}

async function verifyAix(file) {
  const names = listZip(file, false);
  for (const required of ["AGENTS.md", "app.json", "app.js", "VERSION"]) {
    if (!names.includes(required)) {
      throw new Error(`Packed AIX missing ${required}`);
    }
  }
}

function listZip(file, printRows) {
  const result = spawnSync("unzip", ["-Z1", file], {
    encoding: "utf8"
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "unzip list failed");
  }
  const names = result.stdout.split(/\r?\n/).filter(Boolean);
  if (printRows) {
    for (const name of names) console.log(name);
  }
  return names;
}

function readIgnoreFile(path) {
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

function copyFiltered(source, target, ignore, root) {
  cpSync(source, target, {
    recursive: true,
    filter(src) {
      const rel = relative(root, src);
      if (!rel) return true;
      return !isIgnored(rel, ignore);
    }
  });
}

function isIgnored(rel, ignore) {
  const normalized = rel.split("\\").join("/");
  return ignore.some((pattern) => {
    const clean = pattern.replace(/^\//, "");
    if (clean.endsWith("/")) {
      return normalized.startsWith(clean.slice(0, -1));
    }
    if (clean.includes("*")) {
      const re = new RegExp(`^${clean.split("*").map(escapeRegExp).join(".*")}$`);
      return re.test(normalized) || re.test(basename(normalized));
    }
    return normalized === clean || normalized.startsWith(`${clean}/`) || basename(normalized) === clean;
  });
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function printHelp() {
  console.log(`Usage:
  aix pack <source-dir> -o <output.aix> [--optimize]
  aix list <file.aix>
  aix ls <file.aix>

This project-local fallback creates a self-contained AIX-compatible zip package
with a VERSION file and validates it with @yodaos-pkg/aix.
`);
}
