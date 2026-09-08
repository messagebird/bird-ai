---
name: bird-cli
description: Use when operating Bird through the bird CLI to preview or send messages, inspect or manage API resources, or onboard an account; excludes client development.
---

# Bird CLI

`bird` is a single binary for the Bird API and local tools such as WhatsApp message previews. Account operations need credentials; local previews do not.

If `bird` isn't installed (`command -v bird` finds nothing), install it first — a checksum-verified download to `~/.local/bin` (or `/usr/local/bin`):

```
curl -fsSL https://cli.bird.com/install.sh | sh
```

## The path

**Step 0 — Authenticate for account operations.** For a WhatsApp preview, go directly to [Preview](references/whatsapp.md#preview). For account operations, confirm credentials first: [authenticate](references/authenticate.md). It is a no-op when `bird auth status` already reports `valid: true`. No account yet? Create one through [onboarding](references/onboarding.md); it ends by storing the same credential a login would.

**Step 1 — Run the operation the user asked for:**

- Send or inspect email messages (`bird email`, including `send-batch`) → [email](references/email.md)
- Author reusable email templates, submit a draft, or roll one back (`bird email templates`) → [email-templates](references/email-templates.md)
- Send or inspect SMS messages, or browse SMS templates (`bird sms`) → [sms](references/sms.md)
- Draft the carrier verification a US toll-free number needs before it can send, read what the carrier asks for, or see why one was declined (`bird sms tfn verifications`) → [tfn-verifications](references/tfn-verifications.md)
- Claim an alphanumeric SMS sender, find out what a country requires of it, or register it for a country (`bird sms senders`) → [sms-senders](references/sms-senders.md)
- Preview a WhatsApp message (`bird whatsapp preview`) → [Preview](references/whatsapp.md#preview) (local — skips Step 0)
- Send or inspect WhatsApp messages, follow a message's events, connect or manage the numbers and business accounts the workspace sends from, check whether WhatsApp will accept a number before buying it, or read WhatsApp traffic statistics (`bird whatsapp`) → [whatsapp](references/whatsapp.md)
- Browse WhatsApp templates, their versions, and each version's per-language content (`bird whatsapp templates`) → [whatsapp-templates](references/whatsapp-templates.md)
- Inspect voice calls, find out why one was refused, configure a SIP trunk or an inbound number, enable or disable calling to a country, or place a test call (`bird voice`) → [voice](references/voice.md)
- Provision Realtime apps and rotate the keys their clients connect with (`bird realtime`) → [realtime](references/realtime.md)
- Verify a recipient with a one-time passcode — send a code, then check what they submit (`bird verify verifications`) → [verify](references/verify.md)
- Find out about a recipient before you use it — grade an email address, or identify a phone number and its network (`bird lookup`) → [lookup](references/lookup.md)
- Manage contacts, audiences, and contact properties (`bird contacts`, `bird audiences`, `bird contact-properties`) → [contacts](references/contacts.md)
- Record and look up messaging consent grants and opt-outs (`bird preferences`) → [preferences](references/preferences.md)
- Manage sending domains (`bird email domains`), or find a verified `from` to send from → [domains](references/domains.md)
- Count how much mail the workspace received, by period, day or hour (`bird email stats inbound`) → [received-mail-stats](references/received-mail-stats.md)
- Style the hosted page a marketing recipient lands on when they unsubscribe (`bird email unsubscribe-page`) → [unsubscribe-page](references/unsubscribe-page.md)
- Manage dedicated IPs (`bird email dedicated-ips`) and IP pools (`bird email ip-pools`) (sending reputation) → [ip-pools](references/ip-pools.md)
- Receive email at inbound forward addresses (`bird email inbound-addresses`), or read the mail received there (`bird email inbound-messages`) → [inbound](references/inbound.md)
- Manage outbound webhook endpoints → [webhooks](references/webhooks.md)
- Issue or rotate a workspace API key (`bird api-keys create`, `bird api-keys rotate`) → [api-keys](references/api-keys.md) (needs a login carrying `api_keys:write`; an API key cannot run it)
- Find out why acquiring a number or registering a sender was refused for a reason about the organization rather than the country, and settle the requirement behind it (`bird trust`) → [trust](references/trust.md)
- Find the business a 10DLC brand is registered for, so `brands create` can name it (`bird compliance identities list`) → [compliance-identities](references/compliance-identities.md)
- Register a 10DLC brand for US A2P traffic, or file a submission against one (`bird sms 10dlc brands create`, `bird sms 10dlc brands submissions create`) → sibling operations; node not yet authored, `--help` on each carries the field list
- Open a support ticket, reply to it, or wait for a support agent reply → [support](references/support.md)
- Answer a how-to or reference question about Bird from the documentation → [docs](references/docs.md) (public — skips Step 0)
- Inspect resolved CLI configuration → `bird config show` (sibling operation; node not yet authored)

Pick the operation that matches the request. Complete Step 0 only for operations that require an account.

## Conventions every command shares

These hold across operations, so the nodes rely on them instead of repeating them:

- **Output is JSON by default** (`--format json`). Single-record commands (`get`, `status`, `show`) also take `--format text` for a human-readable card. List commands ignore `--format text` and always emit JSON, so a script can pipe them through `jq` without a per-command branch.
- **Exit codes carry the failure category** so a caller can branch without parsing prose: `2` invalid usage or input, `3` not found, `4` auth or permission denied, `1` anything else. Errors print to stderr; data to stdout.
- **Transient failures are retried for you.** A rate limit, a 5xx, or a network blip is retried twice with backoff before the command fails, so an error marked `retryable` has already been through that — re-running it immediately rarely helps. `--max-retries 0` turns it off when you drive your own retry loop.
- **The login sets the region.** The token from `bird auth login` is bound to one workspace and its region, which picks the API host; override with `--base-url`/`BIRD_API_URL`. Details and the state check live in [authenticate](references/authenticate.md).
