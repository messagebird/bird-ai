# Inbound email (email forwarding)

Receive email at Bird. Bird mints **inbound addresses** (`ina_…`) — addresses like `wxjg6…@eu1.inbound.bird.com` that you forward a real mailbox to; Bird parses every message that arrives into a **received email** (`rem_…`) and fires the `email.received` webhook. Two command groups:

- `bird email inbound-addresses` — the forward addresses: `list`, `get`, `create`, `update`, `delete`.
- `bird email inbound-messages` — the mail received at them: `list`, `get`, `body`, `attachments` (all reads).

## Procedure

- `bird email inbound-addresses create`: Returns the minted `address` to forward mail to.
  - Forward a real mailbox, or set a forwarding rule, to the returned address.
  - Once a mailbox is forwarding, received messages appear in the list, newest first. (`bird email inbound-messages list`)
- `bird email inbound-messages list`: Lists received messages, newest first; filter by the inbound address that received them. An empty list means nothing has arrived yet — confirm a mailbox is forwarding to the minted address.
  - Read a message's parsed metadata, its body, or its attachment list. (`bird email inbound-messages get`, `bird email inbound-messages body`, `bird email inbound-messages attachments`)

## Permissions

Reads (`list`, `get`, `body`, `attachments`) need `emails:read`. Mutations (`create`, `update`, `delete`) need `email_management:write`; without it the command returns auth-denied (exit `4`), not a usage error.

## Addresses

- `bird email inbound-addresses list` returns a cursor envelope (`{ "data": [...], "next_cursor": ... }`); page with `--limit` and `--starting-after`.
- `bird email inbound-addresses get <ina_…>` returns one address with its minted `address` and `label`.
- `bird email inbound-addresses create --label <label>` mints a new address. `--label` is optional and just records which source mailbox it maps to; the response carries the `address` to forward mail to. Then forward a real mailbox (or set a forwarding rule) to that address.
- `bird email inbound-addresses update <ina_…> --label <label>` changes the label. The address itself is fixed.
- `bird email inbound-addresses delete <ina_…> --yes` stops receiving on the address. Mail forwarded to it afterward is no longer received; already-received messages are unaffected.

## Messages

- `bird email inbound-messages get`: Returns parsed metadata (sender, subject, received time, authentication results). The body is not included here; fetch it separately.
  - Fetch the parsed HTML and text body, or list the attachments to see what was enclosed. (`bird email inbound-messages body`, `bird email inbound-messages attachments`)

- `bird email inbound-messages list` returns received emails, newest first. Filter by `--from` (sender), `--inbound-address-id <ina_…>` (which minted address received it), and `--received-after`/`--received-before` (RFC 3339). An empty `data` means nothing has arrived yet — not an error.
- `bird email inbound-messages get <rem_…>` returns the parsed metadata (sender, subject, `received_at`, SPF/DKIM/DMARC results). The body is **not** included here.
- `bird email inbound-messages body <rem_…>` returns the parsed `{ "html": ..., "text": ... }` body.
- `bird email inbound-messages attachments <rem_…>` lists attachment metadata (`id`, `filename`, `content_type`, `size`).

```
# read the newest message that arrived at one address
addr=$(bird email inbound-addresses list | jq -r '.data[0].id')
id=$(bird email inbound-messages list --inbound-address-id "$addr" | jq -r '.data[0].id')
bird email inbound-messages body "$id"
```

## Traps

- **Raw MIME and attachment bytes are not on the CLI.** `attachments` lists metadata only; the original message and the raw attachment bytes are binary and aren't exposed here (fetch them from the dashboard). List the attachments to see what arrived.
- **The label can't be cleared to empty.** `update --label ""` sets an empty string, not a cleared field; there's no CLI way to send a null clear.
- **An empty message list is normal.** If `inbound-messages list` returns no `data`, mail hasn't arrived yet — mint an address and forward a mailbox to it (see the procedure above), then read again.

These actions inherit the output (`--format`), exit-code, and credential-resolution conventions from the `bird-cli` entry; the credential step itself is [authenticate](authenticate.md).
