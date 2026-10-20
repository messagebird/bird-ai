# Inspect a compliance document

Find the attachment with `bird compliance attachments list` and check its filename, content type, and status. Follow `next_cursor` with `--starting-after` until you find the id or exhaust the pages. If it is absent, report that the workspace has no matching upload.

`bird compliance attachments get tca_… --output proof.pdf`

Open the saved file to inspect its contents. Without `--output`, bytes go to stdout.

**Done when** the file is saved and its contents have been checked against the user's request.
