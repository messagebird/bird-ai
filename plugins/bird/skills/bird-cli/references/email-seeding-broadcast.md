# Seed a broadcast

Complete [access](email-seeding-access.md). A seeded broadcast spends one seed test and sends billable seed copies when it sends, so establish that the user wants seeding for this broadcast. Changing the choice needs Inbox Insights write permission.

- Turn seeding on with `bird email broadcasts create --seed` or `bird email broadcasts update <broadcast-id> --seed`. Personal fields in the seed copies use their fallback values.
- To personalize them, add `--seed-contact <contact-id>` with a test contact the user names. Its personal details, links and attachments reach external seed mailboxes, so never pick a real customer.
- `--seed=false` sends no seed copies, even when the audience contains a contact at the trigger address. To go back to seeding only from such a contact, send `{"automatic_seeding": null}` through `--body-file -`.
- Each flag replaces the whole saved choice: `--seed` on its own removes a previously chosen contact.

Before sending, run `bird email broadcasts validate <broadcast-id>` and read problems with severity `warning`. They never block the send; the broadcast goes out without seed copies.

- `seed_example_value_missing`: the template requires the contact field at `pointer` and it has no fallback. Choose a test contact or have the user add a fallback.
- `seeding_not_configured`: save the workspace settings through [settings](email-seeding-settings.md) first.
- `seed_tests_exhausted`: no seed tests are left this period. Tell the user rather than retrying.

After the send, follow [activity](email-seeding-activity.md) with the broadcast ID.

Done when `bird email broadcasts get <broadcast-id>` reads back the intended `automatic_seeding` and validate shows no seeding warnings, or the user has accepted them.
