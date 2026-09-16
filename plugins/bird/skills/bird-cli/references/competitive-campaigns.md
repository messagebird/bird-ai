# List campaigns

Complete [Competitive access](competitive-access.md) with `competitive:read`. If the workspace entry ID is unknown, read the [watchlist](competitive-watchlist.md).

`bird email competitive watchlist brands campaigns list <watchlist-brand-id> --range 7 --limit 25` returns a campaign page. `--order` accepts `asc` or `desc` and defaults to `desc`; `--sort` is `sent_at`.

Follow `next_cursor` with `--starting-after`, or `prev_cursor` with `--ending-before`, preserving the brand, range, and ordering. Send one cursor direction per request. A null `next_cursor` marks the end of forward navigation. `refresh_cursor` anchors the first row: passing it as `--ending-before` reads rows preceding it in the selected sort order. For ascending order, refetch without a cursor to refresh the list.

`captured` and `promo_rate` describe a sample independently of the page; `truncated` can describe that sample or a cursor request. Use `next_cursor` to decide whether another page is available. Preserve campaign IDs as text for campaign detail, because floating-point conversion can change their digits.

Done when the requested page or requested extent of the list has been reported with its sample and availability limitations.
