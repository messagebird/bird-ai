# WhatsApp senders and business accounts

Use [authentication](authenticate.md) for account access. Establish the target and intended operation before a connection, disconnection, precheck or profile mutation.

## Numbers

`bird whatsapp numbers list` returns a page of the numbers the workspace can send from, as a cursor envelope (`{ "data": [...], "next_cursor": ... }`). Narrow with `--phone-number` (E.164, normalized before matching), `--waba` (the `waba` value a business account carries, not its `waa_` id), `--status` (repeatable), and `--scope` (`system` for platform-managed numbers, `workspace` for the ones you connected yourself). `bird whatsapp numbers get <number-id>` returns one number; `--format text` prints a card.

`bird whatsapp numbers precheck <phone-number>` asks WhatsApp whether it will accept a number before you buy it, and answers `{ "phone_number": ..., "outcome": "available" | "unavailable" }`. No number is connected to your workspace, but this is a write rather than a lookup, so check the one number you intend to buy rather than a list of candidates. Confirm the number with the user before running it, and retry an uncertain result with the same `--idempotency-key` you sent the first time: a fresh key asks WhatsApp again rather than replaying the verdict. The two reasons behind `unavailable` — already in use on WhatsApp, or a number WhatsApp cannot serve — are not told apart, so treat it as a number to skip. The answer describes this moment: an available number can be taken by someone else before you connect it.

Each number carries the state WhatsApp reports for it (`status`, `quality_rating`, `messaging_limit`, `throughput_level`) as of `meta_synced_at`, which is a reading taken roughly hourly rather than a live value. A number whose connection has not succeeded carries `error` with Bird's classification, plus WhatsApp's own words and code where WhatsApp was the one that refused; it is present while a number is still retrying as well as once it has given up.

`bird whatsapp numbers update <wan-id> --name <label>` changes your workspace's own label for a connected number; it has no bearing on what WhatsApp displays to the people it messages. `bird whatsapp numbers delete <wan-id> --yes` disconnects a number so it can no longer send. It requires `--yes` and never prompts, so a bare `delete` exits `2` rather than acting; re-run with `--yes` once you've confirmed the id with the user. It is not an undo away: reconnecting the same number means `create` again and a person completing embedded signup in a browser a second time.

`bird whatsapp numbers profile get <wan-id>` reads the business profile WhatsApp shows for a connected number. `bird whatsapp numbers profile update <wan-id>` changes it, and only for a number the workspace connected itself once it reaches `connected` — a platform-managed number (`--scope system` in the list) has one profile shared by every workspace sending through it, so it is refused. One flag per field: `--about`, `--address`, `--description`, `--email`, `--vertical`, `--profile-picture-url`, `--username`, `--username-transfer-action`. `--username-transfer-action force_transfer` takes a username off another of the workspace's numbers, and the response names only the number you called it on, so confirm with the user before forcing one. **Done when** the response echoes the field back with your new value.

## Connecting a number

1. Find the number to connect: `bird numbers list`. It must be a dedicated number (`nda_` prefix) that can receive text messages; this is a different id space from `bird whatsapp numbers list`, whose `wan_` ids name connections that already exist.
2. `bird whatsapp numbers create <nda-id>`, optionally with `--name` (a temporary label) and `--data-localization-region` (where message content is stored at rest; cannot be changed later). This returns the connection `preparing`, not connected.
3. Poll `bird whatsapp numbers get <wan-id>` until `status` leaves `preparing`. `awaiting_signup` is the one that carries `finish_setup_url` and means go to step 4. `failed` is terminal: stop polling and read `error`, which says whether it was Bird or WhatsApp that refused and why.
4. Hand `finish_setup_url` to a person. It is a browser flow behind an OAuth screen, WhatsApp's embedded signup, and only a human can complete it. **Done when** a subsequent `get` reports `connected`.

## Business accounts

`bird whatsapp business-accounts list` returns the WhatsApp Business Accounts the workspace has connected, as a cursor envelope. Each account carries the state WhatsApp last reported for it: its own status, how far WhatsApp's review of it has got, and whether Meta verified the business behind it.

`bird whatsapp business-accounts get <business-account-ref>` returns one account, addressed by either the `waa_` id the list reports or the numeric id WhatsApp reports in `waba`. `--format text` prints a card. An account the list does not show is not-found here either, in both forms.

## Traps

- **A platform-managed number reports no WhatsApp state.** A number with `scope: system` carries no `quality_rating`, `messaging_limit`, `throughput_level`, or `meta_synced_at`, and its `connected` status is Bird's own assertion. Their absence is not a fault to chase.
- **`--waba` and `--scope=system` never overlap.** A platform-managed number belongs to no WhatsApp Business Account, so pairing the two filters always returns an empty page.
- **Connecting a number does not finish it.** `create` only returns `preparing`. The number reaches `awaiting_signup` and carries `finish_setup_url`, and a person must open that link and complete WhatsApp's embedded signup in a browser. No command finishes it for them; polling past `awaiting_signup` without someone opening the link waits forever.
- **A flag cannot clear a profile field.** `--address`, `--description`, and `--email` are settable by flag, but clearing one requires an explicit `null` in a JSON body via `--body-file`. `--address null` sets the address to the literal four-character string "null", and the server accepts it without complaint.
- **`websites` has no flag.** String arrays are body-file only by design, so it is set through `--body-file` alone.
