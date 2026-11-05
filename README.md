# CPC Toolbelt for Claude

**Publisher:** AIwander  
**Tagline:** Tools Claude reaches for when you ask

This repository is a **Claude directory plugin bundle** (skills, stdio MCP entries, and setup guidance) for Copy Paste Compute (CPC). It is the Claude face of the same Toolbelt lane as the Cursor plugin and the Grok companion.

## What you get

| Piece | How it ships (v0.1) |
|---|---|
| Hands | Stdio MCP `cpc-hands`, started by `scripts/launch-hands.cjs` |
| Cache | `CPC_CACHE` if set, otherwise `<Hands home>/cache`. Plugin userConfig plus skills. **No Cache MCP** |
| Workflow / Manager / Voice | Getting-started skills. Optional stdio servers live in `mcp.optionals.example.json` and stay off until you merge them |
| Programmer | **Not** in this pack |
| Autonomous | **Not** included. Do not brand this pack as autonomous |

This plugin does **not** ship compiled MCP binaries and does **not** send your files to AIwander. Hands and other CPC servers run on your machine. Claude loads the skills and the configuration values you set.

## Paths

The launcher runs `scripts/resolve-paths.cjs` each time Hands starts.

1. **Hands home:** `HANDS_HOME` if set, else `CPC_ROOT` or `cpc_root` (older installs), else `%LOCALAPPDATA%\AIWander\Hands`. When `LOCALAPPDATA` is unset, that is the current user's application-data directory plus `AIWander/Hands`.
2. **Cache:** `CPC_CACHE` or `cpc_cache` if set, else `<Hands home>/cache`.
3. **Binaries:** `<Hands home>/servers/<name>.exe`.

`CPC_ROOT` and `CPC_CACHE` are back-compat. Leave them empty on a new install. There is no fixed-drive fallback.

Leave the `HANDS_HOME` plugin option blank to use the existing `CPC_ROOT` environment variable, the saved `cpc_root` plugin option, or the default. Set `HANDS_HOME` only to override that location.

## Requirements

1. Hands installed under the resolved Hands home (`servers/hands.exe`).
2. Claude Code with Node.js (`node` on its PATH) to run the bundled launcher. For a manually configured local connector in Claude Desktop or Cowork, use the resolved Hands executable path in the private connector config.
3. `HANDS_HOME` set when you want to override the runtime default. `CPC_CACHE` only when Cache should not live under that home.

## Install (directory)

1. Open [claude.ai/directory/manage](https://claude.ai/directory/manage) (or find **CPC Toolbelt** in the Claude directory once published).
2. Add the plugin. Leave Hands home empty to use the runtime default, or set it to the directory the resolver reports.
3. Run the `getting-started` skill. It calls `hands_setup_status` before any other Hands tool.
4. Confirm `cpc-hands` is connected. Claude Code starts `.mcp.json` when the plugin is enabled. For a manual connector, run `node scripts/resolve-paths.cjs` from the plugin folder and use the reported `handsExe` in your private connector config.

## Install (local / Claude Code)

```bash
node scripts/validate.mjs
claude plugin validate .
claude --plugin-dir .
```

Or copy / clone this repo and load it with `--plugin-dir` while developing.

From the plugin root, `node scripts/resolve-paths.cjs` prints the Hands home and Cache it resolved. In a skill, that script is `${CLAUDE_PLUGIN_ROOT}/scripts/resolve-paths.cjs`.

## MCP transport

Every MCP server shipped here is **stdio**. See `.mcp.json` and `mcp.optionals.example.json`.

- Hands runs through the bundled launcher at `${CLAUDE_PLUGIN_ROOT}/scripts/launch-hands.cjs`.
- Optional examples use `${user_config.HANDS_HOME}`. Fill the plugin option before using those examples.

This pack does not publish a shared-host port map. Remote use, when you need it, is a private tunnel you sign into yourself. The `getting-started` skill walks through that. There is no public link by default.

## Privacy

- Skills instructions stay on-device with Claude.
- `HANDS_HOME`, `CPC_ROOT`, and `CPC_CACHE` are local paths you configure. They are not uploaded to AIwander.
- MCP traffic goes to the stdio servers **you** configure. Review those servers' own policies.
- We do not collect analytics inside this plugin package.

Privacy policy URL for directory listings: https://aiwander.ai/privacy (update if your live policy page differs).

## Related

- Cursor plugin: https://github.com/AIWander/CPC-Toolbelt
- Grok companion: https://github.com/AIWander/CPC-Toolbelt-Grok
- Codex plugin: https://github.com/AIWander/CPC-Toolbelt-Codex
- Protocol skills: https://github.com/AIWander/GrokCLI
- Human tour: https://github.com/AIWander/StartHERE

## License

Apache-2.0 — see `LICENSE`.

## Validate

```bash
node scripts/validate.mjs
```
