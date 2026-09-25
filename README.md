# CPC Toolbelt for Claude

**Publisher:** AIwander  
**Tagline:** Tools Claude reaches for when you ask

This repository is a **Claude directory plugin bundle** (skills + setup guidance) for Copy Paste Compute (CPC). It is the Claude face of the same Toolbelt lane as the Cursor plugin and the Grok companion.

## What you get

| Piece | How it ships (v0.1) |
|---|---|
| Hands | Skills that teach safe browser / desktop / vision automation once Hands is connected in Claude |
| Cache | Path `CPC_CACHE` (suggest `C:\CPC\cache`) via plugin `userConfig` + setup skill — **no Cache MCP** |
| Workflow / Manager / Voice | Getting-started skills (optional; connect those MCP servers on your host if you use them) |
| Programmer | **Not** in this pack — directed only |
| Autonomous | **Not** included — paid wedge elsewhere |

This plugin does **not** ship compiled MCP binaries and does **not** send your files to AIwander. Hands and other CPC servers run on your machine (or your own remote connector). Claude only loads the skills and the configuration values you set.

## Requirements

1. A Windows host with CPC installed (Hands at `%CPC_ROOT%\servers\hands.exe`, cache folder at `%CPC_CACHE%`).
2. Hands (and any optionals you want) already connected in Claude Desktop / Claude Code / Cowork as MCP servers — for example via the local suite shared-http shims or stdio `hands.exe`.
3. Plugin variables `cpc_root` and `cpc_cache` set when Claude prompts for them.

## Install (directory)

1. Open [claude.ai/directory/manage](https://claude.ai/directory/manage) (or find **CPC Toolbelt** in the Claude directory once published).
2. Add the plugin, set **CPC install root** and **Cache path**.
3. Confirm Hands is connected under Customize → Connectors (or your Desktop MCP config).
4. Ask Claude to run the Hands getting-started skill, or say you want a Hands workflow.

## Install (local / Claude Code)

```bash
claude plugin validate .
claude --plugin-dir .
```

Or copy / clone this repo and load it with `--plugin-dir` while developing.

## Privacy

- Skills instructions stay on-device with Claude.
- `cpc_root` and `cpc_cache` are local paths you configure; they are not uploaded to AIwander.
- MCP traffic goes to the servers **you** configure (local `hands.exe` or your HTTPS connector). Review those servers' own policies.
- We do not collect analytics inside this plugin package.

Privacy policy URL for directory listings: https://aiwander.ai/privacy (update if your live policy page differs).

## Related

- Cursor plugin: https://github.com/AIWander/CPC-Toolbelt
- Grok companion: https://github.com/AIWander/CPC-Toolbelt-Grok
- Protocol skills: https://github.com/AIWander/GrokCLI
- Human tour: https://github.com/AIWander/StartHERE

## License

Apache-2.0 — see `LICENSE`.
