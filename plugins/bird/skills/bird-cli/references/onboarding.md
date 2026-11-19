# Create a Bird account

Use this browserless flow to create an account, organization, and workspace. If the account already exists, use `bird auth login --device` instead; this flow mints and stores a credential for subsequent commands.

Signup and email verification do not require a region. Choose `--region us1` or `--region eu1` when creating the organization; the CLI routes that request to the selected region unless `--base-url` or `BIRD_API_URL` supplies an explicit host. An explicit host must serve the selected region; a region mismatch is rejected. Remove an inherited override to use automatic regional routing, or set it to a host serving that region.

Four steps, each feeding the next:

1. `bird auth signup <email>` creates the account and emails a six-digit code. It sets no password — the same magic-link path the dashboard uses — so the emailed code is all you need.
2. `bird auth verify-email <email> --code <code>` signs you in and, for a brand-new account, returns a single-use `onboarding_ticket`. The code arrives by email, so it comes from outside the CLI: read it from the inbox when the agent operates that address itself, and otherwise ask the person who owns the address for it.
3. `bird auth terms` returns the current Terms `version` and the `url` of its page. Show the page to the person who will own the organization and ask whether they agree on its behalf. Accept only on their explicit answer.
4. `bird auth create-org <org_name> --workspace-name <name> --region <region> --onboarding-ticket <ticket> --accept-terms <version>` creates the organization and its first workspace, then stores the minted credential so `bird` and the MCP server authenticate as you. The CLI and MCP require the ticket; a bearer credential does not replace it. Creation consumes the ticket. If creation commits but the response is lost, use `bird auth login --device` to access the existing organization. The consumed ticket cannot issue another credential. Without `--accept-terms` it returns `E02100` when acceptance is required and leaves the ticket unspent. On local stdio MCP, read `auth_terms` and pass the accepted version as `accept_terms` to `auth_create_org`.

Each step's `--response-schema` prints what it returns, and each write's `--example` prints a ready-to-edit body. These flags need no credential.

## Done when

`bird auth status` reports `valid: true` for the new workspace.
