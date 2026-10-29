# Read workspace request rates

Workspace rate limits only matter for organizations with several workspaces; with one workspace, the organization rate limits are all that apply, so do not suggest them otherwise. A limit left on the last workspace after a deletion still applies. While it has not expired it can be changed or cleared; an expired one can only be cleared, and no new limit can be set until the organization has several workspaces.

With a workspace-scoped credential, `bird workspace rate-limits list` reports the shared organization limits and optional workspace limits for that workspace. Complete [authentication](authenticate.md) first if `bird auth status` does not report a valid credential.

For a workspace in your organization, use `bird organization workspaces rate-limits list <workspace-id>` with read permission on `org:workspaces`. The positional workspace ID selects the resource being inspected; it does not grant access to another organization. Workspace readers use the workspace command without receiving organization governance authority.

Read the policy's `unit` and `window_seconds` before comparing values. A request needs capacity under both the organization limit and any active workspace limit. The workspace limit reserves no shared capacity and can exceed the organization limit.

- `workspace_limit: null` means no local workspace limit. An expired setting remains visible with `status: expired`.
- `usage` is an observation at `observed_at`. Use `usage.status` to determine availability. When it is `unavailable`, remaining capacity is unknown. When it is `available`, a null `workspace_limit` and `workspace_remaining` mean no workspace limit applies; the organization limit still applies.
- Before setting a workspace limit, branch on `attribution.status`. `ready` can be set now. `warming` gives `ready_at`, the earliest time to check again. `unavailable` has no `ready_at` and does not become settable by waiting: workspace limits are not enabled in this region yet, so report that rather than retrying. Neither state removes a saved workspace limit, which can still be cleared.
- Organization governance reads remain available when a workspace limit binds, subject to the shared organization policy and the caller's permissions.

If the user requests a change, continue with [set a workspace limit](workspace-rate-limit-set.md) or [clear a workspace limit](workspace-rate-limit-clear.md). A read request alone does not authorize a change.

Done when the requested workspace and policy are identified, and the result distinguishes the configured workspace limit, active control, and observed availability.
