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

Uploads publish a URL accessible without authentication. Identical bytes can return an existing asset with its existing metadata and folder unchanged. MCP's matching `assets_upload` tool runs on local stdio. For hosted MCP, use the upload-session flow below when available.

## Upload from a hosted agent

Check for `assets_uploads_create`, `assets_uploads_prepare`, `assets_uploads_get`, `assets_uploads_complete` and `assets_uploads_cancel`. These tools require `assets:write`, including status reads. A server that has not enabled uploads returns an availability error.

1. Check that the code environment can read the requested file, calculate its size and SHA-256, and make outbound HTTPS PUT requests. If file access is unavailable, explain that limitation and stop. Check access to the specific upload host after create returns an instruction.
2. In code, calculate the original file's exact size and lowercase hexadecimal SHA-256. Create a UUID for this upload intent. Call `assets_uploads_create` with `client_reference`, a `file` descriptor containing `filename`, `content_type`, `size_bytes` and `sha256`, and optional `name`, `alt_text` or `folder_id`. Keep the reference and input unchanged for retries.
3. Check the returned state before using `upload`. A completed replay already has its result; a finalizing session needs a status read after waiting; rejected, cancelled or expired intents need a new reference. If pending has no `upload`, follow `next`: wait 30 seconds, then retry the original create request unchanged. When `upload` is present, follow [Allow the upload host](#allow-the-upload-host), then in code PUT the original bytes to `upload.url`, with `upload.required_headers` and `upload.content_length`. Use an ordinary HTTP client with no Bird credentials or cookies. Keep the signed URL, required headers and file bytes out of chat and logs. Check the HTTP result before continuing.
4. Call `assets_uploads_complete` with the session ID. A successful completion returns a saved `result` and the canonical `asset` when available. Read `asset.url` for the public URL.

Ordinary MCP calls can surround the code-execution transfer; code does not need to call MCP itself. Keep file bytes out of tool arguments, base64 strings and model context. Session tools never read paths on the MCP server.

Use `assets_uploads_get` after an uncertain completion result. A completion retry returns the saved receipt and does not recreate a missing result. If a PUT instruction expires while the session is pending, use `assets_uploads_prepare` and retry the original bytes. Instructions are issued at least 30 seconds apart and do not extend the one-hour session. Use the same workspace and OAuth connection or API key that created the session: token refresh retains access, but reconnecting or changing keys creates a new owner. Completion must finish before the one-hour deadline; starting completion does not extend it. Cancel an unfinished intent with `assets_uploads_cancel`; an already-issued upload URL can still work until it expires, but a cancelled session cannot publish.

The equivalent CLI commands are under `bird assets uploads`. `create --body-file <descriptor.json>` accepts the descriptor without file bytes; `get`, `prepare`, `complete` and `cancel` take the session ID. Local CLI file uploads can continue to use `bird assets upload --file`.

### Allow the upload host

The MCP connector and the code environment can have separate network permissions. Binary transfer requires outbound HTTPS PUT access from the code environment to the hostname in `upload.url`. If network policy blocks that host, ask the organization's administrator to allow the exact hostname in the provider's code-execution network settings. Extract and share the hostname without the URL path, query or `required_headers`. Use the returned hostname rather than assuming a bucket or region, and avoid a wildcard covering all S3 hosts.

The hostname's allowlist entry covers new signed URLs with different paths and signatures. Another storage region may need another entry. Network permission does not make the bucket public or require AWS credentials. After setup, the agent can transfer files automatically using the returned instructions.

Report the observed connection error accurately. DNS failures and timeouts alone do not establish an allowlist block; check the environment's network policy.

After access is restored, use the same workspace and OAuth connection or API key that created the session. Read it with `assets_uploads_get`; status reads do not return an upload instruction. Follow the returned state and `next`. For a pending session, reuse a retained, unexpired instruction, or use `assets_uploads_prepare` if it is missing or expired, observing the 30-second refresh cooldown. Transfer the original bytes, then complete after a successful PUT.

A completed session needs no further transfer. Wait and read again if it is finalizing; an expired, rejected, or cancelled intent needs a new reference. Report publication after the session is completed.

## Remove library entries

Before `bird assets delete <id> --yes`, establish that removing the library entry is the user's intended action. Its URL continues serving existing content; this is not emergency takedown. `bird assets folders delete <folder-id> --yes` moves its contents to the parent and preserves asset URLs. A child-name conflict must be resolved before folder deletion can succeed.

## Done

The requested mutation succeeds and a read confirms the intended metadata or placement. After asset deletion, `get` shows `deleted_at`; after folder deletion, the folder is absent and its contents remain accessible in the parent.
