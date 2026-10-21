# Set a workspace resource ceiling

Set or replace an optional workspace ceiling under the shared organization limit.

Complete [read workspace resource quotas](resource-quotas.md) first and confirm the requested key appears in its quota list. Setting requires `org:workspaces:write` and available configuration readiness. Inspect `bird organization workspaces quotas update --help` and `--example`, then prepare the body with `value`, `reason`, optional `expires_at`, and optional `force`. Each update replaces the saved expiry: omitting `expires_at` or sending `null` removes it. To change only the value while retaining a temporary ceiling, include its existing expiry explicitly.

Use `bird organization workspaces quotas update <workspace-id> <quota-key> --body-file <file> --dry-run` to inspect the resolved URL and payload locally before sending. Dry-run makes no API call and does not validate the target workspace, quota key, permissions, or readiness; the API checks these when the request is sent. A zero ceiling, or a counted ceiling below current usage, can block new work; mailbox storage can stop outbound sends immediately when the storage check succeeds. An unreadable workspace ceiling is skipped; readable organization limits and other send checks still apply. If the storage total cannot be read, this storage check allows the send. Obtain authorization for that concrete effect before submitting. `force` acknowledges a value below usage; it does not bypass the organization limit or remove resources.

Run the same command without `--dry-run` after authorization. Updating a ceiling does not require `--yes`; a below-usage value requires the explicit `force` acknowledgement. Supply `--idempotency-key` for an intent you may need to retry. Retain the same key and body after an uncertain result, including when its expiry passes; a changed intent uses a new key. A new expired intent fails validation.

Read the quotas again after a confirmed update; replica observations can lag. Permission failures require the organization's governance authority, not another workspace key.

Done when the response confirms the intended target, value and expiry. These commands inherit the output, retry and exit-code conventions in the Bird CLI skill.
