# SMS senders

Claim an alphanumeric sender for the workspace and register it for the countries it needs to reach. `bird sms senders` covers the sender (`create`, `requirements`); `bird sms senders registrations` files a registration for one country (`create`). Numbers become senders when they are allocated, so this group is for the brand-name kind.

Branch on what they asked for:

- **Claim a new alphanumeric sender** → _Create_ below.
- **Find out whether a sender may send to a country, or what it still needs** → _Requirements_ below.
- **Register a sender for a country** → _Registrations create_ below.
- **A send was refused with a sender error** → _Requirements_ first; it names what to do next.

## Create

`bird sms senders create --type alpha --sender <string>` claims an alphanumeric sender: 1 to 11 letters, digits, spaces, dashes or underscores, at least one of them a letter. Claiming costs nothing. Where a country asks for no registration, the sender can reach it as soon as that destination is enabled on the workspace; everywhere else it needs a registration first.

**Done when** the command returns a sender object with an `id` (`snd_…`). Keep that id: every other command in this group is keyed by it.

## Requirements

`bird sms senders requirements <sender-id>` returns one row per country the sender can reach: whether a registration is required there, where the sender stands with it, and what to do next. Read it before sending from a sender you have not used for a country, because holding a sender is not the same as being allowed to send from it. The response carries `next` steps that name the operation to call, so follow those rather than guessing.

## Registrations create

`bird sms senders registrations create <sender-id> --country-code <ISO-3166-1-alpha-2>` registers the sender for one country. `--category` (`transactional`, `marketing`, `authentication`, `service`) narrows the registration to one message category; omit it to register for all.

What comes back depends on the country:

- **The country reviews registrations** → the record comes back `pending` and nothing is charged. It is billed if and when the registration is approved, and a refused answer comes back through _Requirements_.
- **The country reviews nothing** → the registration is approved on this call, and a priced alphanumeric sender is charged its setup fee and its recurring monthly subscription then. Registering a number is free.

**This can spend money, and nothing on this surface tells you in advance whether it will.** Whether a registration is priced depends on the country and the sender type, and neither this command nor _Requirements_ quotes a price. The one signal you can check is the sender's `type`: registering a number is always free, while registering an alphanumeric sender (`type: alpha`) may carry a setup fee and a recurring monthly subscription. So treat every `alpha` registration as a charge and confirm it with whoever owns the account first; there is no `--yes` gate on this command, and re-running it does not undo a charge.

**Done when** the command returns a registration object; `status` is `approved` or `pending`. `pending` means a reviewer holds it, and the sender cannot reach that country until it is approved.

## Traps

- **`402` is a wallet problem, not a validation problem.** The balance could not cover what was owed at the moment billing ran (on this call for an instantly approved country, on approval for a reviewed one). Top up, then call again.
- **`412` means an unmet trust gate.** The organization has not completed the identity verification that registering a sender requires; it is completed in the dashboard, then the command is retried.
- **`409` is a live registration for that country already.** To see what the sender holds for a country before retrying, read `bird sms senders requirements <sender-id>`: that country's row carries the registration's `status` (`approved`, `pending`, `rejected`, `suspended`, and so on), `rejection_reason` when it was refused, and `next`, which names the action to take. A `rejected` registration is resubmitted, and a `suspended` one reactivated, by calling `registrations create` again; only a live one (any status other than `rejected` or `suspended`) is refused with `409`.
- **`422` means a dedicated programme owns this case.** A US 10DLC campaign or a toll-free verification registers the sender instead, and short codes are ones Bird manages.
- **Only `alpha` senders are created here.** Dedicated numbers become senders when they are allocated from inventory, not through `create`.

These actions inherit the output (`--format`), exit-code, and credential-resolution conventions from the `bird-cli` entry; the credential step itself is [authenticate](authenticate.md).
