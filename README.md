# Bird AI Marketplace

Skills for driving the [Bird](https://bird.com) platform from your coding agent. Your agent operates Bird through the `bird` CLI; the `bird` plugin in this marketplace installs the skills that teach it Bird's workflows. On Claude Code it also wires up Bird's hosted MCP server.

## Quick start

Every client starts the same way: install the CLI and sign in.

```bash
curl -fsSL https://cli.platform.bird.com/install.sh | sh   # install the bird CLI
bird auth login                                            # sign in (browser, no API key)
```

On macOS or Linux you can also install with Homebrew: `brew install messagebird/tap/bird`.

Then jump to your client below. The fastest path is to paste the setup prompt and let your agent do the rest; a manual path is under each one.

## No Bird account yet?

`bird auth login` signs in to an account you already have. An agent with no account can create one itself from the terminal, no browser needed: `bird auth signup` emails a six-digit code, `bird auth verify-email` exchanges it for a single-use ticket, and `bird auth create-org` mints and stores the credential. Set `BIRD_API_URL` to your region's host first (e.g. `https://us1.platform.bird.com`). Full walkthrough: [Self-serve signup](https://bird.com/docs/ai/self-serve-signup).

## Claude Code

Paste this prompt into Claude Code and it installs the CLI, signs you in, installs the skills, and sends a test email:

```text
Bird is an infrastructure platform that makes it easy to send email to your users. Set Bird up for me, end to end.
1. Install the Bird CLI: run `curl -fsSL https://cli.platform.bird.com/install.sh | sh`.
2. Sign me in: run `bird auth login` and open the browser link for me.
3. Install Bird's skills so you know the workflows: run `claude plugin marketplace add messagebird/bird-ai`, then `claude plugin install bird@bird-ai`.
4. Confirm who I am: run `bird whoami`, which prints the email of the account you're acting as.
5. Send me a test email so I see it land in my own inbox: use my address from `bird whoami` as the recipient, send from onboarding@messagebird.dev, then confirm delivery with `bird email get`. Subject: "Your Bird account is ready". Body: "You're set up and ready to send. This email is the proof. Cheers, The Bird team".
Then let's discuss next steps, given what Bird can do.
```

Or install the plugin manually:

```bash
claude plugin marketplace add messagebird/bird-ai
claude plugin install bird@bird-ai
```

**MCP server:** installing the plugin connects Bird's hosted server at `https://mcp.platform.bird.com` automatically. Nothing else to configure.

## Cursor

Paste this prompt into Cursor:

```text
Bird is an infrastructure platform that makes it easy to send email to your users. Set Bird up for me, end to end.
1. Install the Bird CLI: run `curl -fsSL https://cli.platform.bird.com/install.sh | sh`.
2. Sign me in: run `bird auth login` and open the browser link for me.
3. Give yourself Bird's skills (Cursor installs plugins through its UI, so set them up by file instead): fetch the skills from https://github.com/messagebird/bird-ai and write them into `.cursor/rules/` as `.mdc` files.
4. Confirm who I am: run `bird whoami`, which prints the email of the account you're acting as.
5. Send me a test email so I see it land in my own inbox: use my address from `bird whoami` as the recipient, send from onboarding@messagebird.dev, then confirm delivery with `bird email get`. Subject: "Your Bird account is ready". Body: "You're set up and ready to send. This email is the proof. Cheers, The Bird team".
Then let's discuss next steps, given what Bird can do.
```

To set the skills up by hand, add the `messagebird/bird-ai` marketplace under **Settings → Plugins**, or write the skills from this repo into `.cursor/rules/` as `.mdc` files yourself.

**MCP server:** add the hosted server once in `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "bird": { "url": "https://mcp.platform.bird.com" }
  }
}
```

## Codex

Paste this prompt into Codex:

```text
Bird is an infrastructure platform that makes it easy to send email to your users. Set Bird up for me, end to end.
1. Install the Bird CLI: run `curl -fsSL https://cli.platform.bird.com/install.sh | sh`.
2. Sign me in: run `bird auth login` and open the browser link for me.
3. Install Bird's skills so you know the workflows: run `codex plugin marketplace add messagebird/bird-ai`, then `codex plugin add bird@bird-ai` (check `codex plugin --help` if the exact form differs).
4. Confirm who I am: run `bird whoami`, which prints the email of the account you're acting as.
5. Send me a test email so I see it land in my own inbox: use my address from `bird whoami` as the recipient, send from onboarding@messagebird.dev, then confirm delivery with `bird email get`. Subject: "Your Bird account is ready". Body: "You're set up and ready to send. This email is the proof. Cheers, The Bird team".
Then let's discuss next steps, given what Bird can do.
```

Or install the plugin manually:

```bash
codex plugin marketplace add messagebird/bird-ai
codex plugin add bird@bird-ai
```

**MCP server:** add the hosted server once in `~/.codex/config.toml`:

```toml
[mcp_servers.bird]
url = "https://mcp.platform.bird.com"
```

## GitHub Copilot

Paste this prompt into Copilot:

```text
Bird is an infrastructure platform that makes it easy to send email to your users. Set Bird up for me, end to end.
1. Install the Bird CLI: run `curl -fsSL https://cli.platform.bird.com/install.sh | sh`.
2. Sign me in: run `bird auth login` and open the browser link for me.
3. Install Bird's skills so you know the workflows: run `copilot plugin marketplace add messagebird/bird-ai`, then `copilot plugin install bird@bird-ai`.
4. Confirm who I am: run `bird whoami`, which prints the email of the account you're acting as.
5. Send me a test email so I see it land in my own inbox: use my address from `bird whoami` as the recipient, send from onboarding@messagebird.dev, then confirm delivery with `bird email get`. Subject: "Your Bird account is ready". Body: "You're set up and ready to send. This email is the proof. Cheers, The Bird team".
Then let's discuss next steps, given what Bird can do.
```

Or install the plugin manually:

```bash
copilot plugin marketplace add messagebird/bird-ai
copilot plugin install bird@bird-ai
```

**MCP server:** add the hosted server once in `.vscode/mcp.json`:

```json
{
  "servers": {
    "bird": { "type": "http", "url": "https://mcp.platform.bird.com" }
  }
}
```

## Factory Droid

Paste this prompt into Droid:

```text
Bird is an infrastructure platform that makes it easy to send email to your users. Set Bird up for me, end to end.
1. Install the Bird CLI: run `curl -fsSL https://cli.platform.bird.com/install.sh | sh`.
2. Sign me in: run `bird auth login` and open the browser link for me.
3. Install Bird's skills so you know the workflows: Droid loads skills from `.factory/skills/`, so clone https://github.com/messagebird/bird-ai and copy `plugins/bird/skills/bird-cli` into `.factory/skills/bird-cli`.
4. Confirm who I am: run `bird whoami`, which prints the email of the account you're acting as.
5. Send me a test email so I see it land in my own inbox: use my address from `bird whoami` as the recipient, send from onboarding@messagebird.dev, then confirm delivery with `bird email get`. Subject: "Your Bird account is ready". Body: "You're set up and ready to send. This email is the proof. Cheers, The Bird team".
Then let's discuss next steps, given what Bird can do.
```

To set the skills up by hand:

```bash
git clone https://github.com/messagebird/bird-ai
cp -r bird-ai/plugins/bird/skills/bird-cli .factory/skills/bird-cli
```

**MCP server:** add the hosted server once:

```bash
droid mcp add bird https://mcp.platform.bird.com --type http
```

## What's in the `bird` plugin

- **`bird-cli`**: operate the Bird API from the terminal. Send and inspect email, manage sending domains, dedicated IPs and IP pools, and webhook endpoints, and check CLI auth.
- **Bird MCP server**: the hosted server at `https://mcp.platform.bird.com`, so your agent can call Bird directly with a browser sign-in and no API key. Auto-connected on Claude Code; a one-time config elsewhere (above).

## License

[MIT](./LICENSE).
