---
name: getting-started
description: Use when installing CPC Toolbelt, connecting Hands for the first time, or reaching Hands from another device. Call hands_setup_status before any other Hands tool.
---

# Getting started

Call `hands_setup_status` before any other Hands tool. Use that report for the install home, whether Hands is reachable, and whether a private tunnel is already configured. Do not guess those facts. If the tool is missing, say so and continue with the local stdio checks below.

`hands-getting-started` is the tool tour. This skill is the setup flow. Do not replace the tour.

## Paths

Resolve these at runtime. Do not invent a drive letter or a home directory. When you can run a command, run `node ${CLAUDE_PLUGIN_ROOT}/scripts/resolve-paths.cjs` and use that JSON.

1. Hands home: `HANDS_HOME` if set, else `CPC_ROOT` or `cpc_root` (back-compat), else `%LOCALAPPDATA%\AIWander\Hands`. When `LOCALAPPDATA` is unset, use the current user's application-data directory plus `AIWander/Hands`.
2. Cache: `CPC_CACHE` or `cpc_cache` if set, else `<Hands home>/cache`.
3. Hands binary: `<Hands home>/servers/hands.exe` (or the executable `hands_setup_status` reports).

The bundled stdio launcher resolves the Hands executable at startup. Confirm that `node` is on Claude Code’s PATH. Set the `HANDS_HOME` plugin option only to override the resolved home. For a manually configured connector, put the resolved executable path in the private MCP config.

## Wire Hands

- Transport is stdio. One server: `cpc-hands`, from `.mcp.json`.
- The command is an install-time path (`${user_config.HANDS_HOME}`) or, for a file that ships in this plugin, `${CLAUDE_PLUGIN_ROOT}`.
- Do not add a URL, a published port, or a second copy of Hands.
- Confirm `cpc-hands` is listed under Available Tools.
- Cache is a directory plus skills. There is no `cpc-cache` MCP server in v1.

## Private tunnel (only if they need remote access)

If `hands_setup_status` says Hands is local-only and the user wants another device to reach this host, walk them through a private tunnel. Suggest Tailscale first. Another private mesh or an SSH tunnel is fine when they already use one.

- The user installs the client and signs in themselves, in their own browser or system prompt.
- The user signs in themselves. Never store keys, tokens, or passwords, and never ask them to paste those into chat.
- Do not enable a public URL, a funnel, or an internet-open listener. The default is a private network that only their own devices join.
- After they finish sign-in, call `hands_setup_status` again and report what it returns.

Skip the tunnel when they only use Hands on this machine.

## Do not

- Do not brand Toolbelt or Hands as autonomous, unattended, or hands-off.
- Do not add Programmer, Voice, Workflow, or Manager here. Use `toolbelt-setup` only after the user opts in. Programmer is not part of this pack.
- Do not create the Cache directory unless the user says yes.
