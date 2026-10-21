# Read workspace resource quotas

Inspect the limits and observed usage that apply to a workspace.

Complete [authenticate](authenticate.md), then run `bird workspace quotas list` for the credential's workspace. For an organization-managed target, use `bird organization workspaces quotas list <workspace-id>` with `org:workspaces:read` authority. The target must belong to the credential's organization; a workspace-only grant does not confer organization governance.

The response lists the supported resource and value keys, configured organization limit and source, workspace ceiling and expiry, applied limit, and observed usage. A ceiling reserves no organization capacity. The current-workspace read withholds `organization_used`, `organization_remaining` and combined `remaining` as null, while keeping its own usage and ceiling headroom. The organization-authorized read includes shared observations. Usage is an observation, not a reservation; unavailable usage is not zero. Retention is a value bound without a usage counter, and mailbox storage is a soft outbound-send threshold.

An unsupported quota key remains unavailable; period allowances, live concurrency and spending controls are separate capabilities.

Done when the requested quota list is returned. These commands inherit the output and exit-code conventions in the Bird CLI skill.
