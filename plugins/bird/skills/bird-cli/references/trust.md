# Trust

Some organization-level checks gate what a workspace may do: acquiring a dedicated number, or registering an SMS sender. They are about the organization proving something about itself, not about a country's rules, and they are enforced whatever surface the write comes from. `bird trust` reads them and settles the ones that can be settled from here.

The refusal these produce is `E16000 TrustGateUnmet`, and it names only that a gate is unmet — never which one. So the read is not optional colour: it is the only thing that turns the refusal into a list of steps.

Then branch on what you have:

- **A write was refused with `E16000`, or you want to know before offering one** → _What an action needs_ below.
- **You want the whole picture for the organization** → _Every requirement_ below.
- **A requirement is unmet and you want to start settling it** → _Settling one_ below.

## What an action needs

`bird trust actions requirements <action>` lists the requirements one action depends on, each with whether the organization has met it and how it gets met. The actions are `buy_number`, `register_sender_id`, and `add_sender_id` (claim an alphanumeric sender). More may be added, so treat an unfamiliar value as valid rather than rejecting it.

Every requirement must be met before the action is permitted; the order they come back in is a suggestion, not a sequence.

**Done when** you have the list and can name the outstanding requirements by slug.

## Every requirement

`bird trust gates list` returns every trust requirement the organization must satisfy, and where each stands. `bird trust gates get <slug>` re-reads one, with the same fields, which is what to use after starting a verification rather than pulling the whole set again.

Two fields carry the decision:

- `display_status` — whether the requirement is met.
- `remediation.kind` — how it gets met. `hosted_verification` and `verify_flow` are yours to act on; `under_review` is a wait with nothing asked of you. `remediation` is `null` once the requirement is verified.

## Settling one

`bird trust gates verification create <slug>` starts a verification. It needs owner standing (see Traps), and the **gate's own kind**, not any flag you pass, decides which of two answers you get:

- **A provider-hosted requirement** answers with a `hosted_url`. Hand that link to the person whose identity is being checked and stop. Only they can complete it. Pass no destination for this kind.
- **A code-verified requirement** answers with the channel and a masked destination. Give the destination with `--email <address>` or `--phone-number <e164>`, one or the other and never both. Finish it with `bird trust gates verification check <slug> --code <code>` once they read the code back to you.

Then read the gate back with `bird trust gates get <slug>` to see the requirement move.

**Done when** `display_status` reports the requirement met, or you have handed over a `hosted_url`.

## Traps

- **The refusal names nothing.** `E16000 TrustGateUnmet` says a gate is unmet and its remediation says to complete the outstanding verification — neither says which. Call `bird trust actions requirements` for the answer; do not try to infer it from the refused write.
- **An agent cannot finish a hosted check.** A `hosted_url` is a handoff to a human, by design. The useful end state for an agent on that kind of requirement is the link delivered, not the gate met.
- **The code is one a person read to you.** `check` submits a code the customer received out of band. There is nothing to compose, and nothing on this surface shows it to you.
- **Two code failures carry no remediation.** `E16005 TrustVerificationCodeExpired` and `E16006 TrustVerificationAttemptsExhausted` are message-only. Both mean the same recovery: start again with `bird trust gates verification create`, because the old code is dead either way. `E16004 TrustVerificationCodeInvalid` is the retryable one, on the same verification.
- **Already verified is an error, not a no-op.** Starting a verification on a met requirement fails with `E16002 TrustGateAlreadyVerified`. Read the gate before starting one.
- **The two verification commands need owner standing; the reads do not.** `bird trust gates list|get` and `bird trust actions requirements` sit on the workspace-realm `trust` scope, so any credential reaches them. `bird trust gates verification create|check` sit on `org:trust`, an org-realm scope no workspace role grants — only an org owner or Bird staff holds it. An API key gets `403` there and always will: org-realm scopes are refused to API keys outright, because completing a verification is an act of consent by a person and a key has nobody behind it. The working path is a user credential: `bird auth login` signed in as the org owner. A plain login lands on a read-only baseline that excludes `org:trust`, so the write still needs the step-up (or `--scope org:trust`); a non-owner cannot be granted it at all. Retrying the start with the same key never succeeds.
- **The standing is the organization's, even though you call as a workspace.** The credential picks the workspace and the workspace names the organization, but the gates resolve against the organization. A second workspace under the same organization reads the identical set, and satisfying a gate once settles it for all of them.

These actions inherit the output (`--format`), exit-code, and credential-resolution conventions from the `bird-cli` entry; the credential step itself is [authenticate](authenticate.md).
