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
aiui-aix pack --optimize -o proofbox.aix proofbox-aiui
```

At the time of this setup, `aiui-aix` is not available on this machine, not published as an npm CLI under `aiui-aix`, and the public `jsar-project/AIUI` repository does not currently include `packages/aix-cli`.

Use the official Rokid offline `aiui-aix.zip` tool package when it is available from the Rokid developer portal, then add its executable directory to `PATH` and run the command above from the workspace root.

## Current Portable Package

Until the official packer is installed, the source development package is:

```text
../proofbox-aiui-dev.zip
```

Regenerate it from git with `git archive` whenever the source changes.
