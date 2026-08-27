# Compliance identities

`bird compliance identities list` returns the businesses this workspace has stored as compliance parties. That is the only identities command the CLI has: creating, renaming and deleting a party are dashboard-only.

**What a party is for.** A registration is filed _for a business_. Naming the same party on more than one registration is what ties them together, and it is what lets a later form suggest details a reviewer has already approved instead of asking for them again. The party itself is just a name and whatever its registrations have taught it.

**Why you cannot create one here.** A party a caller creates is an empty container: its `answers` are read-only and fill in only when a submission is judged, so minting one gives you nothing you can use. It is also what separates parties inside a workspace for the purpose of reusing an approval, so one party per registration would leave nothing able to inherit from anything. Finding the party that already exists is the operation worth having; making one is a dashboard action, deliberately.

## List

`bird compliance identities list`. Newest first, and **paginated** — the response carries `next_cursor`, which you pass back as `--starting-after` to advance. `--ending-before` goes the other way and takes either cursor: `prev_cursor` steps back a page, and `refresh_cursor` anchors on that response's first row, which on the default newest-first order picks up the parties added since. `--limit`, `--sort` (`created_at` or `name`) and `--order` shape the page. Treat the first page as a page, not as the whole set: a workspace that registers on behalf of clients can hold many.

Each row is the party's `id` (`cid_…`), its `name`, and its `answers` — the business details it has had approved, keyed by requirement, each with when it was approved and when that approval lapses. A party that has never had a registration approved has an empty `answers`, which is normal rather than an error.

## Using the id

The `id` is what a registration names. From the CLI that means the 10DLC brand commands, and only those: `bird sms 10dlc brands create --identity-id cid_…` records which business the brand is for, and `bird sms 10dlc brands submissions create` takes it too — it can attach a party to a brand registered without one, though it cannot move a brand to a different party.

Toll-free verifications and a country's sender registration also name a party, but their operations are dashboard-only, so there is no CLI command to pass an id to. Use the dashboard for those.

Naming a party does not fill the registration from it, and does not fill the party from the registration. It records the association; the brand is still registered from the details in the request.

**Done when** you have the `cid_…` of the business the registration is for, or have established that the workspace has no party for it yet — in which case file the registration without one.
