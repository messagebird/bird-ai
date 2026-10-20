# Download a compliance form

Read `bird compliance requirements` for the registration and locate the document item's `template_url`. If it has no template, use the document the requirement requests. If a suitable local copy already exists, reuse it.

When `template_url` is `/v1/compliance/document-templates/cmt_…`, use its final path segment:

`bird compliance document-templates get cmt_… --output form`

An older requirement can carry the form's own file URL instead; fetch that URL as supplied. The JSON receipt names the content type and filename, so rename the saved file accordingly. Without `--output`, bytes go to stdout. Export a completed Word form to PDF before [uploading it](compliance-document-upload.md).

Hosted MCP embeds files up to 5 MiB. A larger blank form requires a download through the CLI, API, or SDK; the hosted tool has no signed download URL for it.

**Done when** the required blank form is saved and can be opened.
