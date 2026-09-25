---
name: workflow
description: |
  Workflow MCP guidance for public-HTTPS API replay, destination-bound OS-keyring
  credentials, Hands effect contracts, flow recording, watches, data transforms,
  workflow chains, signed executor receipts, policy projections, and authorized
  MFA helpers. Use when repeated browser work may graduate to a verified API,
  when Hands needs a durable control plane, or when choosing among Workflow's
  dense ability groups.
---

# Workflow MCP

Workflow is a Rust MCP server organized into ability groups rather than aliases.
It is a durable state, authorization, policy, and receipt control plane. It does
not click, type, authenticate, administer a remote system, or call another MCP
server by itself.

The default `safe` profile omits secret tools. `operator` adds opaque
credential/MFA inventory for coordination with Hands. Local `admin` adds
enrollment, refresh, deletion, scope, and migration operations. Raw
`credential_get`, `totp_generate`, and `hotp_generate` output remains hidden
unless an admin explicitly enables the separate break-glass export switch and
passes each call's allow flag plus exact confirmation phrase. The independent
secrets-disable switch wins over every profile.

`flow_adapt_auto`, `flow_adaptation_revert`, `executor_trust_enroll`, and
`executor_trust_revoke` have a second, independent review gate; the trust
mutations also require `admin`. `scripts/mcp-census.ps1` is the executable
authority for the exact current profile/gate inventory.

| Ability group | Availability | Tools |
|---|---|---|
| API patterns | safe | `api_store`, `api_call`, `api_list`, `api_test`, `api_delete` |
| Credential inventory | operator/admin with secret backend enabled | `credential_list` |
| Credential management | admin with secret backend enabled | `credential_store`, `credential_delete`, `credential_refresh`, `credential_update_scope` |
| Raw credential export | admin + break-glass export gate | `credential_get` |
| Flow recording | safe; apply/revert separately gated | `flow_record_start`, `flow_record_step`, `flow_record_stop`, `flow_replay`, `flow_shadow_replay`, `flow_adapt`, gated `flow_adapt_auto`, gated `flow_adaptation_revert`, `flow_dispatch`, `flow_list`, `flow_delete`, `dispatch_list`, `dispatch_pause_all`, `flow_dispatch_report_outcome`, `flow_adaptation_report_outcome`, `flow_adaptation_history_prune` |
| Watches | safe | `watch_define`, `watch_list`, `watch_check`, `watch_schedule`, `watch_delete`, `watch_record_outcome` |
| Scheduler receipts | safe | `scheduler_receipt_record`, `scheduler_reconcile` |
| Data piping | safe | `transform_pipe`, `pipe_test` |
| Workflow chains | safe | `workflow_define`, `workflow_run`, `workflow_list`, `workflow_status`, `workflow_step_record`, `workflow_record_outcome`, `workflow_delete`, `workflow_cleanup_stale_runs` |
| Execution receipts | safe | `workflow_attempt_claim`, `workflow_effect_observe`, `workflow_execution_receipts` |
| Executor trust | safe list; admin + review gate to mutate | `executor_trust_list`, gated `executor_trust_enroll`, gated `executor_trust_revoke` |
| Policy projection | safe, compile-only | `workflow_policy_compile` |
| Receipt graph | safe, read-only | `workflow_receipt_graph` |
| Reproducibility comparison | safe, compare-only | `workflow_reproducibility_compare` |
| MFA inventory | operator/admin with secret backend enabled | `totp_list` |
| MFA management | admin with secret backend enabled | `totp_register`, `totp_register_from_uri`, `totp_delete` |
| Raw OTP export | admin + break-glass export gate | `totp_generate`, `hotp_generate` |
| Migration | admin | `migrate_dpapi_to_keyring` |

## Use Workflow when it is the more accurate route

Use Hands for current UI/network observation, login interaction, approved UI
action, and post-action read-back. Use Workflow to persist the reviewed plan,
effect contract, approval digest, least-privilege policy projection, executor
receipt, and result graph. Graduate to direct Workflow API replay only when the
underlying API is understood, authorized, stable enough to verify, and more
direct than replaying UI gestures.

Do not let a remembered flow override fresh evidence. Rotation alone is not a
reason to call an endpoint. When verification is needed, use `api_test` first
for zero-network validation. Set `execute_probe=true` only if the stored method
and endpoint are known to be a safe read. Return to Hands when the endpoint,
authentication path, or pinned Hands contract changes.

A recorded flow is a reusable plan, not proof that the current site still has
the same state. Preview consequential runs and revalidate external assumptions.

Automatic retries are safe by default only for GET, HEAD, and OPTIONS. A retry
policy on POST, PUT, PATCH, or DELETE must include a fresh per-call
`idempotency_key` or non-empty per-call idempotency header. Never persist and
reuse one idempotency value across separate operations.

## Credential and network boundary

Secret values live in the operating system keyring. Workflow metadata stores the
reference name, credential type, compatibility scope/origins, and exact reviewed
API bindings. A credential is injected only after all of these checks pass:

1. The resolved request is public HTTPS.
2. The API name matches the stored scope.
3. The exact scheme, host, and port match an allowed origin.
4. An immutable binding matches API name, normalized method, canonical origin,
   and stable API revision.
5. DNS resolves only to public addresses.
6. Redirects are disabled.
7. Mutating retries have a per-operation idempotency contract.

Stored or per-call credential-like headers are rejected; use `credential_ref`.
A same-name API update cannot silently change origin. Legacy credentials without
both scope and destination policy fail closed until explicitly classified. If
OAuth refresh uses a different token host, include that exact HTTPS origin in
the same credential policy; refresh validates and pins it before reading
secrets.

`confirm_unrestricted`, `review_approved`, and similar parameters are server
interlocks, not evidence of human consent. The AI host still needs exact-call
consent for broad, consequential, or externally mutating operations.

Routine Hands coordination uses opaque references and metadata. Never export a
raw credential or OTP merely to pass it between tools. If an exceptional local
operator needs raw output, the admin profile, secret backend, break-glass
environment switch, per-call allow flag, and exact export phrase must all agree.
Treat the returned value as exposed to the host/model/transcript path.

## Safe graduation example

`credential_store` is an admin-only MCP secret-input route. Its `value` can
traverse the host, model, transcript, and provider logs; use the placeholder
below unless a local operator explicitly accepts that exposure. After
enrollment, prefer `credential_ref` and never retrieve the value for routine
replay.

```text
workflow:credential_store(
  name="demo_crm_bearer",
  value="<authorized value>",
  credential_type="bearer",
  scope="api:demo_customer_lookup",
  allowed_origins=["https://api.example.com"]
)

workflow:api_store(
  name="demo_customer_lookup",
  url_pattern="https://api.example.com/v1/customers/{id}",
  method="GET",
  credential_ref="demo_crm_bearer"
)

workflow:credential_update_scope(
  name="demo_crm_bearer",
  api_bindings=[{"api_name":"demo_customer_lookup"}]
)
# Review binding_preview, then echo its exact values with
# confirm_api_bindings=true.

workflow:api_test(
  name="demo_customer_lookup",
  params={"id":"123"}
)

workflow:api_call(
  name="demo_customer_lookup",
  params={"id":"123"}
)
```

The `api_test` call above validates locally. A live probe is appropriate only
for a known-safe GET, HEAD, or OPTIONS endpoint and requires
`execute_probe=true`.

If `api_store` uses `sign_with`, repeat the exact-binding preview/confirm flow
for `sign_with.secret_ref`. The signing secret stays in the keyring and is read
only after binding, destination, and DNS checks pass.

Do not place passwords, tokens, cookies, recovery codes, MFA seeds, OTP/HOTP
values, or OAuth client secrets in stored API headers, notes, policy outputs,
workflow traces, or examples. Prefer `credential_ref` over `credential_get`;
the latter returns the raw value into the model transcript and is unavailable
without the break-glass export gate.

## Hands control-plane contract

Before Hands performs an authenticated or administrative effect:

1. Observe current state with Hands and bind the intended effect to a versioned
   external contract.
2. Persist the canonical effect manifest and review its digest.
3. Compile the host policy projection with `workflow_policy_compile`; treat the
   output as staged advice with `installed=false`, `invoked=false`, and
   `enforcement_proven=false`.
4. For a mutating API call, supply the exact approved manifest digest and
   `confirm_external_effect=EXECUTE_REVIEWED_EXTERNAL_EFFECT`. DELETE also
   requires `confirm_destructive_effect=EXECUTE_REVIEWED_DESTRUCTIVE_EFFECT`.
5. Let Hands perform only the approved interaction, then independently read
   back the resulting UI or API state.
6. Record a bounded result receipt and inspect the branch with
   `workflow_receipt_graph`.

Pinned contracts reject raw secrets and redact OTP-like trace fields. Contract,
schema, or effect drift returns to review; it never silently widens authority.

Ordinary Git and GitHub work remains with Programmer or native Codex/Claude
capabilities. The GitHub administration example is a narrow reviewed recipe
over generic API patterns plus Hands verification for a proven native gap, not
a `github_*` tool family. Do not use it for repository transfer/deletion,
visibility, billing, membership, secrets, deploy keys, bypass grants, or other
high-risk account administration.

## Flows, watches, and workflow chains

- Flow tools record plans. `flow_shadow_replay` compares a persisted adaptation
  without execution or writes. `flow_adapt_auto` and
  `flow_adaptation_revert` remain hidden until the independent review gate is
  enabled, and each call still requires review approval.
- Flow/watch scheduling records desired requests, not host success. A receipt
  whose executor and evidence fields match the current request pin advances only
  Workflow's local projection (`projected_registration_status`,
  `projected_registered`, and `assertion_pin_matched`). An unsigned assertion
  does not authenticate the reporter. A valid Ed25519 attestation proves
  possession of an enrolled key for the exact canonical statement and time
  window, but still reports `host_attested=false`; neither form proves runtime
  registration or enforcement. Runtime truth requires independent host-native
  evidence.
- A matching assertion or signature never authorizes flow/watch deletion. A
  scheduled definition is first tombstoned with an unregistration request and
  remains local because `runtime_unregistration_proven=false`. Removal without
  an attested host lane requires an independent host check followed by
  `force_delete_unattested=true` and
  `confirm_unattested_delete=DELETE_LOCAL_DEFINITION_WITHOUT_HOST_ATTESTATION`;
  the result warns that a host task may be orphaned. Never-scheduled definitions
  can still be removed normally.
- Workflow chains return parameter-aware effect manifests and an execution
  gate. Unknown tools fail closed as unresolved; Workflow never gains direct
  access to other MCP servers.
- Use `workflow_attempt_claim` before an execution attempt and
  `workflow_effect_observe` afterward. These immutable records bind digests and
  executor identity without storing raw request/effect payloads. Optional
  Ed25519 attestations are verified against the public-key trust store. Workflow
  never holds executor private keys, and signature verification is not proof of
  host state or honest execution.
- `executor_trust_enroll` and `executor_trust_revoke` are two-pass, drift-safe
  admin operations behind the review gate. Inspect trust state with
  `executor_trust_list`; revoked or expired statements fail closed.
- `workflow_receipt_graph` keeps stale, orphan, unsigned, signed, and
  host-unattested branches visible with explicit proof classes.
- `workflow_reproducibility_compare` consumes exactly four evidence records in
  one call: x64 A/B and ARM64 A/B. It compares only within architecture and
  returns `pending_binary_verification`, never reproducibility proof, because it
  does not read the binaries. The PowerShell doctor must bind and verify all four
  PE files before a release can receive `verdict=pass`.
- `workflow_step_record` stores bounded traces and `workflow_record_outcome`
  records terminal caller-reported status. API request and response payloads are
  omitted; other summaries use best-effort redaction and remain inappropriate
  for secrets.
- Destructive maintenance and prune calls should be previewed and confirmed at
  the host boundary.
- Report real outcomes with the matching outcome tool. Do not let a recorded
  plan, dispatch, watch, signature, or policy projection become its own proof of
  success.

## Storage and recovery

Set `CPC_WORKFLOW_DATA_DIR` to an absolute directory for an isolated store.
Without it, Workflow uses a recognized legacy directory when present, otherwise
the platform default from `cpc-paths`. Metadata writes are atomic. Secret tools
fail closed when the OS keyring is unavailable; they never downgrade to
plaintext storage.
