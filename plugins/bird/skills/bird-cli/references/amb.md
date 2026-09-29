# Apple Messages for Business

Use `bird amb` to reply to customer-initiated conversations, inspect messages and events, manage business accounts and suppressions, and read statistics. Authenticate for the intended workspace and region. Reads require `amb:read`, sends require `amb:write`, management requires `amb_management`, and statistics require `amb:read`. Use `bird auth login --scope <scope:level>` to add a missing grant.

## Reply

- The sender must be a configured, connected business in the authenticated workspace. Use its apple_business_id as from, not its Bird record ID.
- The customer must have opened a conversation with that business. Use the conversation's opaque_user_id as to, not a phone number. The conversation must be open and the recipient unsuppressed.
- Review the exact business, recipient and content before sending. Reuse the same idempotency key when retrying the same request.
- `bird amb send`: Queues the reply and returns its message ID.

1. Run `bird amb business-accounts list` and `bird amb business-accounts get <business-account-id>` to find the configured account's `apple_business_id` and verify its `status` is not `disconnected`.
2. Run `bird amb conversations list` and `bird amb conversations get <conversation-id>` to verify the matching business and open state, then read `opaque_user_id`.
3. Inspect `bird amb send --example` and preview the exact request with `--dry-run`. Send with `--body-file <file>` or `--from`, `--to` and `--content`, preserving `--idempotency-key` across retries.
4. Read `bird amb get <message-id>` and `bird amb list-events <message-id>` before deciding whether a failed or uncertain request needs another send.

`accepted` means queued. `sent` means Apple gateway acceptance; it does not prove device delivery, a read receipt or completion of an order, booking or payment.

## Manage and investigate

- `bird amb business-accounts settings` reads and updates entry points and brand settings.
- `bird amb business-accounts submissions` lists review attempts. Upload files with `bird amb business-accounts attachments upload`, then create a submission using the returned attachment IDs.
- `bird amb routing-rules` manages business routing; `bird amb conversations update` changes assignment, labels or read state.
- `bird amb suppressions` reads, creates or ends suppression episodes. Only manual episodes can be ended; history is retained. Phone invitation consent uses preferences with channel `amb`.
- `bird amb stats`, `bird amb stats inbound` and `bird amb stats conversations` use different time attribution; inspect the returned period and freshness metadata before comparing them.

Native authentication, payment requests and invitations are not released agent operations. Journeys and simulation templates do not execute through these commands.
