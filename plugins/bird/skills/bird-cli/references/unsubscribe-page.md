# The hosted unsubscribe page

One page per workspace, shown to a recipient who unsubscribes from marketing email. `bird email unsubscribe-page` reads and restyles its settings: `get`, `update`. Nothing here opts anyone in or out — the page's own confirm button does that, and these two commands only change what it looks like.

## Read it

- `bird email unsubscribe-page get` returns the sender name the page shows, its three colors, and `example_url`, a link that previews the live page for a sample recipient. The preview is side-effect free: opening it opts nobody out and changes no suppression.
- A null on any of the four means the built-in default: the page shows the company name, and the built-in style with its automatic dark theme.

## Restyle it

- `bird email unsubscribe-page update` sets the sender name and the background, text and accent colors. Colors are hex, `#rrggbb`.
- Setting any color fixes the palette and turns the automatic dark theme off, so set all three or none.
- Clearing a value needs a JSON null, which no flag can carry, so pass the whole body: `bird email unsubscribe-page update --body-file -`. Run `--example` to print the shape.
- Changes reach new page views within a few minutes. Links already sent keep working and pick up the new settings.

## Traps

- **A partial update keeps what it does not name.** Omitting a color leaves the stored one in place; sending it as null is what returns it to the built-in style. The two are different requests, so build the body deliberately rather than reusing a previous one.
- **This is not the opt-out record.** These two commands change what the page looks like and nothing else: who has unsubscribed lives in the messaging-preference store, which no `bird` command reads today, so a question about a person's opt-out is not answerable from here.

These actions inherit the output (`--format`), exit-code, and credential-resolution conventions from the `bird-cli` entry; the credential step itself is [authenticate](authenticate.md).
