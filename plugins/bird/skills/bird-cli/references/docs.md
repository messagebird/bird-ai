# Docs search

Answer how-to and reference questions about Bird from the documentation instead of guessing. One command: `bird docs search`. It is public — no authentication required, so the Step 0 auth check does not apply here.

## Search

`bird docs search --q "<question or keywords>"` returns the most relevant documentation sections as JSON, ordered by relevance. Each result carries:

- `title` / `section` — the page and the matching heading.
- `url` — deep link to that section.
- `markdown_url` — absolute URL that returns the whole page as Markdown. This is how you read the full text.
- `snippet` — a short preview of the match.
- `token_estimate` — approximate tokens of the whole page `markdown_url` returns, to budget the read.

Narrow with `--locale <code>` (e.g. `en-us`) and `--limit <n>` (1–25). Pass `--contents highlights` to get the matching passages when you only need to confirm which result is relevant before reading it.

## Read the full answer, don't answer from snippets

Snippets are previews, not answers. The flow is two steps, like a web search: search to find the right page, then read that one page in full.

1. Search, and pick the one or two results that actually match (use the `snippet`, or `--contents highlights`, and `token_estimate` to choose).
2. Fetch the chosen result's `markdown_url` to read the whole page, and answer from that.

Do not try to read every result in full — fetch only the page(s) you picked. There is deliberately no mode that returns full text for the whole result list; that would flood your context.

## Delegate the read to a subagent when you can

Reading a doc page fills your context with text you will not reuse. If your tooling can spawn a subagent, delegate the read so that noise stays in the subagent and only the answer comes back. Spawn one (e.g. the Explore or general-purpose agent) prompted roughly:

> Read <markdown_url>. Answer only this question: "<the user's question>". Return a 2-3 sentence answer plus the source URL. Do not paste the page.

With no subagent available, fetch the `markdown_url` and read it yourself.

## Recipe

1. `bird docs search --q "how do I verify a sending domain"` — find the right page; read the snippets to pick the best result.
2. Fetch that result's `markdown_url` (delegate to a subagent if you can) — read the whole page.
3. Answer from that text and cite the result's `url`.
