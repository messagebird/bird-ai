---
name: email-receive-reply
description: Read and reply to a Bird mailbox email for a business Bot. Use for email_mailbox.message_received.
---

# Receive and reply on email

Apply the shared Message safety rules in the owning Bot’s lasting instructions; stop if absent. The Bot supplies the answer and policy; this skill supplies verified context and delivery.

- Accept `email_mailbox.message_received` with valid `data.message_id` (`rem_`), `data.thread_id` (`thr_`) and the configured `data.mailbox_id`. Use the trusted workspace.
- Dedupe on `data.message_id` only. Skip self-mail, automatic replies and bulk notifications to avoid loops.
- Read context with `email_threads_get`, `email_threads_messages_get` and `email_threads_messages_body`. Verify the fetched thread's mailbox and received message match the event; failed reads or mismatches stop processing.
- Reply with `email_threads_messages_reply`: original `thread_id` and `message_id`, plain `text`, `reply_all: false`, `idempotency_key: bird-email-reply:<data.message_id>`. Bird derives recipients and subject; do not override them.

Business actions belong to the Bot. Apply shared approval/replay rules and retain Bird's receipt.
