# Delete a compliance document

Find the attachment with `bird compliance attachments list` and check its id and status. Follow `next_cursor` with `--starting-after` until you find the id or exhaust the pages. If it is absent, the operation is done. If its status is `attached`, stop: a registration has cited it and the retained evidence cannot be deleted. Proceed only when its status is `draft`. If its contents are uncertain, [inspect the document](compliance-document-inspect.md) before proceeding.

Before deleting, confirm the attachment with the user and explain that deletion is irreversible and prevents later submissions from citing it. Existing explicit authorization for this exact deletion satisfies the confirmation.

`bird compliance attachments delete tca_… --yes`

Read the attachment list again, following its pagination, to verify removal.

**Done when** the attachment is absent from the workspace list, or its `attached` status explains why it cannot be deleted.
