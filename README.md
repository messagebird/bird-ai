# Bird AI Marketplace

Skills, agents, and commands for driving the [Bird](https://bird.com) platform from your coding agent. Install the `bird` plugin and your agent can operate the Bird API directly.

> This marketplace is generated inside Bird's internal monorepo, which is the single source of truth; this repository tracks tagged releases. `make generate` won't work from a clone here.

## Install

### Claude Code

```text
/plugin marketplace add messagebird/bird-ai
/plugin install bird
```

### Cursor

```text
/add-plugin bird
```

### Codex

```bash
codex plugin marketplace add messagebird/bird-ai
```

Then launch `codex`, run `/plugins`, find the **bird-ai** marketplace, and install the **bird** plugin. Codex installs the skills natively from the plugin manifest.

### GitHub Copilot / Factory Droid

```text
/plugin marketplace add messagebird/bird-ai
/plugin install bird@bird-ai
```

Copilot and Droid read the Claude-compatible plugin manifest directly — no extra step.

## What's in the `bird` plugin

- **`bird-cli`** — operate the Bird API from the terminal with the `bird` CLI: send and inspect email, manage sending domains and webhook endpoints, and check CLI auth.
- **Bird MCP server** — the hosted server at `https://mcp.platform.bird.com`, so your agent can call Bird directly (send email, manage domains, inspect your workspace) with a browser sign-in and no API key.

## MCP server support

The hosted MCP server is a URL plus a browser OAuth sign-in — no install, no secret to paste. Whether installing the plugin also wires it up depends on the client:

| Client         | Skills                  | MCP server                                                           |
| -------------- | ----------------------- | -------------------------------------------------------------------- |
| Claude Code    | Installed by the plugin | **Bundled** — connects to `https://mcp.platform.bird.com` on install |
| Cursor         | Installed by the plugin | Add the remote server once (see below)                               |
| Codex          | Installed by the plugin | Add the remote server once (see below)                               |
| GitHub Copilot | Installed by the plugin | Add the remote server once (see below)                               |
| Factory Droid  | Installed by the plugin | Add the remote server once (see below)                               |

Only Claude Code lets a plugin declare a remote MCP server, so the other clients install the skills from the plugin and connect the MCP server with a one-time config. Point the client's MCP config at `https://mcp.platform.bird.com`:

- **Cursor** (`~/.cursor/mcp.json`): `{ "mcpServers": { "bird": { "url": "https://mcp.platform.bird.com" } } }`
- **VS Code / Copilot** (`.vscode/mcp.json`): `{ "servers": { "bird": { "type": "http", "url": "https://mcp.platform.bird.com" } } }`
- **Codex** (`~/.codex/config.toml`): `[mcp_servers.bird]` with `url = "https://mcp.platform.bird.com"`
- **Droid** (`.factory/mcp.json`): `{ "mcpServers": { "bird": { "type": "http", "url": "https://mcp.platform.bird.com" } } }`

## License

[MIT](./LICENSE).
