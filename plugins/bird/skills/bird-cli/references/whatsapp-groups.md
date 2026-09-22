# WhatsApp groups

A group is one WhatsApp chat a business number shares with up to 8 people. Nobody can be added to it: people join by opening its invite link, and that is the only way in. `bird whatsapp groups` covers the group itself (`create`, `list`, `get`, `update`, `delete`); `bird whatsapp groups invite-link rotate` replaces the link; `bird whatsapp groups join-requests` decides who gets in; `bird whatsapp groups participants remove` takes someone out; `bird whatsapp groups pins` holds the messages kept at the top of the chat.

Branch on what they asked for:

- **Start a group** → _Create_ below. Read _Eligibility_ first; it is the one thing that refuses before anything else.
- **Get people into a group** → _Invite link_, then _Join requests_ if the group asks for approval.
- **See a group, or who is in it** → _Read_ below. `get` carries the participants; `list` does not.
- **Rename a group, change its description or picture** → _Update_ below.
- **Take someone out, or shut the group down** → _Remove a participant_ and _Delete_. Both are irreversible in ways worth reading before running.

## Eligibility

WhatsApp opens groups only to a number holding Official Business Account status, and a create against any other number is refused with `412 WhatsAppGroupsNotEligible`. Check before creating:

```
bird whatsapp numbers list | jq '.data[] | select(.is_official_business_account) | {id, phone_number}'
```

The flag is as of that number's `meta_synced_at` and is absent until WhatsApp has reported it, so a number connected minutes ago may not carry it yet. Bird cannot grant the status; it is requested in WhatsApp Manager and a refusal waits 30 days.

## Create

`bird whatsapp groups create --whatsapp-number-id <wan_…> --subject <string>` creates the group. `--description` is optional, and `--join-approval-mode` chooses between `auto_approve` (opening the link joins outright) and `approval_required` (opening it raises a request). The number and the approval mode are both fixed for the group's life.

**Done when** the command returns a group with an `id` (`wag_…`) and `status: pending`. It is not finished: WhatsApp confirms the group moments later, and only then does it gain its `invite_link`. Re-read with `bird whatsapp groups get <wag_…>` until `status` is `active`. A group that reaches `failed` is terminal — `last_operation.last_error` says why, and the way forward is another create, never a retry of that one.

## Read

`bird whatsapp groups list` pages the workspace's groups, newest first, filtered by `--number`, `--waba`, `--status`, or `--q` over subjects and descriptions. `bird whatsapp groups get <wag_…>` returns one group with its participants and pinned messages, which the list omits.

## Invite link

The current link is on the group (`get` → `invite_link`); reading it is not what `rotate` is for. `bird whatsapp groups invite-link rotate <wag_…> --yes` issues a new one and stops every earlier link working, which is what to run when a link has spread further than intended. It takes `--yes` because the links people are already holding stop working and the old one cannot be brought back, so confirm with the user before running it.

Treat the link as a credential: anyone holding it joins an `auto_approve` group without asking.

## Join requests

`bird whatsapp groups join-requests list <wag_…>` pages the people waiting, oldest first. Only a group created `approval_required` collects any — on an auto-approve group the page is empty because they are already in, which is not an error.

`bird whatsapp groups join-requests approve|reject <wag_…> --join-request-ids <wgj_…>` decides up to 50 at a time; repeat the flag for several. `reject` takes `--yes` and `approve` does not: a refused request is gone, and the person has to open the link again. Both answer `202` with `decided` and `failed` side by side, so read the response rather than the exit code: one refused id leaves the rest applied, and each failure carries WhatsApp's own reason.

## Update

`bird whatsapp groups update <wag_…>` changes `--subject`, `--description` or `--profile-picture-url`. Omitted fields are left alone; clearing the description or the picture takes an explicit JSON `null` through `--body-file -`, which no flag can express. A `null` picture clears the one Bird stores, and no further: WhatsApp offers no way to take a group's photo down, so participants keep seeing it until another picture replaces it.

The `202` is the change accepted, not applied. WhatsApp reports each field separately on a webhook, so a change can be part-applied: re-read the group, and `last_operation.results` says which field was refused and why.

## Remove a participant

`bird whatsapp groups participants remove <wag_…> <participant-ref> --yes` takes one person out, named by the `bsuid` everyone has or the `phone_number` only some share.

**This cannot be undone, so confirm the person with the user before running it.** WhatsApp blocks the removed person from rejoining by invite link, the block follows the person rather than the link, so rotating the link does not lift it, and no operation adds anyone to a group. Reaching that person again means creating another group.

## Pins

`bird whatsapp groups pins create <wag_…> --message-id <wam_…>` pins one of the group's own messages for `--duration-days` 1 to 30, defaulting to 7. A group holds 3 pins and a fourth unpins the oldest rather than failing. `bird whatsapp groups pins delete <wag_…> <wam_…> --yes` takes one down early; repeating it is safe.

## Delete

`bird whatsapp groups delete <wag_…> --yes` shuts the group down, and nothing brings it back, so confirm the group with the user before running it. Everyone loses access including your own business number, the invite link stops working, and the row stays readable at `status: deleted` — it does not leave the list — so older references still resolve. A `failed` group can be deleted too, and that one settles on the spot.

## Traps

- **`412` is the eligibility gate, not a bad request.** The number does not hold Official Business Account status. Read _Eligibility_; no retry fixes it.
- **`409 WhatsAppGroupNotActive` means the group is not `active`.** A `pending` group is still being created, a `suspended` one is WhatsApp's to release, and a `deleted` one is gone. `failed` is the single exception: a delete against it is accepted, because there is nothing at WhatsApp to delete.
- **`409 WhatsAppGroupUpdateInProgress` means one change is already outstanding.** The group's own pending operation blocks `update` and `delete`; a participant's blocks only that participant. Read `last_operation.status` and wait for it to settle — usually seconds.
- **A `202` is not a result.** Create, update, delete and participant removal settle on a WhatsApp webhook, so the command returning is not the change landing; re-reading the group is. The one exception is deleting a `failed` group, which never reaches WhatsApp: no group was ever created there, so the row is Bird's own and the delete is done when it answers.
- **`422 WhatsAppMessageNotInGroup` on a pin means the message belongs elsewhere.** Pinning is scoped to the group that carries the message, and a one-to-one message can never be pinned.
- **Sending to a group is not here.** It rides the message endpoint: `bird whatsapp send --to <wag_…>` with no `--from`, because the group already has its number.

These actions inherit the output (`--format`), exit-code, and credential-resolution conventions from the `bird-cli` entry; the credential step itself is [authenticate](authenticate.md).
