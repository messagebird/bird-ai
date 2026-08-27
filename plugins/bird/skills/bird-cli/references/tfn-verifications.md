# Toll-free verifications

Draft the carrier verification a US toll-free number needs before it can send SMS, and read where a verification stands. `bird sms tfn verifications` covers the draft lifecycle (`requirements`, `create`, `update`, `get`, `list`, `cancel`). Submitting the dossier to the carrier charges a non-refundable fee and is not on this surface: a person does that in the dashboard, and this group gets the draft complete for them.

Branch on what they asked for:

- **What does the carrier want to know?** → _Requirements_ below, with no verification named.
- **Start a verification for a toll-free number** → _Create_ below.
- **Fill in or correct the dossier** → _Update_ below.
- **Where does a verification stand, or why was it declined?** → _Get_ and _List_ below.
- **Free a number held by an abandoned draft** → _Cancel_ below.

## Requirements

`bird sms tfn verifications requirements` lists everything the carriers ask for, in the order to present it. With no flags it is the blank form, which answers "what do I fill in?" before anything exists; `--verification-id <tfv_…>` returns the same list carrying that verification's answers and, once a carrier has responded, which items it refused and why. `--identity-id` prefills the business items from a party the workspace already holds.

Each item's `state` says what it asks of you: `not_supplied`, `rejected` and `expired` want a value (or a new one); `supplied`, `in_review`, `approved` and `not_applicable` want nothing; `reason` carries the carrier's words on a refused item. The set is open, so a state you do not recognise is not yours to act on.

## Create

`bird sms tfn verifications create --sender-id <number-sender-id>` opens a draft against a toll-free, SMS-capable number the workspace owns. Only the sender is required; every business and messaging field (`--legal-entity-name`, `--business-address-*`, `--contact-*`, `--use-case-category`, `--message-sample`, `--opt-in-description`, `--monthly-volume-estimate-tier`, and so on) can be given here or later through _Update_. The result is always a `draft`; nothing reaches a carrier until a person submits it.

**Done when** the command returns a verification with an `id` (`tfv_…`) and `status: draft`.

## Update

`bird sms tfn verifications update <verification-id> --<field> <value> …` fills in the dossier over as many calls as it takes. Send only the fields that change; anything omitted is left as it was. It works while the verification's `status` is editable: `draft`, `info_requested` (the carrier asked for more), or `rejected` while `resubmit_allowed` is still true. `submitted`, `under_review` and `approved` are locked.

Two different things are called `rejected`: the verification's `status` (the carrier declined the whole dossier; read it with _Get_) and an item's `state` in _Requirements_ (one answer was refused). A rejected verification is edited through the same _Update_; a rejected item is what tells you which field to change.

**Done when** _Requirements_ with `--verification-id` shows no item whose `state` is `not_supplied`, `rejected` or `expired`; the draft is then ready for a person to submit.

## Get

`bird sms tfn verifications get <verification-id>` reads one verification: its `status`, the sender it licenses, `denial_reasons` in the carrier's own words when it declined or asked for more, and `resubmit_allowed`, which answers the one question `status` cannot (whether a `rejected` verification is still inside its resubmission window).

## List

`bird sms tfn verifications list` returns the workspace's verifications, newest first, as a cursor envelope; `--status` separates drafts from the ones a carrier is holding, `--sender-id` narrows to one number, and `--limit`/`--starting-after` page.

## Cancel

`bird sms tfn verifications cancel <verification-id> --yes` deletes a draft and frees the toll-free number it held, so the number can go on a new verification. Only a draft can be cancelled; once submitted, the carrier holds it. Non-interactive runs need `--yes`.

## Traps

- **Submitting is not here, on purpose.** The carrier charges a non-refundable fee on submit, so that step belongs to someone who can authorize the spend. Do not tell the user the verification is "sent" when the draft is complete; tell them it is ready to submit.
- **`create` needs a toll-free number the workspace already owns.** A long code or a number in another workspace is refused; buy or allocate the number first.
- **Locked means locked.** `update` on a `submitted`, `under_review` or `approved` verification fails; read `status` (and `resubmit_allowed` for a rejected one) before retrying with different fields.
- **`help-response` and `opt-in-confirmation-response` are declarations, not configuration.** They tell the carrier what you say; the actual replies are configured under keyword rules.

These actions inherit the output (`--format`), exit-code, and credential-resolution conventions from the `bird-cli` entry; the credential step itself is [authenticate](authenticate.md).
