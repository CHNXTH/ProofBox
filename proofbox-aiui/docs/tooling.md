# AIUI Tooling Notes

## Installed

- `@yodaos-pkg/aix@0.6.0` is installed as a dev dependency.
- This official package is an AIX reader/inspector library. It does not expose a command-line binary and therefore does not install an `aiui-aix` command.

## Verified Locally

```bash
npm run check
```

The local project structure and JavaScript syntax checks pass.

## Official AIX Packaging Command

The Rokid AIUI tutorial describes this command:

```bash
aix pack proofbox-aiui -o proofbox.aix --optimize
```

At the time of this setup, the official `aix` CLI source is not available in the public `jsar-project/AIUI` `main` or `v0.1.0` refs, and the public repository does not currently include `packages/aix-cli`.

Use the official Rokid offline `aiui-aix.zip` tool package when it is available from the Rokid developer portal, then add its executable directory to `PATH` and run the command above from the workspace root.

## Local Fallback CLI

This project includes a local fallback command that supports `pack` and `list`.
It creates a self-contained AIX-compatible zip package, writes a UUID `VERSION`
file, respects `.aixignore`, and validates the result with `@yodaos-pkg/aix`.

From `proofbox-aiui`:

```bash
npm run pack:aix
npm run list:aix
```

Current generated package:

```text
../proofbox.aix
```

Current MD5:

```text
b6479dd120847e24e3a16e8788f84e51
```

## Current Portable Package

Until the official packer is installed, the source development package is:

```text
../proofbox-aiui-dev.zip
```

Regenerate it from git with `git archive` whenever the source changes.
