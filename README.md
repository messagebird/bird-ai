# Bird AI Marketplace

Skills for driving the [Bird](https://bird.com) platform from your coding agent. Your agent operates Bird through the `bird` CLI; the `bird` plugin in this marketplace installs the skills that teach it Bird's workflows, and on clients that read the plugin's MCP declaration it wires up Bird's hosted MCP server too.

## Quick start

Every client starts the same way: install the CLI and sign in.

```bash
curl -fsSL https://cli.bird.com/install.sh | sh   # install the bird CLI
bird auth login                                            # sign in (browser, no API key)
```

On macOS or Linux you can also install with Homebrew: `brew install messagebird/tap/bird`.

Then jump to your client below. The fastest path is to paste the setup prompt and let your agent do the rest; a manual path is under each one.

## No Bird account yet?

`bird auth login` signs in to an account you already have. An agent with **no** account can create one from the terminal — no browser, no password. Three commands take you from nothing to a stored credential:

```bash
# 1. Sign up. Emails a six-digit code to the address; no password is set.
bird auth signup you@example.com

# 2. Verify. Read the code from that email, then exchange it for a single-use onboarding ticket.
bird auth verify-email you@example.com --code 123456
# → { "onboarding_ticket": "obt_…", "user_id": "usr_…" }

# 3. Create your first org + workspace. Consumes the ticket, then mints and stores the credential.
#    --region picks where the account and its data live (us1 or eu1); the CLI routes there for you.
bird auth create-org "Acme" --workspace-name "Production" --region us1 --onboarding-ticket obt_…

# Confirm it worked — reports the account, org, and workspace you're now acting as.
bird auth status
```

The code arrives by email, so it comes from outside the CLI — read it from the inbox and pass it to step 2. Signup and verification are region-agnostic; you pick the region once, at `create-org`, so there is no host or environment variable to set. Every step is self-describing: append `--help` for the flags, `--example` for a ready-to-edit request body, or `--response-schema` for what it returns — none of them need a credential, so an agent can plan the whole chain before running it. Full walkthrough: [Self-serve signup](https://bird.com/docs/ai/self-serve-signup).

## Any Agent Plugins client

The plugin ships a root `plugin.json` and `mcp.json` following [Agent Plugins](https://agent-plugins.org/specification), the portable plugin format. A client that implements the specification loads it from this repository as it is: the skills and the hosted MCP server, in one install. Point the client at `github.com/messagebird/bird-ai` and install `bird` from `plugins/bird`.

For a client with its own plugin format, or none, find it below.

## Claude Code

Paste this prompt into Claude Code and it installs the CLI, signs you in, installs the skills, and sends a test email:

```text
Bird is an infrastructure platform that makes it easy to send email to your users. Set Bird up for me, end to end.
1. Install the Bird CLI: run `curl -fsSL https://cli.bird.com/install.sh | sh`.
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

**MCP server:** installing the plugin registers Bird's hosted server at `https://mcp.bird.com`, so there is nothing to configure. You do have to sign in once, because the server is OAuth-gated: run `/mcp`, select `bird`, press Enter, and choose **Authenticate**. Your browser opens Bird's consent screen; approve it and the tools work. Until then `claude mcp list` reports `bird` as `! Needs authentication` and every tool call fails. For a headless run (`claude -p`) there is no `/mcp` panel, so authenticate first with `claude mcp login bird`.

## Cursor

Paste this prompt into Cursor:

```text
Bird is an infrastructure platform that makes it easy to send email to your users. Set Bird up for me, end to end.
1. Install the Bird CLI: run `curl -fsSL https://cli.bird.com/install.sh | sh`.
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
    "bird": { "url": "https://mcp.bird.com" }
  }
}
```

Then sign in: open **Cursor Settings → Tools & Integrations**, and under **MCP Tools** click **Needs login** next to `bird`. Approve Bird's consent screen in the browser and return to Cursor. The tools fail until you do.

## Codex

Paste this prompt into Codex:

```text
Bird is an infrastructure platform that makes it easy to send email to your users. Set Bird up for me, end to end.
1. Install the Bird CLI: run `curl -fsSL https://cli.bird.com/install.sh | sh`.
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
url = "https://mcp.bird.com"
```

Then sign in, which opens your browser for Bird's consent screen:

```bash
codex mcp login bird
```

## GitHub Copilot

Paste this prompt into Copilot:

```text
Bird is an infrastructure platform that makes it easy to send email to your users. Set Bird up for me, end to end.
1. Install the Bird CLI: run `curl -fsSL https://cli.bird.com/install.sh | sh`.
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
    "bird": { "type": "http", "url": "https://mcp.bird.com" }
  }
}
```

VS Code asks you to trust the server the first time it starts, then runs the sign-in itself: approve Bird's consent screen in the browser window it opens. If no window appears, start `bird` from the **MCP: List Servers** command. Your grant is listed under the **Accounts** menu → **Manage Trusted MCP Servers**, which is also where you revoke it.

## Factory Droid

Paste this prompt into Droid:

```text
Bird is an infrastructure platform that makes it easy to send email to your users. Set Bird up for me, end to end.
1. Install the Bird CLI: run `curl -fsSL https://cli.bird.com/install.sh | sh`.
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
droid mcp add bird https://mcp.bird.com --type http
```

Then run `/mcp` inside droid and complete the browser sign-in from the server manager.

## What's in the `bird` plugin

- **`bird-cli`**: operate the Bird API from the terminal. Send and inspect email, manage sending domains, dedicated IPs and IP pools, and webhook endpoints, and check CLI auth.
- **Bird MCP server**: the hosted server at `https://mcp.bird.com`, so your agent can call Bird directly with a browser sign-in and no API key. Registered for you on Claude Code and on any Agent Plugins host; a one-time config elsewhere (above). Every client needs the one-time browser sign-in described in its section: the server is OAuth-gated, and a client that has the URL but no grant lists the tools and fails every call.

## License

[MIT](./LICENSE).
