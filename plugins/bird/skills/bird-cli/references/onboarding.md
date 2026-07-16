# Create a Bird account

Use this to bring up a brand-new account, organization, and workspace from nothing — the browserless path an agent runs to become its own Bird customer. If the account already exists, use `bird auth login` instead; this flow ends by minting and storing the same credential a login would, so afterward every other command works unchanged.

There is no credential yet, so no region is known. Point the CLI at the region you want to sign up in with `BIRD_API_URL` (e.g. `https://eu1.platform.bird.com`); it carries through all three steps, and the `--region` on the last step must name that same host's region.

Three steps, each feeding the next:

1. `bird auth signup <email>` creates the account and emails a six-digit code. It sets no password — the same magic-link path the dashboard uses — so the emailed code is all you need.
2. `bird auth verify-email <email> --code <code>` signs you in and, for a brand-new account, returns a single-use `onboarding_ticket`. The code arrives by email, so it comes from outside the CLI — read it from the signup inbox, or have the person who owns the address relay it.
3. `bird auth create-org <org_name> --workspace-name <name> --region <region> --onboarding-ticket <ticket>` creates the organization and its first workspace, then stores the minted credential so `bird` and the MCP server authenticate as you. It is one-time: a second call returns `409`, and the ticket is single-use.

Each step's `--response-schema` prints what it returns, and each write's `--example` prints a ready-to-edit body — neither needs a credential, so you can inspect the whole chain before running it.

## Done when

`bird auth status` reports `valid: true` for the new workspace.
