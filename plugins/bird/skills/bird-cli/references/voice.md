# Voice

Operate Bird Voice — SIP trunking — from the terminal. `bird voice calls list`/`get` is the call log, `bird voice legs list`/`get` the per-leg log under it, and `bird voice stats` the aggregates over it; `bird voice trunks`, `bird voice numbers`, and `bird voice destinations` read AND change what admits a call and where an inbound one goes. `bird voice verified-numbers` registers, verifies, renames and deletes the numbers the workspace may present.

`bird voice calls create` prepares a real outbound call with a published sequence for a person to confirm in the browser. SIP clients can also place calls through a trunk, including a PBX, the dashboard phone, and `bird voice tools test-call` (_Placing a test call_ below).

Branch on what they asked for:

- **What calls happened, or what is happening right now** → _Calls_ below.
- **Aggregates over a period — answer rates, durations, where the traffic goes** → _Stats_ below.
- **Why a call was refused** → _Diagnosing a refused call_ below; start there rather than reading one command at a time.
- **Changing what is admitted, or where an inbound call goes** → _Changing the configuration_ below.
- **Proving a trunk carries calls** → _Placing a test call_ below.
- **Calling a recipient with a published sequence** → _Creating an outbound call_ below.

## Creating an outbound call

Use `bird voice calls create --body-file call.json --idempotency-key <stable-key>`. The body contains `from`, `to`, and `sequence: {id, entry_node_id, trigger_data}`; `--example` prints the shape. `from` must be a permitted caller number and `to` an E.164 recipient. Create and publish the sequence in the dashboard first. `trigger_data` is an explicit JSON object matching the entry schema, including `{}` when no data is needed. `--from`, `--to`, `--sequence-id`, `--entry-node-id`, `--trigger-data`, and `--ringing-timeout-seconds` override body values. `--dry-run` previews the request without preparing or placing a call.

Both `voice_management:write` and `voice:write` are required. Authenticate with OAuth and present the returned browser review link to the user. A person reviews and runs the billable call there. The command waits for completion and returns exit `5` if confirmation ends without a recorded execution result. After interruption, reuse the same input and key with `--confirmation-id <opc_…>` to read the confirmation. For MCP, `voice_calls_create` takes the equivalent nested fields and required `idempotency_key`; resume with the original tool arguments, including the same key, and the returned request state. The state identifies the confirmation but does not replace its arguments. With dynamic MCP, repeat `execute` with the same tool and arguments and put the confirmation ID in `bird/confirmation-id` request metadata.

Persist one key per intended call before invoking the tool. Repeated invocations must reuse that key and identical input. A new key can create another charged call. The API replays an accepted request for three hours using the same key and exact request bytes; changed input with the same key conflicts. After an unknown or expired outcome, inspect the existing run and leg before proposing another call.

**Done when** the telephone outcome is verified: `202 Accepted` reserves `id`, `initial_leg_id`, and `sequence.run_id` but does not prove dialing or connection. Check the sequence's Runs tab in the dashboard, then `bird voice legs get <initial_leg_id>` once the leg registers. A final leg records its status, duration, billable duration, and cost. A failure before registration can leave no readable leg.

## Calls

`bird voice legs list` returns a page of legs, newest first, as a cursor envelope; page with `--limit` and `--starting-after`. `list` only emits JSON, so pull fields with `jq`.

The `--status` filter picks which side of the lifecycle you get, and this is the one trap:

- Omit it, or pass only final statuses (`answered`, `no_answer`, `busy`, `canceled`, `failed`, `rejected`, `unknown`), and you get completed calls.
- Pass only the in-flight statuses (`ringing`, `in_progress`) and you get the calls happening right now.
- Mix live and final statuses in one request to read both.

Other filters: `--direction`, `--sip-trunk-id`, `--call-id` (correlates the legs of one transferred or multi-party call), `--started-after`/`--started-before` (RFC 3339), and the number filters — `--from`/`--to` match one side as a **whole** number, `--number` matches a **fragment** on either side. Give whole numbers in international form.

Note `--from`/`--to` are party numbers here, but _dates_ on `bird voice stats` — the same split `bird email` has between its message list and its stats.

`bird voice legs get <vcl_…>` returns one leg. `--format text` prints a human card. The same id answers throughout the call's life, so this is what you poll to watch a call settle: while it is ringing or connected, `duration_ms`, `billable_ms`, `ended_at`, and `cost` are all null, and they fill in once it ends.

`bird voice calls list` groups legs into calls, newest first: each call carries `direction`, `started_at`/`ended_at`, `live`, `has_recording`/`has_transcript`, and the `parties` that took part. Its filters are `--search` (a fragment of a call ID or number), `--has-recording` and `--has-transcript`; there is no date filter, and a narrow search over a long history can time out, so for a time window list legs with `--started-after`/`--started-before` and take their `call_id`. `bird voice calls get <vcs_…>` returns one call. A call carries no cost or duration of its own — read its legs with `bird voice legs list --call-id <vcs_…>`. A call placed with `bird voice calls create` is not readable until its initial leg registers.

`bird voice legs trace <vcl_…>` returns what a sequence did on one leg: the nodes and commands it recorded, in order, with outcomes, errors, recordings and webhook requests, plus the frozen definition that ran. History can be truncated or incomplete (`truncated` says when limits dropped events), so a missing span does not prove a step never ran. It needs `voice_management:read` on top of `voice:read`, and it can reach 2 MiB, so redirect it to a file and query it with `jq` rather than reading it whole.

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

1. **Read the call.** `bird voice legs get <vcl_…>` — `rejection_reason` names the specific gate that turned the call away, and `sip_response_code` deliberately does not distinguish causes, so do not read it as one. (For the same reason, `bird voice stats by-response-code` will not tell you _why_ Bird refused a batch of calls — it reports SIP outcomes, and the refusals share one code. Go to `rejection_reason` on the records.) A call Bird turned away before any record existed will not be in the log at all, which itself points at credentials or the source address.
2. **Check the trunk.** `bird voice trunks get <spt_…>` (find the id with `bird voice trunks list`). Read `outbound_enabled` first: **a trunk with it false refuses every outbound call before any credential is considered**, and a new trunk carries no direction until one is turned on. Then admission: a trunk admits traffic through its address allow list (`ip_acls`), its allowed API keys (`allowed_api_key_ids`), or session credentials (`session_credentials_enabled`); **a trunk with all three empty or off admits nothing**, which is deliberate. `routing_configured: false` means no carrier route is live for the workspace yet — operator-managed, not something the customer can fix.
3. **Check the caller ID.** `bird voice verified-numbers list` — only a `verified` caller ID may be presented on an outbound call. `pending` means verification has not completed; `failed` is terminal (delete the caller ID and create it again to retry).
4. **Check the destination.** `bird voice destinations list` — a call to a country the workspace has not `enabled` is refused even when everything else is in order. A country whose `status` is not `available` is one Bird does not currently carry calls to at all, which no workspace setting overrides.
5. **Check the number, for an inbound call.** `bird voice numbers list` and match the call's `to` — `inbound_configuration.route` is what the number does with a call, and `reject` is where every number starts, so a number nobody has pointed anywhere refuses rather than reading as unset. Use `list`, not `get <vnu_…>`: a call record carries the dialled E.164 and no number id, and each list entry already holds both the route and the `id` the update takes.

The trunk, the destination and the number are fixable from here — see below. So is the caller ID: `bird voice verified-numbers create --phone-number <e164>` places the verification call, and `bird voice verified-numbers verify <verified-number-id> --code <code>` submits the code it reads out. `routing_configured` remains operator-managed.

## Changing the configuration

Each write below clears one of the refusals above. Read the resource first: every list-valued field on `trunks update` REPLACES its whole list rather than merging, so send the list you want to end up with, and an empty array clears it.

Not every field has a flag. `--display-name`, `--outbound-enabled`, `--inbound-enabled`, `--digest-algorithms` and `--session-credentials-enabled` are flags on `trunks update`; **`ip_acls` and `allowed_api_key_ids` have none, and are set only through `--body-file <path|->`** (`bird voice trunks update --example` prints the shape). Do not invent a flag for them.

- **Turn a direction on.** `bird voice trunks update <spt_…> --outbound-enabled` or `--inbound-enabled`. A direction has to be on before its settings can be set, and one update can do both at once. **Confirm either direction going OFF with the user first**: `--outbound-enabled=false` refuses every outbound call before any credential is considered, and `--inbound-enabled=false` releases every number the trunk answers, which turning it back on does not reclaim.
- **Create or delete a trunk.** `bird voice trunks create --display-name "…"` returns the Bird-assigned `domain` to configure in the PBX. **`bird voice trunks delete <spt_…> --yes` cannot be undone** — it takes the domain with it and every number the trunk answered is released, so confirm with the user before running it.
- **Point a number at a trunk, or forward it.** `bird voice numbers update <vnu_…> --route trunk --trunk-id <spt_…>`, or `--route forward --forward-to <e164> --forward-as dialed_number|calling_number`. The route replaces whatever was there, because a number has exactly one answer at a time, and `--forward-as` has no default so state it on every forward. **`--route reject` stops the number answering, and switching an already-routed number cuts its current path at once** — confirm either with the user first.
- **Enable a destination country.** `bird voice destinations update --destination NL=true`, repeatable and one country per occurrence, the same shape as `bird sms destinations update`. Only the countries you name change. **`--destination XX=false` refuses every call to that country from the moment the call returns** — confirm a disable with the user first. A body naming no country is refused rather than sent.

Every one of these takes `--dry-run` to print the resolved request unsent, and `--example` to print the body shape with no credentials.

## Placing a test call

`bird voice tools test-call <e164>` places one real call through a trunk, to prove the trunk works. It needs `baresip` on PATH (`brew install baresip`, `apt install baresip`), and it uses the machine's own microphone and speakers, so it is only worth running where a human can hear the result.

`--trunk` and `--caller-id` default to the workspace's first trunk and first verified caller ID, and both are printed when they are inferred. The call is capped by `--duration` (default 30s, max 2m).

The SIP password comes from the trunk's own admission, in this order:

- `BIRD_VOICE_TEST_CALL_API_KEY`, when set, is used as the secret on any trunk that challenges. It must be a `bk_` key the trunk allows.
- Otherwise, on a trunk with `session_credentials_enabled`, the command mints a session credential for the call. **Minting needs `voice:write`**, so a read-only voice grant fails at this step.
- Otherwise, an API key secret from `BIRD_API_KEY` when that is how the CLI is authenticated.
- A trunk with neither session credentials nor allowed keys is admitted by source address alone, and the command sends no password.

Check `bird voice verified-numbers list` first: a `verified` entry with `outbound_enabled: true` is ready to call from. Only when none fits, register one with `bird voice verified-numbers create --phone-number <e164>`, which places a real call, then submit the code from its verification call with `bird voice verified-numbers verify <verified-number-id> --code <code>`. A `verified` result with `outbound_enabled: false` means activation was refused. A 412 is incomplete identity verification (the user finishes it in the dashboard) or an eligibility review or denial (the user contacts support); a 503 is a pending or unavailable assessment, so retry later. Once resolved, run `verify <verified-number-id>` again without `--code` to reuse the saved proof, rather than deleting and re-registering. Configure allowed keys and session credentials through the CLI: `--session-credentials-enabled` is a flag, and `allowed_api_key_ids` goes through `--body-file`.

**Done when** the outcome is read off the record, not off the exit code: `baresip` exits 0 whether or not the call connected, so finish with `bird voice legs list --limit 1`. `--dry-run` prints the account file and the `baresip` command without dialing, which is also how to hand the line to some other SIP client.

## Traps

- **Creating a call and running `test-call` can incur calling charges.** `calls create` requires browser confirmation; `test-call` dials through the local SIP client.
- **The default list contains completed legs.** Include `ringing` and `in_progress` in `--status` to include live legs.
- **`bird voice legs list` is per-leg, `bird voice stats` is aggregate.** Reaching for `list` to compute a rate is the common mistake; the summary already has it.
- **`verified-numbers create` calls the number.** Registration places a real verification call to whatever number it is given, so register only a number the user controls. An expired or exhausted challenge is replaced by deleting the caller ID and creating it again: confirm with the user before `verified-numbers delete`, since deletion is permanent and the number stops being presentable until a new code is verified; clearing a label takes `--body-file` with `{"name": null}`, since `--name` cannot send a null.
- **Two different scopes, and this is the trap.** The call log, the stats and `session-credentials create` are on `voice`; **everything under `trunks`, `numbers`, `verified-numbers` and `destinations` is on `voice_management`**, so a `voice:read` grant reads the log and fails on the trunk. `calls create` needs both `voice_management:write` and `voice:write`. A plain `bird auth login` requests a read-only baseline carrying neither, so pass the required scopes explicitly.

These actions inherit the output (`--format`), exit-code, and credential-resolution conventions from the `bird-cli` entry; the credential step itself is [authenticate](authenticate.md).
