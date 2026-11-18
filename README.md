# Bird AI Marketplace

Skills and hosted MCP configuration for operating [Bird](https://bird.com) from your coding agent. Your agent drives Bird through the `bird` CLI, and clients that read plugin MCP declarations also register Bird's hosted MCP server at `https://mcp.bird.com`.

## Quick start

Install the `bird` CLI and sign in with your browser:

```bash
curl -fsSL https://cli.bird.com/install.sh | sh
bird auth login
```

On macOS or Linux, you can also install with Homebrew: `brew install messagebird/tap/bird`.

### Agent-driven setup prompt

Paste this prompt into your coding agent, substituting your client's skill-install step from the sections below for step 3:

```text
Set Bird up for me end to end:
1. Install the Bird CLI: run `curl -fsSL https://cli.bird.com/install.sh | sh`.
2. Sign me in: run `bird auth login` and open the browser link for me.
3. Install Bird's skills for this client using the instructions in github.com/messagebird/bird-ai.
4. Confirm my account email with `bird whoami`.
5. Send a test email to my `bird whoami` address from onboarding@messagebird.dev (subject "Your Bird account is ready", body "You're set up and ready to send.") and check it with `bird email get`.
```

## Create a Bird account from the terminal

If you do not have a Bird account yet, an agent can create one without a password while the account owner reviews the Terms in a browser:

```bash
# 1. Request a six-digit verification code by email.
bird auth signup you@example.com

# 2. Exchange the emailed code for a single-use onboarding ticket.
bird auth verify-email you@example.com --code 123456

# 3. Inspect the current Terms URL and version for the organization owner to review.
bird auth terms

# 4. Create the organization and workspace in us1 or eu1 once the owner agrees.
bird auth create-org "Acme" --workspace-name "Production" --region us1 --onboarding-ticket obt_... --accept-terms 2024-11-21

# 5. Verify the stored credential.
bird auth status
```

Pass `--accept-terms` only after the organization owner agrees to the Terms (`create-org` returns `E02100` when acceptance is missing). Append `--help`, `--example`, or `--response-schema` to inspect any step before authenticating. See [Self-serve signup](https://bird.com/docs/ai/self-serve-signup) for the full walkthrough.

## Client setup

### Agent Plugins 1.0 clients

`plugins/bird` includes portable `plugin.json` and `mcp.json` manifests following [Agent Plugins](https://agent-plugins.org/specification). Point any compatible client at `github.com/messagebird/bird-ai` (`plugins/bird`) to install skills and the hosted MCP server together, then complete the OAuth browser sign-in when prompted.

### Claude Code

```bash
claude plugin marketplace add messagebird/bird-ai
claude plugin install bird@bird-ai
```

**MCP server:** Registered automatically at `https://mcp.bird.com`. Run `/mcp`, select `bird`, and choose **Authenticate** (or run `claude mcp login bird` before headless `claude -p` sessions) to complete browser OAuth consent.

### Cursor

Add `messagebird/bird-ai` under **Settings** > **Plugins** (or copy the skill files into `.cursor/rules/` as `.mdc` files), then register the hosted MCP server in `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "bird": { "url": "https://mcp.bird.com" }
  }
}
```

Open **Customize** > **MCPs** in the Cursor sidebar and complete the browser sign-in for `bird`.

### Codex

```bash
codex plugin marketplace add messagebird/bird-ai
codex plugin add bird@bird-ai
codex mcp login bird
```

The plugin registers `https://mcp.bird.com` automatically, and `codex mcp login bird` completes browser OAuth consent.

### GitHub Copilot

```bash
copilot plugin marketplace add messagebird/bird-ai
copilot plugin install bird@bird-ai
```

Add `.vscode/mcp.json` to register the hosted MCP server:

```json
{
  "servers": {
    "bird": { "type": "http", "url": "https://mcp.bird.com" }
  }
}
```

Trust the server when VS Code prompts you and approve Bird's consent screen in your browser (or start `bird` from **MCP: List Servers**; manage grants under **Accounts** > **Manage Trusted MCP Servers**).

### Factory Droid

```bash
git clone https://github.com/messagebird/bird-ai
cp -r bird-ai/plugins/bird/skills/. .factory/skills/
droid mcp add bird https://mcp.bird.com --type http
```

Run `/mcp` inside Droid to complete browser OAuth sign-in.

### OpenCode

```bash
opencode plugin github:messagebird/bird-ai --global
opencode mcp auth bird
```

Restart OpenCode after installing the plugin. By default, the plugin connects to `https://mcp.bird.com/dynamic` (`search` and `execute`) and prompts before `bird_execute` mutations; when `OPENCODE_EXPERIMENTAL_CODE_MODE=1` (or `OPENCODE_EXPERIMENTAL=1`) is enabled, it connects to the full catalog at `https://mcp.bird.com` and prompts before `bird_*` calls unless overridden in `opencode.json`.

### Google Antigravity

Install with Antigravity CLI or the standalone installer script:

```bash
agy plugin install https://github.com/messagebird/bird-ai
# Or without Antigravity CLI (pass `bash -s -- --project` for `.agents/plugins/bird`):
curl -fsSL https://raw.githubusercontent.com/messagebird/bird-ai/main/antigravity.sh | bash
```

**MCP server:** Open **Customizations** in the sidebar (or **Agent settings** via `Cmd+,` / `Ctrl+,` in the IDE), select **Authenticate** next to `bird` (restart Antigravity if `bird` is not yet listed), approve Bird's browser consent screen, and paste the authorization code back into Antigravity. See [Antigravity plugins](https://antigravity.google/docs/plugins/) for local plugin details.

## Included in the `bird` plugin

- **`bird-cli`**: Terminal workflows across messaging channels, sender setup, OTP verification, lookup, contacts, audiences, preferences, Realtime, webhooks, API keys, support tickets, and docs search.
- **`email-audit`**: DNS-only inspection and prioritized remediation for DMARC, SPF, DKIM, BIMI, and MX records.
- **Hosted Bird MCP server (`https://mcp.bird.com`)**: OAuth-authenticated MCP access without static API keys.

## License

[MIT](./LICENSE).
