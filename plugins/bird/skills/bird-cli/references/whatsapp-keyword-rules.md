# WhatsApp keyword rules

Account reads and writes require [authentication](authenticate.md). Confirm the intended consent/reply behavior before changing a rule.

## Keyword rules

`bird whatsapp keyword-rules list` returns what a reply to one of the workspace's numbers does: Bird's own rules and the workspace's own, most specific first, which is the order an inbound message is matched against them. Filter with `--country`, `--waba`, `--operation` (`opt_out` or `opt_in`) or `--scope` (`system` or `workspace`). The list is not paginated: a workspace holds at most one rule per combination of operation, country and account.

`bird whatsapp keyword-rules get <id>` reads either scope from one `wkr_` id space; `scope` on the row says whose it is.

`bird whatsapp keyword-rules create --operation opt_out [--country US] [--waba 102290129340398] [--keywords ...] [--reply ...]` creates an override. `update <id>` changes `--keywords` and `--reply` only, and `delete <id> --yes` drops the override so Bird's rule answers the scope again.

- **`keywords` is additive, never a replacement.** A rule of yours stores only what you added; `effective_keywords` on the response is Bird's set plus yours. That is why a keyword Bird ships later starts matching with no edit from the workspace, and why `keywords` on a read looks emptier than the behaviour suggests.
- **On a `workspace` rule with no `country`, `effective_keywords` is not the whole matched set.** A `system` rule is exact whatever its country, because its set is its own row. For a rule of the workspace's with no `country`, the field carries Bird's worldwide set, because a read cannot know who will write; matching substitutes Bird's set for the sender's country, which can be larger. Do not present the field as the whole matched set for such a rule, and suggest setting a `country` when the workspace wants to see and extend exactly what those senders match.
- **`country` is the sender's, not the number's.** It is worked out from the person's own phone number, the only country signal WhatsApp sends.

## Traps

- **One keyword means one thing, and the refusal is a `409`.** A keyword another operation already holds cannot be registered — `stop` can never opt someone in — whether the word came from Bird's catalogue or from another of the workspace's own rules. The conflict is checked against the stored rows rather than the serving process's snapshot, so a rule written seconds ago still blocks.
- **A `system` rule is read-only, and says so as a `422` rather than a `404`.** `get` returns one of Bird's rules, so `update` or `delete` on that id refuses as not-editable; "not found" would be a lie about an id that resolves.
- **An unassigned country code is refused, not stored.** `--country XX` is a `422` naming the field. The code is checked against ISO 3166-1, because a rule narrowed to a country no sender can be in would match nothing and report nothing.
- **Clearing `--reply` takes a body, not a flag.** Omitting the flag leaves the stored reply alone; switching the auto-reply off while still recording the opt-out needs the explicit `null` that only `--body-file -` can carry, which is the same route every nullable field takes.
- **A keyword sent to a Bird-managed shared number is not classified at all.** Those numbers have no single owning workspace, so no rule of yours applies to them and nothing records that a reply arrived beyond a counter. Group messages are skipped for a different reason: whose consent a group STOP states is undecided.
