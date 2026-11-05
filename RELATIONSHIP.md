# Relationship

| Lane | Repo | Role |
|---|---|---|
| Cursor Toolbelt | AIWander/CPC-Toolbelt | Cursor marketplace plugin |
| Grok companion | AIWander/CPC-Toolbelt-Grok | Grok walkthrough / skills |
| Claude directory | AIWander/CPC-Toolbelt-Claude (this repo) | Claude plugin bundle for directory |
| Suite | AIWander/CPC-Suite | Signed installers for the local package used by Claude Desktop and Codex |
| Protocol | AIWander/GrokCLI | `cpc-*` protocol skills |

Paths are per user. The Hands home resolves at runtime: `HANDS_HOME`, then `CPC_ROOT` or `cpc_root`, then the current user's application-data directory plus `AIWander/Hands`. Cache is `CPC_CACHE` or `cpc_cache`, otherwise `<Hands home>/cache`. This map does not name a developer machine or a private checkout.

Autonomous stays out of free Toolbelt branding. MCP entries in this repo are stdio. Server commands use `${user_config.HANDS_HOME}`. A file that ships in the plugin uses `${CLAUDE_PLUGIN_ROOT}`. There is no shared-host port list.
