# WhatsApp agents

Reads need `whatsapp_management:read` and writes need `whatsapp_management:write`, both workspace-level. A plain `bird auth login` requests a read-only baseline, so an agent that will set one up needs a step-up: `--yolo` requests the full delegable catalogue. Use `--scope whatsapp_management` only for a deliberately minimal token, because `--scope` replaces the baseline rather than adding to it. [authenticate](authenticate.md) has the full rule. Confirm with the user before turning an agent on or widening who it answers: from then on it writes to real contacts.

## The agent

A WhatsApp Business Agent is Meta's AI answering contacts on one number. It has no id of its own; every command takes the number's `wan_` id.

`bird whatsapp agents list` returns the workspace's numbers with their agent state. Filter `--eligible` for numbers an agent can be onboarded on, `--has-agent=false` for those without one. A boolean flag takes its value after `=`, never after a space.

`bird whatsapp agents create <number-id>` onboards an agent. It starts off, answering nobody, so nothing a contact sees changes. `status` is `pending` for about a minute while WhatsApp prepares it; changes to its settings and lists are refused with `409` until `bird whatsapp agents get <number-id>` reports `ready`.

`bird whatsapp agents delete <number-id> --yes` removes the agent and everything it answers from, and cannot be undone. Name the number to the user and wait for their confirmation before running it; `--yes` is only the CLI's own gate.

## What it answers from

Each of these is a list under the agent, with `list`, `create`, `get`, `delete`, and `update` where the resource changes in place. A `delete` cannot be undone: name the entry to the user and wait for their confirmation first.

- `settings get|update`: `--enabled`, `--ai-audience everyone|allowlist`, `--never-say-phrases`, and the handoff and follow-up objects through `--body-file`.
- `business-info get|update`: what the business does, buying, delivery, returns, payment and contact details. Send only the fields to change; a `null` in `--body-file` clears a field, except under `contact_info`.
- `faqs`, `skills`, `ui-skills`: questions and answers, situation-and-action skills, and rich-message components. A skill or UI skill `title` is lowercase letters, digits and hyphens; a UI skill's `component_type` is fixed at creation.
- `websites create <number-id> <url>`: WhatsApp reads the page in the background; check `crawl_status` before expecting answers from it.
- `files upload <number-id> --file-name <name> --file <path>`: PDF, Word, PNG, JPEG, CSV or Excel, up to 100 MB. `files download <number-id> <file-id> --output <path>` writes the bytes; `--url` prints a 15-minute link instead.
- `allowlist create <number-id> <phone-number>`: the contacts it answers while `ai_audience` is `allowlist`.

Changes reach WhatsApp before the command returns and apply from the next conversation turn.

## Try it, then turn it on

1. `bird whatsapp agents test <number-id> --text "What are your opening hours?"` asks the agent as a contact would. Nothing reaches a contact. Pass the reply's `meta_conversation_id` back with `--meta-conversation-id` for a follow-up.
2. Add a tester to the allowlist, then `settings update <number-id> --ai-audience allowlist --enabled`.
3. Only after the user confirms, widen with `--ai-audience everyone`.

`bird whatsapp agents notifications create <number-id> --to <contact> --name <kind> --description <sentence> --payload <json-text>` tells the agent something happened for one contact, so it can write to them. Confirm the contact and the event with the user first: what the agent sends cannot be recalled. It is processed in the background; `notifications get` shows what came of it.

## Traps

- **Handoffs are not on the CLI.** Taking or releasing a conversation, and the handoff log, stay in the dashboard.
- **An ineligible number is refused with `412`,** and so is an account whose business AI terms are outstanding. The error carries the step that resolves it.
- **`test` answers from the live configuration.** There is no draft; rehearse on a second number or keep `ai_audience` at `allowlist`.
- **Uploading through MCP needs a local server.** The hosted MCP server has no `whatsapp_agents_files_upload` tool, since a path there would read the server's own disk.
