# Submit to Claude directory

Portal: https://claude.ai/directory/manage/new/plugin
Docs: https://claude.com/docs/plugins/submit
Connectors directory (separate MCP listing): https://claude.com/docs/connectors/directory
Blog: https://claude.com/blog/build-plugins-for-claude

## What this repo is

**Plugin bundle** (skills + `userConfig` + stdio `.mcp.json`), not a remote MCP connector.

- Repository: `https://github.com/AIWander/CPC-Toolbelt-Claude`
- Plugin path: repository root (contains `.claude-plugin/plugin.json`)
- Manifest name: `aiwander-cpc-toolbelt`

## Preflight

```bash
node scripts/validate.mjs
claude plugin validate .
```

Then in the portal: Submit new → **Plugin bundle** → paste repo URL → **Validate**.

## Listing copy (from README / plugin.json)

- Display name: CPC Toolbelt
- Short description: AIwander CPC tools for Claude: Hands automation skills, optional Workflow / Manager / Voice guidance, and Cache path setup. Does not include Autonomous.
- Author: AIwander / contact@aiwander.ai
- Homepage: https://aiwander.ai
- License: Apache-2.0

## Data handling answers (suggested)

| Question | Suggested answer |
|---|---|
| Reads or stores personal data? | Only local paths the user configures (`HANDS_HOME`, optional `CPC_ROOT` and `CPC_CACHE`). Empty values resolve on the machine at runtime. Skills run in Claude; no AIwander backend in this package. |
| Sends data to services other than declared connectors? | No. Any MCP traffic goes to the stdio servers the user already configured (local Hands). |
| Retention | No plugin-side retention. |
| Under 18? | No. |

## Not in this submission

- Remote Hands HTTPS connector (submit separately under **MCP connector** when you have a public `https://` endpoint + OAuth/privacy docs).
- Autonomous. It is a separate product and is not wired into this pack. This pack does not publish a port list.
- Programmer as a default MCP.
- Compiled `hands.exe` binaries inside the plugin folder.

## After Validate passes

Complete Data handling → Compliance acknowledgements → Submit for review → Publish when cleared.
