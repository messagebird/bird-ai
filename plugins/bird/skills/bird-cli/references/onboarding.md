# Create a Bird account

Use this to bring up a brand-new account, organization, and workspace from nothing — the dashboard-free path an agent runs to become its own Bird customer. If the account already exists, use `bird auth login` instead; this flow ends by minting and storing the same credential a login would, so afterward every other command works unchanged.

There is no credential yet, so no region is known. Point the CLI at the region you want to sign up in with `BIRD_API_URL` (e.g. `https://eu1.platform.bird.com`); it carries through every step, and the `--region` on the last step must name that same host's region.

Four steps, each feeding the next:

1. `bird auth signup <email>` creates the account and emails a six-digit code. It sets no password — the same magic-link path the dashboard uses — so the emailed code is all you need.
2. `bird auth verify-email <email> --code <code>` signs you in and, for a brand-new account, returns a single-use `onboarding_ticket`. The code arrives by email, so it comes from outside the CLI: read it from the inbox when the agent operates that address itself, and otherwise ask the person who owns the address for it.
3. `bird auth terms` returns the current Terms `version` and the `url` of its page. Show the page to the person who will own the organization and ask whether they agree on its behalf. Accept only on their explicit answer.
4. `bird auth create-org <org_name> --workspace-name <name> --region <region> --onboarding-ticket <ticket> --accept-terms <version>` creates the organization and its first workspace, records the owner's acceptance, then stores the minted credential so `bird` and the MCP server authenticate as you. It is one-time: a second call returns `409`, and the ticket is single-use. Without `--accept-terms` it returns `E02100` when acceptance is required, and leaves the ticket unspent so you can retry with it. On the local stdio MCP server, pass the version as `accept_terms` to `auth_create_org`, after reading it with `auth_terms`.

Each step's `--response-schema` prints what it returns, and each write's `--example` prints a ready-to-edit body — neither needs a credential, so you can inspect the whole chain before running it.

## Done when

`bird auth status` reports `valid: true` for the new workspace.
