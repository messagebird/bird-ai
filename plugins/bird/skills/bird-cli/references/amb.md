# Apple Messages for Business

Use `bird amb` to reply to customer-initiated conversations, inspect messages and events, manage business accounts and suppressions, and read statistics. Authenticate for the intended workspace and region. Reads require `amb:read`, sends require `amb:write`, management requires `amb_management`, and statistics require `amb:read`. Use `bird auth login --scope <scope:level>` to add a missing grant.

## Reply

- The sender must be a configured, connected business in the authenticated workspace. Use its apple_business_id as from, not its Bird record ID.
- The customer must have opened a conversation with that business. Use the conversation's recipient.opaque_user_id as to. The conversation must be open and the recipient unsuppressed.
- Supply the message as text, rich_link or interactive, or as template (a stored template reference) instead. Text beside rich_link or interactive arrives first as its own bubble. Template sends derive their category from the template, so omit category alongside template.
- Review the exact business, recipient and content before sending. Reuse the same idempotency key when retrying the same request.
- `bird amb send`: Queues the reply and returns its message ID.

1. Run `bird amb business-accounts list` and `bird amb business-accounts get <business-account-id>` to find the configured account's `apple_business_id` and verify its `status` is not `disconnected`.
2. Run `bird amb conversations list` and `bird amb conversations get <conversation-id>` to verify the matching business and native open state, then read `recipient.opaque_user_id`.
3. Inspect `bird amb send --example` and preview the exact request with `--dry-run`. Send with `--body-file <file>` or `--from`, `--to` and either `--text`, `--rich-link` or `--interactive`, or `--template`, preserving `--idempotency-key` across retries.
4. Read `bird amb get <message-id>` and `bird amb list-events <message-id>` before deciding whether a failed or uncertain request needs another send.

`accepted` means queued. `sent` means Apple gateway acceptance; it does not prove device delivery, a read receipt or completion of an order, booking or payment.

## Reuse attachments by ID

An attachment ID (`aat_`) belongs to one business account. Received, sent and uploaded attachments all carry one, and only that business account can send it.

1. If you already have an `aat_` ID, run `bird amb attachments get <attachment-id>` and skip to step 3 when it is still usable; upload only when you have no ID or its `expires_at` is less than 24 hours away, since a send is refused inside that window. Each upload creates a new attachment.
2. Run `bird amb attachments upload --from <apple-business-id> --file <path>`, or `--source-url <https-url>` for a file Bird downloads, and read the returned `id`. Keep `--idempotency-key` across retries.
3. Check the attachment before sending: `business_account_id` must be the business account you send from. `--from` takes that account's `apple_business_id`, which `bird amb business-accounts get <business_account_id>` returns. A send within 24 hours of `expires_at` is refused; sending the attachment again moves `expires_at` 30 days on.
4. Send it with `text.attachments[].attachment_id` in place of `source_url`, or `--attachments` on the CLI. Supplying both is refused.
5. Run `bird amb attachments download <attachment-id> --output <file>` for the decrypted bytes. Past `expires_at`, the download fails once Apple no longer holds the attachment, unless Bird kept a copy of a received one.

## Manage and investigate

- `bird amb attachment <message-id> <index> --output <file>` downloads and decrypts an attachment by its position in the message's `text.attachments`; for a received attachment the message ID is the `message.id` of the `amb.received` webhook. Apple keeps attachments for 30 days, so download on receipt.
- `bird amb business-accounts settings` reads and updates entry points and brand settings.
- `bird amb business-accounts submissions` lists review attempts. Upload files with `bird amb business-accounts attachments upload`, then create a submission using the returned attachment IDs.
- `bird amb routing-rules` manages business routing; `bird amb conversations update` changes assignment, labels, `inbox_status` or read state through the `read` date-time cutoff. Resolving inbox work preserves the conversation and does not change its native sending status.
- `bird amb suppressions` reads, creates or ends suppression episodes. Only manual episodes can be ended; history is retained. Phone invitation consent uses preferences with channel `amb`.
- `bird amb stats`, `bird amb stats inbound` and `bird amb stats conversations` use different time attribution; inspect the returned period and freshness metadata before comparing them.

Native authentication, payment requests and invitations are not released agent operations. Journeys and simulation templates do not execute through these commands.
