# WhatsApp traffic statistics

Use [authentication](authenticate.md) for the workspace whose statistics are requested.

## Stats

`bird whatsapp stats …` reads aggregate views over your own WhatsApp traffic. Every subcommand takes an optional `--from`/`--to` window and `--timezone`; all of them emit JSON only, so pull fields with `jq`. The bounds are calendar days (`YYYY-MM-DD`) except on `hourly` and `inbound hourly`, which parse RFC 3339 instants (`2026-08-20T09:00:00Z`) and reject a bare day client-side; `summary` accepts either form and reports by day or by hour to match.

- **The period aggregate:** `bird whatsapp stats summary` returns counts (accepted, sent, delivered, failed, rejected), delivery and failure rates, read engagement, and latency percentiles. `--from`/`--to` default to the trailing 30 days here; `--compare previous_period` adds the deltas against the window before.
- **The series:** `bird whatsapp stats daily` and `bird whatsapp stats hourly` return one row per day or hour, gap-filled so a silent bucket is a zero row. `--from`/`--to` are optional: `daily` defaults to the trailing 30 days, `hourly` to the trailing 168 hours.
- **Restricting the aggregate or a series to one dimension:** `--template`, `--category`, `--phone-number` or `--tag`, one at a time. These work on `summary`, `daily` and `hourly` only.
- **The breakdowns:** `bird whatsapp stats by-error-code`, `by-template`, `by-template-category`, `by-tag` and `by-phone-number` each return the workspace's rows for that one dimension, ranked by volume (accepted volume, or failure count on `by-error-code`, whose rows carry only `error_code` and `count`), capped by `--limit` (default 50, max 200). `--from`/`--to` are optional and default to the trailing 30 days. A breakdown takes no dimension filter: it is already a single-dimension view. To follow one template or tag over time, filter `daily` by it instead.
- **Received messages:** `bird whatsapp stats inbound summary|daily|hourly` and `bird whatsapp stats inbound by-phone-number` count what customers sent you, separately from what you sent them.

Counts are attributed to the day the message was accepted, so a delivery confirmation arriving Wednesday for a message accepted the prior Monday lands in Monday's row; recent buckets under-report while callbacks are still arriving, and `period.data_as_of` in every response is how fresh the answer is.
