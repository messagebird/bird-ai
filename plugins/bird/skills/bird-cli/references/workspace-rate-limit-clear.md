# Clear a workspace rate limit

First [read the workspace's request rates](workspace-rate-limits.md) and identify the requested policy. If its `workspace_limit` is already null, the desired state is present.

Workspace rate limits only matter for organizations with several workspaces; with one workspace, the organization rate limits are all that apply, so do not suggest them otherwise. A limit left on the last workspace after a deletion still applies. While it has not expired it can be changed or cleared; an expired one can only be cleared, and no new limit can be set until the organization has several workspaces.

Before clearing, identify the workspace and policy and explain that this removes the saved workspace limit and its expiry. Proceed only with the user's authorization for that identified removal; an explicit request to clear it already supplies authorization. With write permission on `org:workspaces`, run:

```sh
bird organization workspaces rate-limits delete <workspace-id> <policy-key> \
  --yes --idempotency-key <retry-key>
```

This removes the local constraint. The shared organization policy and existing consumption still apply. Clearing also works when the editor is unavailable or the stored setting has expired. Reuse the key for a retry after a lost response. `--yes` supplies command confirmation only after the authorization above.

Read the policy again through organization governance. A successful clear returns no policy body, and another clear of an absent setting succeeds.

Done when `workspace_limit` is null for the intended workspace and policy. A later set can add a new workspace limit, but neither operation resets consumption.
