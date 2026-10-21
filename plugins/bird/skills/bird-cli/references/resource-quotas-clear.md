# Clear a workspace resource ceiling

Remove the optional workspace constraint while retaining the shared organization limit.

Complete [read workspace resource quotas](resource-quotas.md) and identify the saved ceiling first. Clearing removes only the workspace constraint, leaving the shared organization limit. After authorization for that change, run `bird organization workspaces quotas delete <workspace-id> <quota-key> --yes`. Clearing an absent ceiling succeeds and does not depend on readiness for new settings.

Supply `--idempotency-key` for an intent you may need to retry. After an uncertain response, retry the same command with the same workspace, quota key, and idempotency key. This DELETE has no request body. Read the quotas again after a confirmed removal; replica observations can lag.

Done when the removal succeeds for the intended target. These commands inherit the output, retry and exit-code conventions in the Bird CLI skill.
