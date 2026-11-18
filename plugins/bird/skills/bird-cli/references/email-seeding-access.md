# Automatic Email Seeding access

Check `bird email seeding --help` and `bird auth status` for the installed command and intended workspace.

For missing permissions, complete [authenticate](authenticate.md): activity and settings reads need `inbox_insights:read`, while settings changes, rotation and stop need `inbox_insights:write`. A source send also needs `emails:write`. An unavailable runtime is a limitation to report, not a reason to change organizations, widen grants or toggle settings without the user's intent.

Settings changes, rotation and run-stop require an OAuth sign-in and [browser confirmation](operation-confirmations.md). The command proposes the frozen request; the person executes it from the review link. Chat authorization and CLI `--yes` do not replace that step. Keep the confirmation ID and resume the same proposal; a pending proposal does not establish that settings changed or a run stopped. CLI review links are emitted on stderr while stdout remains reserved for the completed result.

The trigger address identifies seeding examples within authenticated sends from this workspace. It grants no access or sending permission by itself. Authorized CLI/MCP calls can return and use it without a private capture facility. Include it when needed for the requested setup or example, and omit it from unrelated summaries. Existing log masking and response-cache protections remain in place. Activity lists do not include the trigger.

Done when the installed surface, workspace and required permissions are established. An enabled preference alone does not establish runtime readiness.
