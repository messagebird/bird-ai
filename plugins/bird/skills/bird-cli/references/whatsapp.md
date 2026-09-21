# WhatsApp operations

Select the operation the user requested. Account operations inherit credentials, output and exit-code conventions from the Bird CLI entry. A local preview does not require authentication or send a message.

## Preview

Follow [draft preview](whatsapp-preview.md) to validate supported content and return a builder link. The link exposes its content to anyone holding it; sending remains a separate requested action.

## Account operations

Authenticate through [account access](authenticate.md), then read the matching procedure:

- [Send, list, inspect and follow message events](whatsapp-messages.md), including received media.
- [Acknowledge a received message or manage reactions](whatsapp-receipts-and-reactions.md).
- [Inspect, precheck, connect or manage numbers and business accounts](whatsapp-numbers-and-accounts.md).
- [Manage STOP/START keyword rules](whatsapp-keyword-rules.md).
- [Read traffic statistics](whatsapp-stats.md).
- [Browse or author templates](whatsapp-templates.md).

Each procedure states its result and traps. A successful send or receipt request establishes acceptance, not delivery or application by WhatsApp.
