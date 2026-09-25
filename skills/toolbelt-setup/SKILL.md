---
name: toolbelt-setup
description: >-
  Configure CPC Toolbelt on Claude after install. Use when enabling the
  plugin, setting CPC_ROOT or CPC_CACHE, checking Hands connectivity, or
  first-run Toolbelt setup on Desktop, Cowork, or Claude Code.
---

# CPC Toolbelt setup (Claude)

## Goal

Confirm the plugin can guide Hands / optional CPC servers without touching Autonomous.

## Steps

1. Read plugin config values `cpc_root` and `cpc_cache` (userConfig). If missing, ask the user to set them to their CPC install root (usually `C:\CPC`) and cache folder (usually `C:\CPC\cache`).
2. Check that `cpc_root/servers/hands.exe` exists when the session can see the local filesystem. If not, tell the user to install CPC Hands first.
3. Confirm an MCP server named something like `hands` or `cpc-hands` is already connected in Claude. This plugin ships **skills**, not a remote public Hands endpoint. Connecting Hands is done in Customize → Connectors or Claude Desktop `mcpServers`.
4. Create `cpc_cache` if missing.
5. Point the user at the `hands-getting-started` skill for the first real automation task.
6. Never add Autonomous, never suggest wiring port `7771`, and never brand this pack as autonomous.

## Done when

- Paths are set
- Hands is connected (or the gap is clearly named)
- User knows the next skill to run
