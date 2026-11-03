---
name: toolbelt-setup
description: >-
  Configure CPC Toolbelt on Claude after install. Use when enabling the
  plugin, setting HANDS_HOME or CPC_CACHE, checking Hands connectivity, or
  first-run Toolbelt setup on Desktop, Cowork, or Claude Code.
---

# CPC Toolbelt setup (Claude)

Run the `getting-started` skill first if `hands_setup_status` has not been called this session.

## Fixed pack (v0.1)

- Wire MCP: `cpc-hands` only, stdio, command `${user_config.HANDS_HOME}/servers/hands.exe`
- A file that ships in this plugin uses `${CLAUDE_PLUGIN_ROOT}`
- Cache: `CPC_CACHE` or `cpc_cache` if set, otherwise `<Hands home>/cache`. Skills only. **No** `cpc-cache` MCP server

## Ask the user

1. Confirm the Hands home: `HANDS_HOME`, else `CPC_ROOT` or `cpc_root` when they still use that name, else `%LOCALAPPDATA%\AIWander\Hands` (the current user's application-data directory plus `AIWander/Hands` when `LOCALAPPDATA` is unset).
2. Confirm Cache: `CPC_CACHE` or `cpc_cache`, or `<Hands home>/cache` when they have not set one.
3. Optional yes/no: Voice, Workflow, Manager.

When the shell can see the plugin, run `node ${CLAUDE_PLUGIN_ROOT}/scripts/resolve-paths.cjs` and use that JSON instead of guessing.

Write `HANDS_HOME` into plugin userConfig when you know the directory so the stdio command expands. If this host cannot expand variables, put the resolved stdio command only in the user's private MCP config. Never commit that path.

## Enable optionals

Merge entries from `mcp.optionals.example.json` only for accepted optionals. Those entries stay stdio and use `${user_config.HANDS_HOME}` or `${CLAUDE_PLUGIN_ROOT}`. They must not contain an absolute path.

## Do not

- Do not add Programmer unless the user explicitly asks. It is not part of this pack.
- Do not brand this pack as autonomous.
- Do not invent a Cache MCP binary.
- Do not publish a port map or a public URL.
- Do not create the Cache directory unless the user says yes.
