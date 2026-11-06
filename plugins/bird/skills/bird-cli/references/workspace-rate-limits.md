# Read workspace request rates

Workspace rate-limit controls apply to organizations with several workspaces, or with a manual limit or enabled allocation retained after deletion. With one workspace and neither, only the organization rate limits apply. An active manual limit retained on the last workspace can be changed or cleared; an expired one can only be cleared. No new manual limit can be set until the organization has several workspaces.

With a workspace-scoped credential, `bird workspace rate-limits list` reports the shared organization limits, manual limits, and automatic shares for that workspace. Complete [authentication](authenticate.md) first if `bird auth status` does not report a valid credential.

For a workspace in your organization, use `bird organization workspaces rate-limits list <workspace-id>` with read permission on `org:workspaces`. The positional workspace ID selects the resource being inspected; it does not grant access to another organization. Workspace readers use the workspace command without receiving organization governance authority.

Read the policy's `unit` and `window_seconds` before comparing values. A request needs capacity under both the organization limit and any active workspace limit. A manual limit can exceed the organization limit. Manual limits are subtracted before automatic shares are calculated; they do not guarantee capacity under the shared organization limit.

- `workspace_limit` is the saved manual setting; null means no manual setting. An expired setting remains visible with `status: expired`.
- `limit_source` identifies the active bound: `manual` uses the active manual setting, `automatic` uses `automatic_limit`, and `organization` means no workspace bound applies. For example, `workspace_limit: null`, `limit_source: automatic`, and `automatic_limit: 10` means an automatic bound of 10 in the policy window.
- `allocation_enabled` reports a saved allocation, including when a manual limit takes precedence. It can remain true after deletion leaves one workspace.
- `usage` is an observation at `observed_at`. Use `usage.status` to determine availability. When it is `unavailable`, remaining capacity is unknown. When it is `available`, `workspace_remaining` reflects the active manual or automatic bound. Use `limit_source`, not an absent manual setting, to decide whether a workspace bound applies; the organization limit always applies.
- Before setting a workspace limit, branch on `attribution.status`. `ready` can be set now. `warming` gives `ready_at`, the earliest time to check again. `unavailable` has no `ready_at` and does not become settable by waiting: workspace limits are not enabled in this region yet, so report that rather than retrying. Neither state removes a saved workspace limit, which can still be cleared.
- Organization governance reads remain available when a workspace limit binds, subject to the shared organization policy and the caller's permissions.

If the user requests a change, continue with [set a workspace limit](workspace-rate-limit-set.md) or [clear a workspace limit](workspace-rate-limit-clear.md). A read request alone does not authorize a change.

Done when the requested workspace and policy are identified, and the result distinguishes the configured workspace limit, active control, and observed availability.
