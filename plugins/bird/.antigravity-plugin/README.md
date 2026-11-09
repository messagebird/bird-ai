# Bird

Send email, SMS, and WhatsApp Business messages from Antigravity, and check what happened to each one, with Bird's hosted MCP server and two skills.

## Before you start

- A Bird account. Sign up at [bird.com](https://bird.com) if you don't have one.
- Sign in once after installing: open **Customizations**, then select **Authenticate** next to `bird` (in Antigravity CLI, open `/plugin`, expand `bird` under **Installed**, and choose **Sign in**) and approve Bird's consent screen in your browser. If Antigravity asks for an authorization code, copy it from the browser and paste it in. Bird uses OAuth, so you don't paste an API key, and the agent gets only the permissions your account already has. You can revoke access from your Bird profile.
- The `bird-cli` skill needs the `bird` CLI. Install it by following the [installation instructions](https://bird.com/docs/cli#install).

## What's included

- **Bird MCP server** at `https://mcp.bird.com`: the Bird API as tools, covering email, SMS, WhatsApp Business, verification, contacts and audiences, phone numbers, webhooks, and documentation search. The connection needs the sign-in above before any tool runs, the domain audit included; signed out, run the audit with the `email-audit` skill.
- **`bird-cli` skill**: operate the Bird API from the terminal with the `bird` CLI.
- **`email-audit` skill**: grade a domain's DMARC, SPF, DKIM, BIMI, and MX records and get a prioritized list of fixes. It runs `bird email tools audit`, which needs no sign-in.

## Try it

- "Send me a test email and tell me the moment it's delivered."
- "Audit the email authentication of example.com."
- "Set up a webhook for delivery events."

## Support

[Documentation](https://bird.com/docs) · [Privacy policy](https://bird.com/legal/privacy) · [Source](https://github.com/messagebird/bird-ai)
