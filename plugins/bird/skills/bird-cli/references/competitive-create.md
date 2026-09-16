# Add a watched brand

Complete [Competitive access](competitive-access.md) with `competitive:write`. Check the [watchlist](competitive-watchlist.md) first; if the requested brand is already watched, report its entry ID without adding it again. If the panel `brand_id` is unknown, run [search](competitive-search.md).

`bird email competitive watchlist brands create <brand-id>` returns an entry whose `id` begins with `cwb_`. Keep that ID for reads and removal. Each entry uses one place in the organization's allowance across its workspaces. If creation returns `E10017`, report the exhausted allowance; do not remove another entry without authorization.

Use `--example` to inspect the body or `--dry-run` to preview it without creating an entry. `--body-file` accepts the same `brand_id`; a positional ID overrides the file's value. Reuse `--idempotency-key` when retrying the same addition.

Done when creation returns the watched entry and its ID, or the existing entry is identified.
