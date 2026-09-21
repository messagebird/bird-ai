# Preview a WhatsApp draft

For a visual check of a drafted service message, save the Bird send payload as JSON and run `bird whatsapp preview --body-file message.json`. Use `--body-file -` to read stdin; `--open` also opens the browser. Authentication is not required and no message is sent.

The JSON result contains `preview_url`, which loads the message into the [public WhatsApp builder](https://bird.com/tools/whatsapp-message-builder). Return this link to the user when they ask to see an LLM-generated payload. MCP callers use `whatsapp_preview` with the send body in `payload`.

The link omits `to`, `from`, `metadata`, and `tags`. Anyone with the link can read its message content. Templates and reply quotes are unsupported; media needs URLs. The builder reports content it cannot represent without changing it, including unsupported contact-card fields. Content is limited to 24,000 UTF-8 bytes after compaction. **Done when** the user has the link; sending requires a separate request. Edits in the browser do not update the original file, so copy the edited JSON before sending it.
