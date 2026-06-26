---
name: bird-cli
description: Drive the Bird API from the terminal with the `bird` CLI — send and inspect email, manage sending domains (`bird email domains`), dedicated IPs (`bird email dedicated-ips`) and IP pools (`bird email ip-pools`), and webhook endpoints, open and follow up on support tickets (`bird support-tickets`), check CLI auth/config, and search the Bird documentation (`bird docs search`). Use when someone says "send an email with the bird CLI", "how do I do X in Bird", "list sent emails", "did that email bounce", "what domain can I send from", "add a sending domain", "list my dedicated IPs", "create an IP pool", "assign an IP to a pool", "set up a webhook", "open a support ticket", "reply to a support ticket", "wait for a support reply", "is the CLI authenticated", or otherwise wants to operate Bird from a shell or an agent loop. Not for the Bird HTTP API directly or the Go/TS SDKs.
---

# Bird CLI

`bird` is a single binary that talks to the Bird API. Each top-level command is one operation; every operation talks to the live API, so all of them need credentials first.

If `bird` isn't installed (`command -v bird` finds nothing), install it first — a checksum-verified download to `~/.local/bin` (or `/usr/local/bin`):

```
curl -fsSL https://cli.platform.bird.com/install.sh | sh
```

## The path

**Step 0 — Authenticate (shared prerequisite).** Every command below fails without a key, and the failure looks the same as a real error, so confirm credentials first: [authenticate](references/authenticate.md). It is a no-op when `bird auth status` already reports `valid: true`, so it is safe to run first every time.

**Step 1 — Run the operation the user asked for:**

- Send or inspect email messages → [email](references/email.md)
- Manage sending domains (`bird email domains`), or find a verified `from` to send from → [domains](references/domains.md)
- Manage dedicated IPs (`bird email dedicated-ips`) and IP pools (`bird email ip-pools`) (sending reputation) → [ip-pools](references/ip-pools.md)
- Manage outbound webhook endpoints → [webhooks](references/webhooks.md)
- Open a support ticket, reply to it, or wait for a support agent reply → [support](references/support.md)
- Answer a how-to or reference question about Bird from the documentation → [docs](references/docs.md) (public — skips Step 0)
- Inspect resolved CLI configuration → `bird config show` (sibling operation; node not yet authored)

Pick the one operation that matches the request; there is no ordering among them beyond the Step 0 auth they all share.

## Conventions every command shares

These hold across operations, so the nodes rely on them instead of repeating them:

- **Output is JSON by default** (`--format json`). Single-record commands (`get`, `status`, `show`) also take `--format text` for a human-readable card. List commands ignore `--format text` and always emit JSON, so a script can pipe them through `jq` without a per-command branch.
- **Exit codes carry the failure category** so a caller can branch without parsing prose: `2` invalid usage or input, `3` not found, `4` auth or permission denied, `1` anything else. Errors print to stderr; data to stdout.
- **The login sets the region.** The token from `bird auth login` is bound to one workspace and its region, which picks the API host; override with `--base-url`/`BIRD_API_URL`. Details and the state check live in [authenticate](references/authenticate.md).
