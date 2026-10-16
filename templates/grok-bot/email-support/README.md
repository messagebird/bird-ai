# Email Support Desk

Answer customer email using your product knowledge and support policy.

Follow the [setup guide](https://bird.com/docs/ai/route-messages-to-an-agent#grok-bot), customise [bot.md](bot.md) and enable [email-receive-reply](../../skills/email-receive-reply/SKILL.md). Give the Bot [shared safety](../../shared/message-safety.md) as lasting instructions alongside `bot.md`.

Bird tools: `email_threads_get`, `email_threads_messages_get`, `email_threads_messages_body`, `email_threads_messages_reply` (mailbox read/write).

Change the settings by [editing your Bot in chat](https://cursor.com/docs/grok-bot/work#edit-a-bot).
