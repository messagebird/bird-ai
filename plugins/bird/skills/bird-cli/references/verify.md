# Verify

Verify a recipient with a one-time passcode: start a verification to send a code over SMS or email, then check the code the recipient submits. `bird verify verifications` covers both steps (`create`, `check`). There is no id to store — the check is identified by the same recipient the verification was started for.

Branch on what they asked for:

- **Send (or resend) a passcode** → _Create_ below.
- **Check a code the recipient submitted** → _Check_ below.

## Create

`bird verify verifications create` starts a verification and sends the passcode. Give the recipient with `--phone-number <e164>` (verified over SMS), `--email-address <address>` (verified over email), or both; at least one is required.

- `--code-length <4–8>` overrides the configured passcode length for this verification.
- `--channels <a,b>` reorders or narrows the delivery channels to try (e.g. `--channels email,sms`); omit for the configured order.
- Free-form `metadata` (a correlation id, say) goes through `--body-file`; `bird verify verifications create --example` prints a complete, valid body and needs no credentials.

Starting a verification for a recipient who already has one in progress **re-sends** the code after the resend cooldown rather than opening a second one — so the same command both sends and resends.

**Done when** the command returns a verification object with an `id` and `status: pending`. The passcode is never returned; read it from wherever the recipient received it, then check it.

## Check

`bird verify verifications check <code> --phone-number <e164>` (or `--email-address <address>`) checks a submitted passcode against the verification for that recipient. The code is the positional argument; the recipient identifies which verification to check.

**Done when** the command returns a result. `success: true` means the code was correct and the verification is complete. A wrong or expired code returns `success: false` with a `reason` (for example `incorrect_code` or `expired`) — that is a normal result, not an error (exit `0`). A verification you have already resolved is no longer checkable and comes back as a missing verification (exit `3`), the same as one that never existed.

## Traps

- **The check is not an error on a wrong code.** A bad or expired code returns `success: false` with a `reason` and exit `0`; only a missing verification (exit `3`), malformed input (exit `2`), or rate limiting is a real error. Branch on `success`, not the exit code.
- **No verification id.** Identify the check by the same `--phone-number`/`--email-address` used to create it; there is nothing to store between the two calls.
- **SMS draws on the workspace's SMS balance.** An unfunded workspace fails the SMS send; the error envelope carries the recovery.

These actions inherit the output (`--format`), exit-code, and credential-resolution conventions from the `bird-cli` entry; the credential step itself is [authenticate](authenticate.md).
