# AMS MVP Prototype — Development Plan v1

## Context

This plan extends the original `development-plan.md` (Phases 0-6, all complete) with new work items identified from the expanded TRD v1 (`ams-trd-v1.md`). TRD v1 filled in all previously empty Design and Acceptance Criteria sections, added 3 Non-Functional Requirements, and detailed architectural layers.

**Baseline:** Phases 0-6 complete. 115 ACs, 245 tests, 41 test files. All quality gates green.

**Scope:** Frontend prototype only. Backend-only requirements are documented at the end as out-of-scope.

---

## Completed Phases (Reference)

| Phase | Name | ACs | Tests |
|-------|------|-----|-------|
| 0 | Foundation | 23 | 69 |
| 1 | Auth & Role System | 27 | 102 |
| 2 | Public Marketplace | 20 | 137 |
| 3 | Consumer Dashboard | 19 | 166 |
| 4 | Merchant Dashboard | 19 | 193 |
| 5 | Admin Dashboard | 17 | 220 |
| 6 | Consumption Endpoint Simulation | 13 | 245 |

---

## Phase 7: Merchant & Admin Lifecycle Enhancements

**Goal:** Align merchant and consumer lifecycle states with TRD v1 specifications. Add missing admin governance capabilities.

**Depends on:** Phases 0-6

**Build:**

### 7.1 Merchant Lifecycle States (FR4-ADMIN-01)

TRD v1 specifies 4 merchant states: **Pending, Active, Suspended, Disabled**. Currently only Active/Suspended exist.

- Add `pending` and `disabled` to `UserStatus` type
- Update `admin-merchant-detail-page.tsx`:
  - Pending state → show "Approve" / "Reject" buttons
  - Active state → show "Suspend" / "Disable" buttons
  - Suspended state → show "Unsuspend" / "Disable" buttons
  - Disabled state → read-only, no actions (hard stop)
- Update `admin-merchants-page.tsx` — filter by all 4 states
- Update mock data — add a merchant in "pending" state
- Add mock handlers: `approveMerchantOnboarding`, `disableMerchant`
- Suspended/disabled merchant services hidden from marketplace catalog
- Status badge colors: pending=yellow, active=green, suspended=orange, disabled=red

### 7.2 Admin Compliance & Risk Controls (FR4-ADMIN-01)

TRD v1 specifies: flag merchant for review, block new subscriptions, monitor usage anomalies.

- Add "Flag for Review" action on merchant detail page (sets a `flagged: boolean` on merchant)
- Flagged merchants show a warning badge in merchant list
- Add "Block New Subscriptions" toggle on merchant detail — prevents new consumer access requests for that merchant's services
- Add flagged/subscription-blocked filters to admin merchants page

### 7.3 Admin Credential Control (FR4-ADMIN-02)

TRD v1 specifies: admin can revoke API keys, force key regeneration, invalidate image license tokens.

- Add "Revoke All Keys" action on `admin-consumer-detail-page.tsx`
- Add "Force Regenerate Key" action per individual key in admin consumer detail
- Add confirmation dialogs for all destructive actions
- Log all actions to audit trail

### 7.4 Consumer Access Request Status (FR3-CONS-02)

TRD v1 specifies: dashboard shows access status (pending, approved, denied).

- Add "My Requests" section to consumer dashboard page showing recent access requests with status badges
- Add `/dashboard/requests` page — full list of consumer's access requests with status, service name, requested date, resolved date
- Add route and sidebar nav item
- Wire to existing `AccessRequest` type and mock data

**Spec:** `docs/specs/lifecycle-governance-enhancements.md`

**AC themes:**
- Merchant lifecycle transitions work correctly through all 4 states
- Disabled merchant's services disappear from marketplace
- Flagged merchants show warning in admin list
- Block-new-subscriptions prevents access request creation
- Admin can revoke all consumer keys in one action
- Consumer sees pending/approved/denied status for their requests
- All admin actions logged to audit trail

---

## Phase 8: Projects & Teams Enhancement

**Goal:** Upgrade Projects & Teams from basic stub to match TRD v1 RBAC specification with team-level resource management.

**Depends on:** Phase 7

**Build:**

### 8.1 Project RBAC (FR3-CONS-04)

TRD v1 defines 3 roles: **Owner** (full control), **Admin** (manage keys/services), **Member** (view/use only).

- Add `admin` to `ProjectMember.role` type: `'owner' | 'admin' | 'member'`
- Update `project-detail-page.tsx`:
  - Owner: manage members, manage keys, manage services, delete project
  - Admin: generate/revoke API keys, assign services
  - Member: view assigned services, view usage, copy existing keys
- Show role badge next to each member
- Add "Change Role" dropdown for owners managing members
- Add mock data with members in all 3 roles

### 8.2 Team-Level API Keys (FR3-CONS-04)

TRD v1 specifies: API keys can be created and managed at the Team/Project level.

- Add `projectId?: string` field to `ApiKey` type
- Update API key creation form — optional "Assign to Project" dropdown
- Project detail page shows keys belonging to that project
- Project-level keys inherit project's service assignments
- Members can view project keys; only Owner/Admin can create/revoke

### 8.3 Team Membership Management (FR3-CONS-04)

TRD v1 specifies: invite members via email, remove members, assign roles.

- Add "Invite Member" dialog on project detail page (email input + role selector)
- Add "Remove Member" action with confirmation
- Invitation flow (mock): existing user → direct add, new user → show "invite sent" toast
- All membership changes logged (mock audit)

### 8.4 Usage Filtered by Project (FR3-CONS-03)

TRD v1 specifies: usage data can be filtered by team/project.

- Add "Project" filter dropdown to consumer usage page
- Filter usage data by project's associated API keys
- Show project-level usage aggregation on project detail page

**Spec:** `docs/specs/projects-teams-rbac.md`

**AC themes:**
- Three roles enforced: Owner sees all controls, Admin manages keys, Member views only
- API keys can be assigned to a project
- Project detail shows project-scoped keys and usage
- Owner can invite, remove, and change member roles
- Usage page filterable by project
- All membership changes auditable

---

## Phase 9: Image & Licensing Enhancements

**Goal:** Upgrade Docker image management from stub to match TRD v1 licensing and pull flow specifications.

**Depends on:** Phase 7

**Build:**

### 9.1 Docker Image Type Enhancement (FR2-MERCH-02, FR2-MERCH-05)

TRD v1 specifies: license validity, provisioning status, TTL, usage model, versioning lifecycle.

- Add fields to `DockerImage` type:
  - `status: 'active' | 'deprecated' | 'disabled'`
  - `licensingModel: 'online' | 'offline-ttl'`
  - `licenseStatus: 'valid' | 'expired' | 'revoked'`
  - `ttlExpiresAt?: string`
  - `version: string` (semantic versioning)
  - `usageModel: 'execution' | 'pull' | 'time-based'`
- Update mock data with varied licensing configurations

### 9.2 Merchant Image Licensing Dashboard (FR2-MERCH-05)

TRD v1 specifies: merchants can view provisioning status, license validity, and restrictions.

- Update `merchant-images-page.tsx`:
  - Show license status badge per image (valid/expired/revoked)
  - Show licensing model (online/offline-ttl)
  - Show TTL expiry date for TTL-based images
  - Add "Deprecate Version" action
  - Add "Disable Version" action
- Add usage metrics per image (pull count, execution count)
- Add consumer access list per image

### 9.3 Consumer Image Pull Flow (FR3-CONS-05)

TRD v1 specifies: request pull → validate entitlement → generate short-lived token → pull.

- Update `images-page.tsx` (consumer):
  - Add "Request Pull Access" button per image
  - Show simulated pull flow: Validate entitlement → Check license → Generate token → Show pull command
  - Generated token shown once (with copy button), time-bounded display
  - Show license type indicator (online vs. offline-ttl)
- Add search/filter for consumer images page (by name, service, license type)

### 9.4 Image Validation Pipeline Visualization (FR2-MERCH-02)

TRD v1 specifies: validation pipeline on image push (signature, naming, tagging, service association, licensing config).

- Add validation pipeline component to `merchant-images-page.tsx`
- Visual step indicators: Verify signature → Validate naming → Check association → Validate license config → Mark Active
- Show pipeline status per image version (simulated)

### 9.5 Per-Service Consumer Blocking (FR2-MERCH-05)

TRD v1 specifies: merchants can block/restrict specific consumers on a per-service basis.

- Add "Block Consumer" action on `merchant-service-consumers-page.tsx`
- Block is per-service (not platform-wide like admin block)
- Blocked consumers shown with blocked badge
- Add "Unblock" action

**Spec:** `docs/specs/image-licensing-enhancements.md`

**AC themes:**
- Docker images show license status, TTL, and usage model
- Merchants can deprecate/disable image versions
- Consumer pull flow simulates token generation
- Validation pipeline visualizes all 5 steps
- Per-service consumer blocking works independently of platform-wide block
- Image search/filter works on consumer page

---

## Phase 10: Data Export & Reporting

**Goal:** Add export capabilities for usage reports and invoices as specified in TRD v1.

**Depends on:** Phases 7-8

**Build:**

### 10.1 Merchant Report Export (FR2-MERCH-04)

TRD v1 specifies: reports exportable in CSV and PDF, sharable with consumers, custom date ranges.

- Add "Export CSV" button on `merchant-invoices-page.tsx`
- Add "Export CSV" button on `merchant-service-consumers-page.tsx` (usage by API key)
- CSV export generates a Blob and triggers browser download
- Add date range picker for custom reporting periods on invoices page
- Add "Export PDF" button (generates a simple formatted text file as PDF simulation — full PDF generation is backend work, but we can simulate the trigger and show a toast)
- Add "Share Report" action (mock: shows toast "Report shared with consumer")

### 10.2 Consumer Usage Export (FR3-CONS-03)

TRD v1 specifies: consumers can access historical usage data for reporting and budget tracking.

- Add "Export CSV" button on consumer usage page
- Export includes: service name, API key, date, request count, cost
- Add date range filter for historical data (already partially exists)

### 10.3 Admin Report Export

- Add "Export CSV" button on `admin-governance-page.tsx` for audit logs
- Add "Export CSV" on admin consumer detail (usage data)

**Spec:** `docs/specs/data-export-reporting.md`

**AC themes:**
- CSV export downloads a valid CSV file with correct headers and data
- Date range picker filters data before export
- Export works on invoices, usage, and audit log pages
- PDF export shows simulation toast
- Share report shows confirmation toast

---

## Phase 11: Audit Trail & Observability Enhancements

**Goal:** Extend audit logging to cover all auditable actions specified in TRD v1.

**Depends on:** Phases 7-10

**Build:**

### 11.1 Comprehensive Audit Logging (FR3-CONS-01, FR4-ADMIN-01, FR4-ADMIN-02)

TRD v1 specifies: all key management, membership changes, and admin actions are auditable.

- Log consumer API key actions to audit trail: create, disable, revoke, regenerate
- Log project membership changes: invite, remove, role change
- Log merchant image actions: deprecate, disable, push
- Log consumer access requests: request, approve, deny
- All audit entries include: user, action, target, timestamp, metadata
- Update `admin-governance-page.tsx` — add filters for new action types

### 11.2 Notification Enhancements

TRD v1 specifies: notifications on approval events and threshold alerts.

- Add notifications for: access request approved/denied, service approved/rejected, merchant suspended, key revoked
- Add notification preferences stub (TBD card) on consumer/merchant dashboards
- Notifications link to relevant detail page when clicked

**Spec:** `docs/specs/audit-observability-enhancements.md`

**AC themes:**
- All key management actions appear in audit log
- Project membership changes appear in audit log
- Admin governance page filters work for new action types
- Notifications fire on approval/rejection events
- Notification click navigates to relevant page

---

## Out of Scope — Backend-Only Requirements

The following TRD v1 requirements are **not feasible for a frontend prototype** and are documented here for future full-stack implementation.

### System Architecture Layers (Backend)

| Layer | TRD v1 Requirement | Why Out of Scope |
|-------|---------------------|------------------|
| Identity Layer | External IdP (Microsoft Entra ID), JWKS endpoint validation, JWT processing | Requires real identity provider integration |
| API Gateway Layer | Azure API Management — programmatic API registration, policy enforcement, rate limiting, request/response tracing | Requires APIM infrastructure |
| Consumption & Event Processing | Azure Event Hub / Kafka, fire-and-forget async streaming, background workers | Requires event streaming infrastructure |
| Image Registry Layer | Azure Container Registry, scoped PAT tokens, registry abstraction interface | Requires container registry infrastructure |
| Data Layer | Structured DB for metadata, keys, usage, licensing, audit | Requires database infrastructure |

### Non-Functional Requirements (Backend)

| NFR | Description | Why Out of Scope |
|-----|-------------|------------------|
| **NFR1: Monitoring & Alerts** | Azure Application Insights integration, telemetry collection (API metrics, exceptions, dependency calls), distributed tracing with correlation IDs, alert configuration for error rates and latency | Requires backend services and cloud monitoring infrastructure |
| **NFR2: Documentation Portal** | Public documentation portal with merchant/consumer onboarding guides, API examples, versioned docs aligned with releases | Requires separate documentation site; content authoring is a product decision |
| **NFR3: Consumption Endpoint Performance** | Stateless ingestion layer, horizontal scaling, burst traffic handling, idempotent event handling, retry mechanisms, dead-letter queues for malformed events | Requires backend infrastructure and load testing |

### Additional Backend-Only Items

| Item | TRD v1 Reference | Description |
|------|------------------|-------------|
| APIM Policy Automation | FR2-MERCH-01 | Auto-register APIs in APIM, apply consumption tracking, logging, and rate-limiting policies programmatically |
| Registry Abstraction Interface | FR2-MERCH-02 | `ImageRegistryProvider` interface (PushImage, ValidateImage, GeneratePullToken, GetImageMetadata, RevokeAccess) for vendor-agnostic registry |
| Image Security Scanning | FR2-MERCH-02 | Automated security scans on pushed images |
| Image Signature Verification | FR2-MERCH-02 | Cryptographic image signature validation |
| Offline TTL License Tokens | FR3-CONS-05 | Signed JWT license tokens with expiry for air-gapped environments — requires crypto/signing backend |
| Real-time Usage Streaming | FR2-MERCH-03 | High-throughput event ingestion with guaranteed delivery and deduplication |
| CDN Integration | NFR1-PERF-001 | Content delivery network for static assets and API caching |
| Redis Caching | NFR1-PERF-001 | Cache layer for frequently accessed content |
| CI/CD Pipelines | SDLC | Build, test, deploy automation |
| Environment Management | SDLC | Test/staging/production environments and release triggers |

### SEO (Partially Out of Scope)

TRD v1 specifies SEO-optimized marketplace pages with JSON-LD, OpenGraph metadata, and crawlable URLs. This is **partially feasible** but limited:

- **Feasible:** Friendly URL slugs (already using `/marketplace/:serviceId`), descriptive page titles
- **Not feasible in SPA:** Server-side rendering for crawlers, dynamic meta tags for social sharing, structured data indexing — requires SSR (Next.js/Remix) or pre-rendering

If SSR is adopted in a future stack migration, SEO can be added. For now, URLs are already clean.

---

## Spec Files Summary (v1 additions — 5 new specs)

| Phase | Spec File | FR Coverage |
|-------|-----------|-------------|
| 7 | lifecycle-governance-enhancements.md | FR4-ADMIN-01, FR4-ADMIN-02, FR3-CONS-02 |
| 8 | projects-teams-rbac.md | FR3-CONS-04, FR3-CONS-03 |
| 9 | image-licensing-enhancements.md | FR2-MERCH-02, FR2-MERCH-05, FR3-CONS-05 |
| 10 | data-export-reporting.md | FR2-MERCH-04, FR3-CONS-03 |
| 11 | audit-observability-enhancements.md | FR3-CONS-01, FR4-ADMIN-01, FR4-ADMIN-02 |

---

## Verification (per phase)

Same gates as original plan:

1. `npm run typecheck` — no TypeScript errors
2. `npm run lint` — no ESLint warnings
3. `npm run test` — all tests pass
4. `npm run build` — production build succeeds
5. Manual check at 320px, 375px, 768px, 1024px, 1440px
6. Visual check: Ahoy Tech dark theme design system applied

## Execution Process (per phase)

1. **Write specs** (all specs for the phase at once) → **STOP & WAIT** for user approval
2. **Plan tests** from approved specs
3. **Implement** via TDD (Red → Green → Blue) per acceptance criterion
4. **Run quality gates** (5 prototype gates)
5. **Present** completed work → **STOP & WAIT** for approval → generate feature docs
