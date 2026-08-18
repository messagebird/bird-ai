# Verify

Verify a recipient with a one-time passcode: start a verification to send a code to a phone number or an email address, then check the code the recipient submits. `bird verify verifications` covers the flow (`create`, `check`, `next-channel`). There is no id to store — the check is identified by the same recipient the verification was started for.

## Procedure

- `bird verify verifications create`: Sends the passcode and returns the verification in `pending`; the passcode is never returned. Starting again for the same recipient re-sends the code after the resend cooldown rather than opening a second verification.
  - Submit the code the recipient entered to complete the verification, or advance to the next channel when they report the passcode never arrived. (`bird verify verifications check`, `bird verify verifications next-channel`)
- `bird verify verifications check`: Returns `success: true` when the code matches. A wrong or expired code returns `success: false` with a `reason`, not an error; only a missing verification (including one already resolved, which is no longer checkable), malformed input, or rate limiting is an error.
- `bird verify verifications next-channel`: Sends a fresh passcode on the next channel in the plan, keyed by the same recipient. Unlike starting again, it skips the resend cooldown and moves channel rather than repeating the current one; every passcode already sent stays valid, and `last_channel` names the channel used.
  - Submit whichever code the recipient received. (`bird verify verifications check`)

Then branch on what they asked for:

- **Send (or resend) a passcode** → _Create_ below.
- **Check a code the recipient submitted** → _Check_ below.
- **The recipient says nothing arrived** → _Next channel_ below.

## Create

`bird verify verifications create` starts a verification and sends the passcode. Give the recipient with `--phone-number <e164>` (verified over the phone channels enabled for its destination country, in the order that country's configuration sets), `--email <address>` (verified over email), or both; at least one is required.

- `--code-length <4–8>` overrides the configured passcode length for this verification.
- `--channels <a,b>` reorders or narrows the delivery channels to try (e.g. `--channels whatsapp,sms,telegram`); omit for the configured order. A channel the recipient's plan doesn't already allow is ignored, so this only trims or reorders, never adds. A list that leaves no usable channel fails with `422`.
- Free-form `metadata` (a correlation id, say) goes through `--body-file`; `bird verify verifications create --example` prints a complete, valid body and needs no credentials.

Starting a verification for a recipient who already has one in progress **re-sends** the code after the resend cooldown rather than opening a second one — so the same command both sends and resends.

**Done when** the command returns a verification object with an `id` and `status: pending`. The passcode is never returned; read it from wherever the recipient received it, then check it.

## Check

`bird verify verifications check <code> --phone-number <e164>` (or `--email <address>`) checks a submitted passcode against the verification for that recipient. The code is the positional argument; the recipient identifies which verification to check.

**Done when** the command returns a result. `success: true` means the code was correct and the verification is complete. A wrong or expired code returns `success: false` with a `reason` (for example `incorrect_code` or `expired`) — that is a normal result, not an error (exit `0`). A verification you have already resolved is no longer checkable and comes back as a missing verification (exit `3`), the same as one that never existed.

## Next channel

`bird verify verifications next-channel --phone-number <e164>` (or `--email <address>`) sends a fresh passcode on the **next** channel in the verification's plan, for a recipient who reports the code never arrived. It is keyed by the same recipient as a check, so there is still nothing to store.

Unlike creating again, it skips the resend cooldown and moves channel rather than repeating the current one. Every passcode already sent stays valid, so a late arrival can still be checked, and `last_channel` on the response names the channel it just used.

**Done when** the command returns the verification with `last_channel` advanced. A verification whose plan is exhausted returns `E13020 NoNextChannel` (exit `2`) — create the verification again to resend on its current channel instead.

## Traps

- **The check is not an error on a wrong code.** A bad or expired code returns `success: false` with a `reason` and exit `0`; only a missing verification (exit `3`), malformed input (exit `2`), or rate limiting is a real error. Branch on `success`, not the exit code.
- **No verification id.** Identify the check by the same `--phone-number`/`--email` used to create it; there is nothing to store between the two calls.
- **A phone number is not SMS-only.** In most countries a phone recipient is tried on WhatsApp first, then SMS, then Telegram; some countries default to SMS first. The destination country's configuration decides. Don't assume the channel a code went out on — read `last_channel`.
- **A billed send needs a funded workspace.** SMS, WhatsApp and Telegram all draw on the workspace's balance; an unfunded workspace fails that send and the error envelope carries the recovery.

These actions inherit the output (`--format`), exit-code, and credential-resolution conventions from the `bird-cli` entry; the credential step itself is [authenticate](authenticate.md).
