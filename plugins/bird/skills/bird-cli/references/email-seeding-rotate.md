# Rotate the seeding trigger

Complete [access](email-seeding-access.md). For a new rotation, read the sanitized [settings](email-seeding-settings.md) receipt. Rotation needs initialized settings; revision zero is not a rotation target. Do not initialize a workspace merely to rotate an address that does not exist. For an uncertain response, preserve the saved request revision and key instead of replacing them from a fresh read.

Explain that rotation invalidates the former trigger and permanently stops existing runs' ungranted copies. Already granted copies may still send. Ensure the user's authorization covers these effects and identify the authorized integration that needs the replacement. Existing explicit authorization covers the intent; the [browser confirmation flow](email-seeding-access.md) still requires the person to execute the frozen request.

Retain the response, then compare its trigger with current settings before storing it in the authorized integration. The shell example passes the address through stdin to the integration’s configuration writer; MCP can use the returned address directly.

Before the first call, choose an explicit idempotency key and retain it with the exact body. Without an explicit key, command confirmation derives a key from the exact request. Repeating that request can recover its proposal under the same OAuth grant and workspace, including after access-token refresh or a new chat; the derived key is not returned as a caller-owned recovery key. Use a new explicit key for a new intent. A lost review link can also be recovered by [listing pending confirmations](operation-confirmations.md), without a saved confirmation ID. For a new rotation, the pattern below also needs the actual integration store command and an initialized current revision. An uncertain retry uses its original saved revision and key instead:

```sh
set -o pipefail
: "${seeding_rotation_key:?Retain one key for this intended rotation}"
: "${seeding_revision:?Use the current revision for a new rotation or saved revision for a retry}"
resp=$(bird email seeding address rotate --expected-revision "$seeding_revision" \
  --yes --idempotency-key "$seeding_rotation_key") &&
current=$(bird email seeding settings get) &&
value=$(printf '%s\n%s' "$resp" "$current" | jq -ser '
  if (.[0].trigger_address | type == "string" and length > 0) and
     .[0].trigger_address == .[1].trigger_address
  then .[0].trigger_address
  else error("recovered trigger is not current") end') &&
printf '%s' "$value" | <integration-config-writer-reading-stdin> &&
printf '%s' "$current" | jq 'del(.trigger_address)'
```

An exact command retry can recover the same pending proposal, return a recorded result, or fail. Resume the saved confirmation instead of creating another rotation. For a pending proposal, retain its review URL and wait for browser execution; it does not establish a rotation result. A recorded successful result confirms the rotation intent succeeded; success alone does not identify which underlying attempt performed it. A retained successful replay includes the saved trigger address. Settings reads can recover the current address, which may differ from an older replay.

Compare the recovered and current trigger addresses before updating an integration. Preference updates preserve an initialized trigger. A higher settings revision may reflect preferences alone; neither it nor the pre-rotation expected revision establishes trigger identity.

If storage fails, retain the rotation response and repeat the example from `current=` onward: read, compare, then store. Do not repeat the rotation to recover a storage failure. For an uncertain rotation response, obtain approval for a manual retry if not already authorized and reuse the exact body, revision and key.

A recovery error proves neither that the original rotation succeeded nor that it had no effect. E27010 establishes a stale revision; preference edits as well as rotation can advance it. Read and reassess the current settings against the authorized intent. A revised rotation uses a new key; advancing the revision under the old key does not recover the original request.

Bird settings do not establish what the integration stored. Verify the integration separately before claiming it is up to date or needs no change.

Done when the authorized integration holds the current address and the sanitized receipt reports the current settings revision. Report any integration update still outstanding.
