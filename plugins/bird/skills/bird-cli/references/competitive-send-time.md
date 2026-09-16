# Read sending patterns

Complete [Competitive access](competitive-access.md) with `competitive:read`. If the requested workspace entry ID is unknown, read the [watchlist](competitive-watchlist.md). Use the requested IANA timezone, or omit it for UTC.

`bird email competitive watchlist brands send-time <watchlist-brand-id> --timezone America/Los_Angeles` returns the sending pattern for the last 90 days. It takes no range flag. The response's `timezone` labels the hours, and `peak_send_window` can be null.

Done when the pattern, timezone, and any missing-measurement status are reported.
