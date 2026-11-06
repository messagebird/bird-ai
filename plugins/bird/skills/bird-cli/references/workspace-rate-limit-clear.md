# Clear a workspace rate limit

First [read the workspace's request rates](workspace-rate-limits.md) and identify the requested policy. If its `workspace_limit` is already null, there is no manual setting to clear. An automatic bound can still apply.

Workspace rate-limit controls apply to organizations with several workspaces, or with a manual limit or enabled allocation retained after deletion. With one workspace and neither, only the organization rate limits apply. An active manual limit retained on the last workspace can be changed or cleared; an expired one can only be cleared. No new manual limit can be set until the organization has several workspaces.

Before clearing, identify the workspace and policy and explain that this removes the saved workspace limit and its expiry. When the manual limit is active and `allocation_enabled` is true, also explain that the workspace rejoins automatic allocation, recalculating shares across the organization and potentially lowering other workspaces' automatic limits. Proceed only with the user's authorization for that identified removal; an explicit request to clear it already supplies authorization. With write permission on `org:workspaces`, run:

```sh
bird organization workspaces rate-limits delete <workspace-id> <policy-key> \
  --yes --idempotency-key <retry-key>
```

This removes the manual setting. If allocation applies, the workspace uses its automatic share; otherwise only the organization limit applies. The shared organization policy and existing consumption still apply. Clearing also works when the editor is unavailable or the stored setting has expired. Reuse the key for a retry after a lost response. `--yes` supplies command confirmation only after the authorization above.

Read the policy again through organization governance. A successful clear returns no policy body, and another clear of an absent setting succeeds.

Done when `workspace_limit` is null for the intended workspace and policy. Report the resulting `limit_source` and, when automatic, `automatic_limit`. A later set can add a new workspace limit, but neither operation resets consumption.
