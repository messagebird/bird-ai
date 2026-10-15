# Media library

Manage workspace assets, their public URLs and folder placement.

## Check availability

Run `bird assets --help`. If the group is missing, update the CLI before continuing. Authenticate through [authenticate](authenticate.md) before making account requests.

## Upload and organize

- `bird assets upload --file ./banner.png --name "Summer banner"` uploads a local file. `--file -` reads stdin. `--dry-run` describes the request without uploading.
- `bird assets list --kind image` returns a cursor page. `get <id>` returns metadata and the public URL, including soft-deleted assets.
- `bird assets folders create --name "Campaign images"` creates a root folder. `--parent-id` nests it. Folder listing is flat and paginated; a parent may occur on a later page.
- `bird assets update <id> --folder-id <folder-id>` files an asset without changing its URL. A JSON body with `folder_id: null` moves it to the root; `alt_text: null` clears alternative text. `--body-file` accepts these explicit nulls.
- `bird assets references list <asset-id>` finds saved content the caller may read. Email-template usage requires `email_management:read` alongside `assets:read`.

Uploads publish a URL accessible without authentication. Identical bytes can return an existing asset with its existing metadata and folder unchanged. MCP's matching upload tool runs on local stdio; hosted MCP does not expose it.

## Remove library entries

Before `bird assets delete <id> --yes`, establish that removing the library entry is the user's intended action. Its URL continues serving existing content; this is not emergency takedown. `bird assets folders delete <folder-id> --yes` moves its contents to the parent and preserves asset URLs. A child-name conflict must be resolved before folder deletion can succeed.

## Done

The requested mutation succeeds and a read confirms the intended metadata or placement. After asset deletion, `get` shows `deleted_at`; after folder deletion, the folder is absent and its contents remain accessible in the parent.
