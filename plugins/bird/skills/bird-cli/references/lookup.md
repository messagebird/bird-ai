# Lookup

Find out about a recipient before you use it. `bird lookup email` grades an email address; `bird lookup phone-number` says what a phone number is. Both are reads — nothing is sent to the address or the number, and neither is a delivery test.

**Every answered lookup is billed.** That is the thing to know before running either one: these are paid calls, not free validity checks, and the two are priced differently (see _Billing and retries_). Building a request costs nothing — `--example` and `--dry-run` need no credentials and make no call.

Branch on what they asked for:

- **Is this email address worth sending to?** → _Email_ below.
- **What is this phone number — its network, its line type, whether it is live?** → _Phone number_ below.
- **What will this cost, or how do I retry safely?** → _Billing and retries_ below.

## Email

`bird lookup email --email <address>` grades one address per call.

**Decide on `result`**, not on `valid`. `result` is the verdict: `valid`, `neutral` (could not be confirmed either way), `risky` (will probably accept mail but is likelier than most to bounce or complain), `undeliverable`, or `typo`. `delivery_confidence` (0-100) grades that verdict rather than replacing it — the same score sits under `neutral` or `risky` for different reasons.

`valid` is the narrower question of whether the address is well-formed and its domain accepts mail at all. A real domain with no such mailbox is `valid: true` **and** `result: undeliverable`, so treating `valid` as "safe to send" is the mistake this field invites.

Two fields appear only when they apply: `reason` on an undeliverable address (`invalid_syntax`, `invalid_domain`, `invalid_recipient`), and `did_you_mean` when the address looks misspelled. Offer a `did_you_mean` back to whoever typed the original — it is a guess, and the address they meant may be neither one.

`flags` describes the address itself, not its deliverability, so a perfectly good address can carry one: `role` (addresses a function, not a person — consent is ambiguous and complaints likelier), `disposable` (throwaway provider, will stop existing), `free_provider` (a consumer mailbox — ordinary for consumer mail, a signal when you expected a business address).

Send the address exactly as you hold it. The part before the `@` is case-sensitive and nothing is lowercased for you, and a display-name form such as `Aisha <aisha@example.com>` is rejected rather than unwrapped.

**Done when** the response carries a `result`. Every verdict is a successful lookup — `undeliverable` is an answer, not a failure.

## Phone number

`bird lookup phone-number --phone-number <e164>` returns a free baseline; `--type` buys more on top of it.

The **free baseline** comes with every call: the number, its `flags`, and its `line_type` are always there, joined by `country_code`, `network_info` (the network serving it today) and `original_network_info` (the network that issued its range) whenever those could be identified. The two networks differ when the number has been ported, which is also what the `ported` flag marks.

**Omit `--type` and that is all you get** — no vendor call, no per-property charge. Pass it to buy blocks by name: `classification`, `porting`, `presence`, `roaming`, `sim_swap`, `score`. Each requested block comes back under its own name carrying its own `status`, and reading those three statuses is the whole trick to this command:

- `ok` — answered, the value is there, and **this is the one you pay for**.
- `unavailable` — no answer arrived; the block adds nothing and is not billed.
- `inconclusive` — an answer arrived but does not resolve the property, because the number is outside the data's coverage or the answer is one Bird cannot yet place. A real answer, and not billed either.

So a block present with only a `status` is one you asked for and did not get, while a block **absent altogether** is simply one you did not ask for. Neither is an error. More generally, anything with nothing behind it is left out rather than sent as null, so every field you can read is one Bird actually resolved.

`classification` is reported _beside_ the free `line_type`, not in place of it — it names the allocated service of the range from an intelligence source, so the two can disagree and both are worth reading.

**Done when** the response carries the baseline plus an `ok` block for each property the task actually needed. If a property you needed came back `unavailable` or `inconclusive`, retrying rarely changes it — that is a coverage answer, not a transient one.

## Billing and retries

The two commands are priced on different models, and this is the most expensive thing to learn by accident:

- **Email is one flat charge** per answered lookup, whatever the verdict. An `undeliverable` answer costs the same as a `valid` one.
- **Phone number is the lookup plus one charge per delivered property** — exactly the blocks whose `status` is `ok`. Requesting six properties and getting two back bills for two.

Pass `--idempotency-key` on anything you might retry. A repeat with the same key replays the stored answer instead of buying a second one, which is the difference between one charge and two on every network blip. The CLI's own automatic retries (see the entry's conventions) are already covered by this.

Both commands take `--body-file` (`-` reads stdin) as an alternative to the flags, and a flag overrides the matching body field. `--example` prints a ready-to-edit body and `--response-schema` prints the fields the command returns; both exit without calling the API.

## Traps

- **These are billed reads, not free validation.** Looping either one over a list to "clean" it is a real invoice — size it before you start.
- **`valid: true` is not "safe to send".** Decide on `result`; a valid domain with a missing mailbox is `undeliverable`.
- **An absent property block means you never asked for it**; a block with only a `status` means you asked and it could not be answered. Both are unbilled, neither is an error, and only the second is worth reporting.
- **`--type` is the only thing that costs extra on a phone lookup.** Requesting a property you will not read buys it anyway.
- **`result`, `reason` and both `flags` vocabularies are open.** Treat an unrecognized value as a future one rather than an error, and fall back on `delivery_confidence` or the free baseline.
- **Both commands need the `lookup` scope.** A token minted with an explicit `--scope` list that omits it fails with exit `4`; plain `bird auth login` includes it.
- **One recipient per call.** There is no batch form of either command.

These actions inherit the output (`--format`), exit-code, and credential-resolution conventions from the `bird-cli` entry; the credential step itself is [authenticate](authenticate.md).
