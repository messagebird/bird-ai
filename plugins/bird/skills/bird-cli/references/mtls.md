# Set up mTLS

mTLS has two directions with separate settings. `bird workspace mtls` makes the workspace require a client certificate on API requests. `bird webhooks client-certificate` makes Bird present a client certificate on webhook deliveries. Both need write access to `access_restrictions` in the workspace, and `bird webhooks test` also needs `webhooks:write`. An organization master key cannot run them. Complete [authentication](authenticate.md) first.

Bird enables each direction per workspace on request. When a setup command returns `E10027` (API mTLS) or `E10028` (webhook mTLS), stop: the workspace does not have that direction, and only Bird can enable it. Ask the user to contact their Bird representative.

Each settings change (`bird workspace mtls update`, `bird webhooks client-certificate update`) and each new CA (`certificate-authorities create`) goes to browser confirmation: the command prints a review link, and a person runs the change from the dashboard. These three commands need an OAuth login. An API key cannot run them. Over MCP, only a local server (`bird mcp`) offers `certificate-authorities delete`.

## API requests

1. `bird workspace mtls get` and `bird workspace mtls certificate-authorities list`. If the workspace already has a CA the user wants to keep, this is a rotation: add the new CA, move the clients, then delete the old one. A workspace has at most two CAs.
2. `bird workspace mtls certificate-authorities create --certificate-file issuing-ca.pem`. Prefer the issuing CA: a root CA also trusts the certificates of every CA under it.
3. `bird workspace mtls update --state evaluating`, unless the state is already `evaluating` or `enforced`. Both endpoints accept requests in this mode.
4. Move each client to the mTLS endpoint with a certificate from that CA. For the CLI itself, see [authenticate](authenticate.md).
5. `bird workspace mtls update --state enforced` only when each client succeeds on the mTLS endpoint. The standard endpoint then refuses API key calls for the workspace with `E02090`.

`--expected-san <san>` requires a subject alternative name in each certificate, and `--expected-san null` removes the requirement. Changes can take up to 15 minutes to apply. A delete of the last CA in `evaluating` or `enforced` returns `409`.

## Webhook deliveries

1. `bird webhooks client-certificate get`. If `signing_request` is set, a CSR is waiting, and the user's CA may be signing it. Ask the user before you replace it.
2. `bird webhooks client-certificate create-signing-request --csr-out bird.csr --yes`. Bird keeps the private key. A new request replaces a waiting one.
3. The user's CA signs the CSR with the `clientAuth` extended key usage. You cannot do this step.
4. If `certificate` was set in step 1, the upload replaces the certificate in use, and receivers that trust only the old one reject deliveries. Ask the user before you upload.
5. `bird webhooks client-certificate upload --certificate-chain-file signed-chain.pem --yes`, the signed certificate first.
6. `bird webhooks client-certificate update --state evaluating`.
7. `bird webhooks test <webhook-id>` for each webhook that is not a connector endpoint or an MCP Events subscription. Those never present the certificate. Real `realtime.*` deliveries do not present it either, even when the test reports `presented`. Continue only when `client_certificate` is `presented`. `not_requested` means the receiver did not ask for it, and `rejected` means it did not accept it.
8. SMS callback URLs have no webhook ID, so a test cannot reach them. If the workspace uses them, ask the user to send an SMS with `options.callback_url` set to each receiver, and to confirm in the receiver's logs that the callback presented the certificate.
9. `bird webhooks client-certificate update --state enforced`.

Deliveries can present the previous certificate for a few minutes after an upload, so receivers must accept both until then.

Done when `bird workspace mtls get` or `bird webhooks client-certificate get` shows the requested state, and each client, webhook or callback receiver was tested in `evaluating` first.
