# bird

Drive the Bird platform from your coding agent.

## Skills

- **`bird-cli`** — operate the Bird API from the terminal with the `bird` CLI: send and inspect email, manage sending domains and webhook endpoints, check CLI auth, and create a new Bird account from scratch (browserless [self-serve signup](https://bird.com/docs/ai/self-serve-signup)). Install the CLI with `curl -fsSL https://cli.bird.com/install.sh | sh`.

## MCP server

The plugin also declares Bird's hosted MCP server at `https://mcp.bird.com`, a remote (Streamable HTTP) server with a browser OAuth sign-in, no API key. Installing the plugin registers it for you on Claude Code, and on any client that reads the Agent Plugins `mcp.json` this plugin ships. Elsewhere, add it to your MCP config by hand.

Registering the server is not the same as authenticating it. The server is OAuth-gated, so sign in once per client: in Claude Code run `/mcp`, select `bird`, and choose **Authenticate**, then approve Bird's consent screen in the browser. Until you do, the tools are listed and every call fails. Per-client steps are in the [marketplace README](../../README.md).

## Install

This plugin follows [Agent Plugins](https://agent-plugins.org/specification): a client that implements the specification installs it from `github.com/messagebird/bird-ai` as it is, skills and MCP server together. See the [marketplace README](../../README.md) for per-tool install steps.
