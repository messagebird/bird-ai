# Voice

Read Bird Voice — SIP trunking — from the terminal. `bird voice list`/`get` is the per-call log and `bird voice stats` the aggregates over it; `bird voice trunks`, `bird voice caller-ids`, and `bird voice destinations` read the three settings that decide whether a call is admitted at all.

Calls are placed by SIP clients — a PBX, the dashboard phone, or `bird voice tools test-call`, which drives a local `baresip` through a trunk (_Placing a test call_ below). Everything else here is a read: "what happened?" or "why was it refused?".

Branch on what they asked for:

- **What calls happened, or what is happening right now** → _Calls_ below.
- **Aggregates over a period — answer rates, durations, where the traffic goes** → _Stats_ below.
- **Why a call was refused** → _Diagnosing a refused call_ below; start there rather than reading one command at a time.
- **Proving a trunk carries calls** → _Placing a test call_ below.

## Calls

`bird voice list` returns a page of calls, newest first, as a cursor envelope; page with `--limit` and `--starting-after`. `list` only emits JSON, so pull fields with `jq`.

The `--status` filter picks which side of the lifecycle you get, and this is the one trap:

- Omit it, or pass only final statuses (`answered`, `no_answer`, `busy`, `canceled`, `failed`, `rejected`, `unknown`), and you get completed calls.
- Pass only the in-flight statuses (`ringing`, `in_progress`) and you get the calls happening right now.
- **Mixing the two in one request is rejected** (exit `2` on a 422): in-flight and completed calls are paged separately.

Other filters: `--direction`, `--sip-trunk-id`, `--session-id` (correlates the legs of one transferred or multi-party call), `--started-after`/`--started-before` (RFC 3339), and the number filters — `--from`/`--to` match one side as a **whole** number, `--number` matches a **fragment** on either side. Give whole numbers in international form.

Note `--from`/`--to` are party numbers here, but _dates_ on `bird voice stats` — the same split `bird email` has between its message list and its stats.

`bird voice get <vcl_…>` returns one call. `--format text` prints a human card. The same id answers throughout the call's life, so this is what you poll to watch a call settle: while it is ringing or connected, `duration_ms`, `billable_ms`, `ended_at`, and `cost` are all null, and they fill in once it ends.

**Done when** the record you wanted is in hand — for a settled call, one carrying a final `status` and a non-null `duration_ms`.

## Stats

`bird voice stats` is the aggregate view — use it instead of paging `list` and adding up records, since it is one request whatever the call volume. Five commands, mirroring `bird email stats`:

- `bird voice stats summary` — one row for the period: total and answered legs, answer-seizure ratio (`asr`), average call duration (`acd_ms`). Add `--compare previous_period` for deltas against the preceding equal-length window.
- `bird voice stats daily` / `bird voice stats hourly` — the same metrics as a time series, gap-filled with zero rows so a chart never interpolates.
- `bird voice stats by-country` — where the traffic goes and how each destination performs. Ranked by `--sort` (`total_calls`, `answered_calls`, `asr`, `acd_ms`; default `total_calls`) and capped by `--limit`.
- `bird voice stats by-response-code` — how calls ended, by final SIP response code.

Three things that catch people out:

- **`--from`/`--to` must use the same form.** Both calendar days (`2026-07-01`) or both RFC 3339 instants; mixing them returns 422. Days give whole-day buckets up to 365 days; instants give hour-grain buckets up to 30 days. Omit both and the server picks the default window.
- **Recent buckets keep filling in.** A call is recorded once it ends, so the newest rows are incomplete for a while. Every response carries `data_as_of` as the freshness boundary — read it before treating a dip as real.
- **A capped ranking is not a complete one.** The breakdowns cap rows at `--limit` (default 50, max 200) and report `total` separately, so compare the two before concluding a country or code is absent. To find the _worst_ performers, raise `--limit` past `total` and read from the bottom; on a capped ranking the last row is only the worst of those returned.

Rate fields are null rather than zero when their denominator is zero: `asr` when no calls were placed, `acd_ms` when none were answered.

## Diagnosing a refused call

When a call did not go through, work outward from the record, because the record already names the cause:

1. **Read the call.** `bird voice get <vcl_…>` — `rejection_reason` names the specific gate that turned the call away, and `sip_response_code` deliberately does not distinguish causes, so do not read it as one. (For the same reason, `bird voice stats by-response-code` will not tell you _why_ Bird refused a batch of calls — it reports SIP outcomes, and the refusals share one code. Go to `rejection_reason` on the records.) A call Bird turned away before any record existed will not be in the log at all, which itself points at credentials or the source address.
2. **Check the trunk.** `bird voice trunks get <spt_…>` (find the id with `bird voice trunks list`). Read `outbound_enabled` first: **a trunk with it false refuses every outbound call before any credential is considered**, and a new trunk carries no direction until one is turned on in the dashboard. Then admission: a trunk admits traffic through its address allow list (`ip_acls`), its allowed API keys (`allowed_api_key_ids`), or session credentials (`session_credentials_enabled`); **a trunk with all three empty or off admits nothing**, which is deliberate. `routing_configured: false` means no carrier route is live for the workspace yet — operator-managed, not something the customer can fix.
3. **Check the caller ID.** `bird voice caller-ids list` — only a `verified` caller ID may be presented on an outbound call. `pending` means verification has not completed; `failed` is terminal (the caller ID has to be deleted and re-created to retry).
4. **Check the destination.** `bird voice destinations list` — a call to a country the workspace has not `enabled` is refused even when everything else is in order. A country whose `status` is not `available` is one Bird does not currently carry calls to at all, which no workspace setting overrides.

## Placing a test call

`bird voice tools test-call <e164>` places one real call through a trunk, to prove the trunk works. It needs `baresip` on PATH (`brew install baresip`, `apt install baresip`), and it uses the machine's own microphone and speakers, so it is only worth running where a human can hear the result.

`--trunk` and `--caller-id` default to the workspace's first trunk and first verified caller ID, and both are printed when they are inferred. The call is capped by `--duration` (default 30s, max 2m).

The SIP password comes from the trunk's own admission, in this order:

- `BIRD_VOICE_TEST_CALL_API_KEY`, when set, is used as the secret on any trunk that challenges. It must be a `bk_` key the trunk allows.
- Otherwise, on a trunk with `session_credentials_enabled`, the command mints a session credential for the call. **Minting needs `voice:write`**, so a `voice:read` grant fails here and nowhere else.
- Otherwise, an API key secret from `BIRD_API_KEY` when that is how the CLI is authenticated.
- A trunk with neither session credentials nor allowed keys is admitted by source address alone, and the command sends no password.

Allowing a key on a trunk, turning session credentials on, and verifying a caller ID are all dashboard steps the CLI cannot take.

**Done when** the outcome is read off the record, not off the exit code: `baresip` exits 0 whether or not the call connected, so finish with `bird voice list --limit 1`. `--dry-run` prints the account file and the `baresip` command without dialing, which is also how to hand the line to some other SIP client.

## Traps

- **`test-call` is the only command that places one,** and it is a real billed call. Everything else here reads.
- **In-flight and final statuses cannot be combined** in one `--status` filter. Two requests, not one.
- **`bird voice list` is per-call, `bird voice stats` is aggregate.** Reaching for `list` to compute a rate is the common mistake; the summary already has it.
- **The only write is `bird voice session-credentials create`,** which mints a short-lived SIP password for a calling client (`test-call` calls it for you). Creating a trunk, registering a caller ID, or changing the destination allowlist is dashboard-only; there is no `bird voice … create` for any of them.
- **A `voice:read` grant covers every read here;** minting needs `voice:write`. A plain `bird auth login` requests a read-only baseline that carries no voice scope at all, so every command here needs `--scope voice:read` or `--scope voice:write` at login.

These actions inherit the output (`--format`), exit-code, and credential-resolution conventions from the `bird-cli` entry; the credential step itself is [authenticate](authenticate.md).
