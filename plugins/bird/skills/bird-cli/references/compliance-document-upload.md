# Upload a compliance document

Read `bird compliance requirements` for the registration first. Check the item's `attachment_id` or `attachment_ids` and `state` first. If the state is `not_applicable`, stop. If suitable evidence is already supplied, approved, or in review, the upload is done; do not add another copy. Replace rejected or expired evidence, or an accepted answer explicitly marked `editable_for_verifier_repair`, only when a correction is needed. Then check `data_type`, `required`, `template_url`, and `max_items`. Upload evidence for a `document` item; use its blank form when it supplies one. If that form is missing locally, [download it](compliance-form-download.md) before completing it.

Check `bird compliance attachments list` for an existing suitable upload. [Inspect it](compliance-document-inspect.md) when its contents are uncertain. Reuse its id if it answers the requirement; otherwise run:

`bird compliance attachments upload --file proof.pdf --description "Utility bill"`

`--file -` reads stdin. PNG, JPEG, and PDF files up to 10 MB are accepted; contents determine the type. Uploading identical bytes returns the existing attachment. A draft attachment expires after seven days. Once a registration cites it, including a 10DLC or toll-free registration, it is retained as attached evidence and cannot be deleted.

Use the returned `tca_` id as `attachment_id` for a single document, or include it in `attachment_ids` when the requirement sets `max_items`.

**Done when** the document has an attachment id ready to cite in the requirement's answer.
