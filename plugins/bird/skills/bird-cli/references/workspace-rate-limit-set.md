# Set a workspace rate limit

Workspace rate limits only matter for organizations with several workspaces; with one workspace, the organization rate limits are all that apply, so do not suggest them otherwise. A limit left on the last workspace after a deletion still applies. While it has not expired it can be changed or cleared; an expired one can only be cleared, and no new limit can be set until the organization has several workspaces.

First [read the workspace's request rates](workspace-rate-limits.md). Use the returned policy key, unit, window, and readiness. Setting a workspace limit requires write permission on `org:workspaces`. Organization owners, organization administrators, and authorized master keys can use this permission. A workspace administrator's role does not grant this authority.

If the policy's `workspace_limit` already holds the requested value and expiry, the work is done: report the saved setting and send nothing. Setting a workspace limit also needs `attribution.status` to be `ready`; when it is `warming`, wait until `attribution.ready_at`.

Inspect `bird organization workspaces rate-limits update --example` and preview the intended request:

```sh
bird organization workspaces rate-limits update <workspace-id> <policy-key> \
  --value 300 --reason "Limit staging traffic" --dry-run
```

Run the same command without `--dry-run` when the change is authorized. Supply an `--idempotency-key` for the mutation and reuse it if the response is lost. Follow any human confirmation requested by the command; a key's API authority does not replace that confirmation.

The value is an integer from 1 to 10000000 in the policy's existing window. Setting or lowering a workspace limit keeps previously counted usage, so a workspace limit below current usage can refuse the next request. It reserves no capacity from sibling workspaces.

`--expires-at` accepts a future RFC 3339 timestamp. Omitting expiry on this replacement removes any previous expiry. To send an explicit null, use `--body-file` with `"expires_at": null`; preview that body before submitting it. An expired timestamp is refused. A readiness conflict means the workspace limit was not set; read readiness again before retrying.

Done when a fresh organization-governance read shows the requested value and expiry for the intended workspace and policy. Report observed usage separately from the saved setting.
