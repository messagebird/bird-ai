# Search brands

Complete [Competitive access](competitive-access.md) with `competitive:read`. Obtain the brand name or sending domain the user wants to find.

`bird email competitive brands search "Acme Outdoors"` returns panel catalog matches. Keep the returned numeric-string `brand_id` for a later watchlist addition if requested. Searching does not add an entry.

Done when matching brands and their identifiers are reported, or the successful response contains no matches.
