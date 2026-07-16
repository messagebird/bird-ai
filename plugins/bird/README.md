# bird

Drive the Bird platform from your coding agent.

## Skills

- **`bird-cli`** — operate the Bird API from the terminal with the `bird` CLI: send and inspect email, manage sending domains and webhook endpoints, check CLI auth, and create a new Bird account from scratch (browserless [self-serve signup](https://bird.com/docs/ai/self-serve-signup)). Install the CLI with `curl -fsSL https://cli.platform.bird.com/install.sh | sh`.

## MCP server

The plugin also declares Bird's hosted MCP server at `https://mcp.platform.bird.com` — a remote (Streamable HTTP) server with a browser OAuth sign-in, no API key. On Claude Code, installing the plugin connects it automatically. On other clients, add it to your MCP config by hand; see the [marketplace README](../../README.md#mcp-server-support).

## Install

See the [marketplace README](../../README.md) for per-tool install steps.
