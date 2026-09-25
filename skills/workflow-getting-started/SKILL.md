---
name: workflow-getting-started
description: 'Getting started with the profile-aware Workflow control plane for public-HTTPS API replay, Hands effect contracts, exact-bound credentials, signed receipts, policy projections, receipt-reconciled flows and watches, and authorized MFA helpers. Use for first setup, first API graduation, first authenticated Hands plan, or choosing a host profile.'
---

# Workflow: Getting Started

Workflow is one Rust MCP server organized by ability rather than aliases. Its
surface is profile-dependent: `safe` is the default, `operator` adds opaque
credential/MFA inventory for Hands coordination, and local `admin` adds secret
management. Raw credential/OTP output stays hidden behind a separate admin
break-glass export gate. An independent review gate adds adaptation mutations
and admin trust-store mutations. Verify the current inventory with
`scripts/mcp-census.ps1`.

| Ability group | Availability | Purpose |
|---|---|---|
| API patterns | safe | Store and replay public-HTTPS API patterns |
| Credential inventory | operator/admin with secret backend enabled | Inspect opaque references and scope without exporting values |
| Credential management | admin with secret backend enabled | Keep values in the OS keyring and bind use to exact API definitions |
| Raw credential/OTP export | admin + break-glass export gate | Exceptional local output only; routine automation uses references |
| Flow recording | safe; apply/revert separately gated | Record plans, shadow-diff adaptations, request scheduling, and reconcile receipts |
| Watches | safe | Define checks, request scheduling, reconcile receipts, and report outcomes |
| Scheduler receipts | safe | Record observations and distinguish matched, pending, stale, and orphan state |
| Data piping | safe | Transform JSON between steps |
| Workflow chains | safe | Create parameter-aware effect plans and record compatibility outcomes |
| Execution receipts | safe | Bind plans, attempts, requests, observed effects, and caller-asserted executors |
| Executor trust | safe list; admin + review gate to mutate | Verify optional Ed25519 statements using enrolled public keys |
| Policy projection | safe | Compile staged least-privilege host projections without installing them |
| Receipt graph | safe | Show proof classes, retries, stale and orphan branches |
| Reproducibility comparison | safe | Check one four-record x64 A/B + ARM64 A/B evidence set; actual pass requires the four-binary doctor |
| MFA inventory | operator/admin with secret backend enabled | Inspect opaque enrollment metadata |
| MFA management | admin with secret backend enabled | Enroll/delete authorized keyring-backed MFA secrets |
| Migration | admin | Move legacy DPAPI records into the OS keyring |

## Recommended route

1. Use Hands for current UI/network observation, login interaction, approved UI action, and post-action read-back. Prefer an official API when one exists.
2. In an explicitly authorized local admin session, use `credential_store` only after the operator accepts that its secret argument can traverse the host/model/transcript path; include a narrow API-name `scope` and exact public-HTTPS `allowed_origins`.
3. Store a non-secret API pattern with `api_store` and a `credential_ref`.
4. Preview an exact binding with `credential_update_scope(api_bindings=[{api_name}])`, then echo the reviewed method, origin, and API revision with `confirm_api_bindings=true`.
5. Use `api_test` for zero-network validation. Set `execute_probe=true` only when the stored method and endpoint are known to be a safe read.
6. Return to Hands when the API changes or the site requires UI-only interaction.

For POST, PUT, PATCH, or DELETE, omit retries unless the service provides an
idempotency contract. When retries are appropriate, supply a fresh per-call
`idempotency_key` or idempotency header. Workflow refuses mutating retries
without one.

For an authenticated or administrative Hands action, persist a versioned
external-effect contract and canonical manifest, review its exact digest,
compile a staged policy with `workflow_policy_compile`, let Hands perform only
the approved interaction, then read the result back and inspect
`workflow_receipt_graph`. A compiled policy remains
`installed=false`/`invoked=false`/`enforcement_proven=false`; Workflow never
invokes Hands itself.

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
workflow:api_test(name="demo_customer_lookup", params={"id":"123"})
```

The example performs zero-network validation. A real request requires
`execute_probe=true` and is allowed only for a known-safe GET, HEAD, or OPTIONS
endpoint.

## Security boundaries

- `confirm_unrestricted` is only a server interlock; the AI host must obtain exact-call human consent for broad or consequential operations.
- API replay accepts public HTTPS only, disables redirects, rejects credential-like persisted headers, and refuses same-name origin retargeting.
- Legacy credentials without both scope and destination metadata fail closed until explicitly classified.
- `credential_store` is an MCP secret-input route; the current package has no shipped out-of-band enrollment helper. Use mock values unless the local operator explicitly accepts host/model/transcript exposure.
- `credential_get`, `totp_generate`, and `hotp_generate` reveal raw secret material to the model transcript and require the separate admin break-glass export gate. Prefer opaque references and `api_call`.
- A missing secure OS keyring disables secret tools; Workflow never falls back to plaintext secret storage.
- A valid Ed25519 statement proves enrolled-key possession for exact canonical bytes and a valid time window, not scheduler registration, host integrity, execution, or enforcement. Workflow stores public keys only.
- Ordinary Git/GitHub work remains with Programmer or native Codex/Claude. The narrow GitHub administration recipe is for a proven native gap and excludes high-risk repository/account operations.
- The hook-capable and skills-only plugins contain the same four skills and the
  same MCP registration. Install one profile, never both.
