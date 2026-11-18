# Read or replace seeding settings

Complete [access](email-seeding-access.md), then read settings. The example omits the trigger from a configuration-only receipt. Enable pipeline failure propagation before using command pipelines:

```sh
set -o pipefail
bird email seeding settings get | jq 'del(.trigger_address)'
```

For a read request, this receipt is the exit. If initialized settings already match the requested change, report them without another write. An explicit initial setup still needs an update at revision zero, even when disabled; a request merely to disable an uninitialized workspace does not need to create a trigger. Otherwise use the current revision and selections the user intends to retain. This is replacement: omitted `list_type`, `engagement_profile` and `regions` clear saved values, including when disabling. Preserve them explicitly when the user only wants to disable automatic seeding. Required `expected_revision` and `enabled` accept explicit `0` and `false`; null is not omission.

For enabling or choosing new selection values, complete [read seed configuration](inbox-insights-seed-configuration.md) with the verified sending domain and select returned options. Disabling while retaining preferences uses the saved selections directly; explicitly clearing preferences needs no option lookup. A manual seed-test registration is not required. Establish the intended preferences and sending consequences within the user's existing authorization: an active runtime may register tests and send billable copies from eligible sources.

All settings changes use the [browser confirmation flow](email-seeding-access.md), including initialization and harmless preference edits. Wait for the recorded result before reading back the saved settings.

Disabling enabled settings permanently stops existing runs' ungranted copies. Re-enabling does not resume them; already granted copies may still send. Explain this consequence and ensure the user's authorization covers the workspace-wide stop. Clarify a request merely to pause rather than treating it as authorization for this permanent effect.

Write the complete desired settings into a JSON body file. Before the first update, choose an explicit idempotency key and retain it with that exact body. Without an explicit key, command confirmation derives a key from the exact request. Repeating that request can recover its proposal under the same OAuth grant and workspace, including after access-token refresh or a new chat; the derived key is not returned as a caller-owned recovery key. Use a new explicit key for a new intent. A lost review link can also be recovered by [listing pending confirmations](operation-confirmations.md), without a saved confirmation ID. The following example only initializes disabled settings in a workspace whose read returned revision zero:

```sh
: "${seeding_settings_key:?Retain one key for this intended change}"
bird email seeding settings update --expected-revision 0 --enabled=false \
  --yes --idempotency-key "$seeding_settings_key" | jq 'del(.trigger_address)'
```

Use a new, retained idempotency key per intended change. If the response is lost, reassess the outcome and obtain approval for a manual retry if the existing request did not authorize it; reuse the exact body, revision and key. On E27010, read again and compare the changed selections with what the user authorized. Clarify a conflict that changes their approved intent before writing. A revised request uses a new key; changing a body under the old key does not recover the original request. A replay is its saved snapshot; a fresh settings read establishes the current configuration.

Done when the saved revision and complete preferences match the intended change. Report configuration separately from runtime availability.
