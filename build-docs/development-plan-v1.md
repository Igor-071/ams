# AMS MVP Prototype — Development Plan v1

## Context

This plan extends the original `development-plan.md` (Phases 0-6) with work items identified from the expanded TRD v1 (`ams-trd-v1.md`). TRD v1 filled in all previously empty Design and Acceptance Criteria sections, added 3 Non-Functional Requirements, and detailed system architecture layers.

Since Phases 0-6 completed, significant post-phase enhancements were shipped. This plan accounts for the **actual current state** of the prototype.

**Scope:** Frontend prototype only. Backend-only requirements are documented at the end as out-of-scope.

---

## Current State (Baseline)

### Completed Phases

| Phase | Name | ACs | Tests |
|-------|------|-----|-------|
| 0 | Foundation | 23 | 69 |
| 1 | Auth & Role System | 27 | 102 |
| 2 | Public Marketplace | 20 | 137 |
| 3 | Consumer Dashboard | 19 | 166 |
| 4 | Merchant Dashboard | 19 | 193 |
| 5 | Admin Dashboard | 17 | 220 |
| 6 | Consumption Endpoint Simulation | 13 | 245 |

### Post-Phase Enhancements (already shipped)

| Feature | Tests Added | Running Total |
|---------|-------------|---------------|
| sessionStorage persistence (hmrCache) | — | 251 |
| Merchant Usage Page (chart + date range + detail + sort) | 13 | 276 |
| Consumer Usage Page (mirrors merchant usage) | 7 | 283 |
| Admin Usage Page (platform-wide analytics) | 12 | 295 |
| Admin Dashboard Charts (4 charts) | 4 | 299 |
| Merchant Dashboard Charts (4 charts) | 4 | 303 |
| Consumer Dashboard Charts (4 charts) | 4 | 307 |
| Inline Service Editing | 7 | 314 |
| Enriched Marketplace (metrics, features, quickStart) | 12 | 326 |

**Current totals:** 37 pages, 27 components, 57 handlers, 38 routes, 46 test files, 326 tests.

### What TRD v1 Requirements Are Already Covered

| TRD v1 Requirement | FR | How It's Covered |
|--------------------|-----|-----------------|
| Merchant usage dashboard with trends/spikes | FR2-MERCH-05 | `merchant-usage-page.tsx` with ConsumptionChart, date range picker, detail drill-down |
| Consumer usage per service / per API key / combined | FR3-CONS-03 | `usage-page.tsx` with By API Key & By Service tables, chart, detail page |
| Admin platform-wide usage oversight | FR4-ADMIN-01/02 | `admin-usage-page.tsx` with stat cards, chart, 3 breakdown tables |
| Historical data & trends for all roles | FR3-CONS-03 | Date range pickers + area charts on all usage pages |
| Service metadata (name, description, URL, version, pricing, auth, format) | FR2-MERCH-01 | Enriched `Service` type + marketplace detail page redesign |
| Service metrics (requests, consumers, uptime, success rate) | FR2-MERCH-01 | `getServiceMetrics` handler + metrics bar on detail page |
| Merchant can edit service configuration | FR2-MERCH-01 | Inline Edit/Save/Cancel on `merchant-service-detail-page.tsx` |
| Consumption endpoint simulation with validation chain | FR2-MERCH-03 | `consumption-simulator.tsx` + `usage-pipeline-viz.tsx` |
| Auth: Email OTP + Google SSO (mock) | FR1 | Login page with both flows |
| Auth: Role switching for dual accounts | FR1 | User menu role switcher |
| Public marketplace browsable without login | FR3-CONS-02 | `catalog-page.tsx` with search, filters, type badges |
| API key management (generate, configure, revoke, TTL) | FR3-CONS-01 | Full CRUD pages + detail page |
| Admin: merchant invite, suspend/unsuspend | FR4-ADMIN-01 | `admin-merchant-detail-page.tsx` |
| Admin: consumer block/unblock | FR4-ADMIN-02 | `admin-consumer-detail-page.tsx` |
| Admin: service approve/reject | FR4-ADMIN-01 | `admin-service-detail-page.tsx` |
| Admin: audit logs | FR4-ADMIN-01 | `admin-governance-page.tsx` |

---

## Gap Analysis: TRD v1 vs. Current State

### Gaps Addressable in Prototype

| # | Gap | TRD v1 FR | Priority | Current State |
|---|-----|-----------|----------|---------------|
| 1 | Consumer can't see their access request statuses | FR3-CONS-02 | High | `AccessRequest` type exists with status field, but no consumer-facing view |
| 2 | Merchant lifecycle: only 3 states (active/suspended/blocked), TRD v1 requires 4 (pending/active/suspended/disabled) | FR4-ADMIN-01 | High | No "pending" onboarding approval or "disabled" hard stop |
| 3 | Docker images have no status, licensing model, or lifecycle management | FR2-MERCH-02, FR2-MERCH-05 | High | `DockerImage` type has only basic fields (name, tag, digest, size, license string) |
| 4 | No per-service consumer blocking by merchant | FR2-MERCH-05 | Medium | Merchants can revoke API keys but not block per-service |
| 5 | No data export (CSV/PDF) on any page | FR2-MERCH-04 | Medium | Usage pages, invoices, audit logs — all display-only |
| 6 | Projects & Teams: only 2 roles (owner/member), no invite/remove, no team-level resources | FR3-CONS-04 | Medium | Basic card grid + create dialog, no RBAC enforcement |
| 7 | Admin can't revoke consumer keys or force regeneration | FR4-ADMIN-02 | Medium | Admin can only block/unblock consumers platform-wide |
| 8 | No admin compliance controls (flag for review, block subscriptions) | FR4-ADMIN-01 | Medium | No flagging or subscription-blocking UI |
| 9 | Consumer image pull flow — no token generation simulation | FR3-CONS-05 | Medium | Static pull command displayed, no pull access flow |
| 10 | No image validation pipeline visualization on merchant side | FR2-MERCH-02 | Low | Images are listed but no push validation pipeline shown |
| 11 | Admin can't view consumer's teams/projects | FR4-ADMIN-02 | Low | `admin-consumer-detail-page` shows usage but not teams |

### Gaps NOT Feasible for Prototype (Backend-Only)

Documented in [Out of Scope](#out-of-scope--backend-only-requirements) section below.

---

## Phase 7: Lifecycle, Access Requests & Admin Controls

**Goal:** Align merchant/consumer lifecycle with TRD v1, give consumers visibility into their access requests, and strengthen admin governance tools.

**Depends on:** Phases 0-6

### 7.1 Merchant Lifecycle States (FR4-ADMIN-01)

TRD v1 specifies 4 states: **Pending → Active → Suspended → Disabled**.
Current `UserStatus`: `'active' | 'suspended' | 'blocked'`.

- Add `'pending'` and `'disabled'` to `UserStatus` type (replace `'blocked'` with `'disabled'` for merchants — `'blocked'` remains for consumers)
- Add mock merchant user in `'pending'` state (e.g., merchant who registered but not yet approved)
- Add mock handlers: `approveMerchantOnboarding(userId)`, `rejectMerchantOnboarding(userId)`, `disableMerchant(userId)`
- Update `admin-merchant-detail-page.tsx` action buttons:
  - **Pending** → "Approve" (→ active) + "Reject" (→ disabled with reason)
  - **Active** → "Suspend" + "Disable"
  - **Suspended** → "Unsuspend" + "Disable"
  - **Disabled** → read-only, no actions (hard stop — show info banner)
- Update `admin-merchants-page.tsx` — add status filter for all 4 states
- Suspended/disabled merchants' services hidden from marketplace `getActiveServices()` filter
- Status badges: pending=yellow, active=green, suspended=orange, disabled=red
- Add audit actions: `'merchant.approved'`, `'merchant.rejected'`, `'merchant.disabled'`
- Update `admin-dashboard-page.tsx` KPI cards to show pending merchant count

### 7.2 Consumer Access Request Status View (FR3-CONS-02)

TRD v1 specifies: consumer dashboard shows access request statuses.

- Add "My Requests" card to `dashboard-page.tsx` showing 3 most recent access requests with status badges (pending/approved/denied)
- Add `/dashboard/requests` page — full list table with columns: Service Name, Status, Requested Date, Resolved Date, Resolved By
- Add mock handler: `getAccessRequestsByConsumer(consumerId)` (already exists per inventory)
- Add route to `router.tsx` and sidebar nav item "Requests" with inbox icon
- Clicking an approved request links to the service detail; clicking pending shows "Awaiting approval" state

### 7.3 Admin Compliance & Risk Controls (FR4-ADMIN-01)

- Add `flaggedForReview: boolean` field to `MerchantProfile`
- Add `subscriptionsBlocked: boolean` field to `MerchantProfile`
- Add "Flag for Review" toggle on `admin-merchant-detail-page.tsx` — sets flagged state
- Add "Block New Subscriptions" toggle — prevents `createAccessRequest()` from succeeding for that merchant's services
- Flagged merchants show warning icon/badge in `admin-merchants-page.tsx` list
- Add filter toggles on merchants list: "Show flagged only", "Show subscription-blocked only"
- Add audit actions: `'merchant.flagged'`, `'merchant.unflagged'`, `'merchant.subscriptions_blocked'`, `'merchant.subscriptions_unblocked'`

### 7.4 Admin Credential Control (FR4-ADMIN-02)

- Add "API Keys" section to `admin-consumer-detail-page.tsx` showing consumer's keys
- Add "Revoke Key" action per individual key
- Add "Revoke All Keys" bulk action with confirmation dialog
- Add "Force Regenerate" action per key (revoke + create new with same config)
- Add mock handlers: `adminRevokeApiKey(keyId)`, `adminRevokeAllConsumerKeys(consumerId)`
- All actions logged to audit trail with `actorRole: 'admin'`

**Spec:** `docs/specs/lifecycle-governance-enhancements.md`

**AC themes:**
- Merchant transitions through all 4 lifecycle states correctly
- Pending merchants appear in admin dashboard pending count
- Disabled merchant's services disappear from marketplace
- Consumer sees their access requests with correct status badges
- Flagged merchants show warning in admin list
- Block-new-subscriptions prevents access request creation (shows error toast)
- Admin can view, revoke, and force-regenerate consumer API keys
- All admin actions logged to audit trail

---

## Phase 8: Docker Image Lifecycle & Licensing

**Goal:** Upgrade Docker images from basic metadata display to full lifecycle management with licensing models, pull flow simulation, and validation pipeline.

**Depends on:** Phase 7

### 8.1 Docker Image Type Enhancement (FR2-MERCH-02)

Extend `DockerImage` type with fields specified in TRD v1:

```
status: 'active' | 'deprecated' | 'disabled'
licensingModel: 'online' | 'offline-ttl'
licenseStatus: 'valid' | 'expired' | 'revoked'
ttlExpiresAt?: string
version: string  (semver, separate from tag)
usageModel: 'execution' | 'pull' | 'time-based'
pullCount: number
executionCount: number
```

- Update `docker-images.ts` mock data with varied configurations:
  - Online image with valid license
  - Offline-TTL image with expired TTL
  - Deprecated image version
  - Active image with high pull count
- Update `DockerRegistry` type with `scopedToken` and `tokenExpiresAt` fields

### 8.2 Merchant Image Management (FR2-MERCH-02, FR2-MERCH-05)

Upgrade `merchant-images-page.tsx` to full management dashboard:

- Status badge per image (active=green, deprecated=yellow, disabled=red)
- License status badge (valid=green, expired=orange, revoked=red)
- Licensing model indicator (online / offline-ttl)
- TTL expiry date shown for TTL-based images
- Usage metrics per image: pull count, execution count
- Actions: "Deprecate Version" (→ deprecated), "Disable Version" (→ disabled)
- Add mock handlers: `deprecateImage(imageId)`, `disableImage(imageId)`
- Add search/filter by status, licensing model
- Add audit actions: `'image.deprecated'`, `'image.disabled'`

### 8.3 Merchant Image Validation Pipeline (FR2-MERCH-02)

TRD v1 specifies a validation pipeline when images are pushed.

- Add `ImageValidationPipeline` component showing 5 steps:
  1. Verify naming conventions
  2. Validate tagging (semver format)
  3. Check service association
  4. Validate licensing configuration
  5. Mark as Active
- Show pipeline status per image: each step has pass/fail indicator
- Display on merchant image detail view (click image row to expand)
- For mock: all existing images show "all steps passed"; simulate a failed step for one image

### 8.4 Consumer Image Pull Flow (FR3-CONS-05)

Upgrade `images-page.tsx` (consumer) with pull access simulation:

- Add "Request Pull Access" button per image
- Simulated pull flow dialog with steps:
  1. Validate consumer entitlement → pass/fail
  2. Check license status → pass/fail
  3. Check team/project association → pass/fail
  4. Generate short-lived pull token → show token (masked, copy button)
- Token displayed once with expiry countdown (mock: 30 min)
- Show licensing model badge (online / offline-ttl)
- Add search/filter by name, service, license type, status
- Update pull command to include generated token

### 8.5 Per-Service Consumer Blocking (FR2-MERCH-05)

- Add "Block" / "Unblock" actions per consumer row on `merchant-service-consumers-page.tsx`
- Per-service block (not platform-wide): consumer can still access other services
- Blocked consumers show red "Blocked" badge in list
- Add mock handler: `blockConsumerForService(consumerId, serviceId)`, `unblockConsumerForService(consumerId, serviceId)`
- Blocked consumer's API key calls to that service fail in consumption simulator (403)
- Add audit action: `'consumer.service_blocked'`, `'consumer.service_unblocked'`

**Spec:** `docs/specs/image-licensing-enhancements.md`

**AC themes:**
- Docker images display status, licensing model, license status, and TTL
- Merchants can deprecate and disable image versions
- Validation pipeline shows 5 steps with pass/fail per image
- Consumer pull flow simulates entitlement check and token generation
- Pull token shown once with copy button and expiry indicator
- Consumer image page has search and filter
- Per-service consumer blocking works independently of platform-wide block
- Blocked consumer gets 403 in consumption simulator for that service

---

## Phase 9: Projects & Teams Enhancement

**Goal:** Upgrade Projects & Teams from basic stub to TRD v1 spec with RBAC, team-level resources, and membership management.

**Depends on:** Phase 7

### 9.1 Project RBAC (FR3-CONS-04)

TRD v1 defines 3 roles: **Owner**, **Admin**, **Member**.

- Add `'admin'` to `ProjectMember.role`: `'owner' | 'admin' | 'member'`
- Update `project-detail-page.tsx` with role-based UI:
  - **Owner:** manage members (invite, remove, change role), manage keys, manage services, delete project
  - **Admin:** generate/revoke API keys, assign/remove services
  - **Member:** view services, view usage, copy existing keys (read-only)
- Show role badge (color-coded) next to each member name
- Add "Change Role" dropdown for owners managing members (Owner can promote Member → Admin or demote Admin → Member)
- Update mock data with at least one project having members in all 3 roles

### 9.2 Team Membership Management (FR3-CONS-04)

- Add "Invite Member" dialog on project detail page:
  - Email input field
  - Role selector (Admin or Member — Owner cannot be assigned)
  - Submit: if mock user exists → add directly with toast; if not → show "Invitation sent" toast
- Add "Remove Member" action per member row (Owner-only, with confirmation dialog)
- Owner cannot remove themselves (show disabled state or hide button)
- Add mock handlers: `addProjectMember(projectId, email, role)`, `removeProjectMember(projectId, userId)`, `changeProjectMemberRole(projectId, userId, newRole)`
- All membership changes generate audit log entries

### 9.3 Team-Level API Keys (FR3-CONS-04)

- Add optional `projectId?: string` field to `ApiKey` type
- Update `api-key-new-page.tsx` — add "Assign to Project" dropdown (optional)
- Project detail page shows "Project API Keys" section with keys where `projectId` matches
- Keys created within project context auto-assign the project's services
- RBAC: Owner/Admin can create/revoke project keys; Member can only view/copy
- Update mock data: assign some existing keys to projects

### 9.4 Usage Filtered by Project (FR3-CONS-03)

- Add "Project" filter dropdown to consumer `usage-page.tsx`
- Filter usage data by the API keys associated with selected project
- Add "Usage" summary section on project detail page: total requests, total cost, chart (small)
- Reuse `ConsumptionChart` component with filtered data

### 9.5 Admin: View Consumer Teams (FR4-ADMIN-02)

- Add "Teams & Projects" section to `admin-consumer-detail-page.tsx`
- Show list of consumer's projects with member count and service count
- Read-only view (admin cannot modify teams, only view)

**Spec:** `docs/specs/projects-teams-rbac.md`

**AC themes:**
- Three roles enforced: Owner sees all controls, Admin manages keys/services, Member is read-only
- Owner can invite members, remove members, and change roles
- API keys can be created at project level
- Project detail shows scoped keys and usage summary
- Consumer usage page filterable by project
- Admin can view consumer's projects on detail page
- All membership changes appear in audit log

---

## Phase 10: Data Export & Audit Completeness

**Goal:** Add CSV export to data-heavy pages and ensure comprehensive audit logging as specified in TRD v1.

**Depends on:** Phases 7-9

### 10.1 CSV Export Utility

- Create shared `lib/export-csv.ts` utility:
  - Takes array of objects + column config → generates CSV string
  - Creates Blob, triggers browser download with filename
  - Reusable across all pages

### 10.2 Merchant Report Export (FR2-MERCH-04)

- Add "Export CSV" button on `merchant-invoices-page.tsx` — exports invoice list
- Add "Export CSV" button on `merchant-usage-page.tsx` — exports daily usage data
- Add "Export CSV" button on `merchant-service-consumers-page.tsx` — exports usage by API key
- Add "Export CSV" button on `merchant-usage-detail-page.tsx` — exports request log
- Add "Share Report" action on invoices (mock: toast "Report link copied" / "Sent to consumer")
- PDF export: show "Export PDF" button that triggers toast "PDF generation requires server — feature planned" (honest prototype limitation)

### 10.3 Consumer Usage Export (FR3-CONS-03)

- Add "Export CSV" button on consumer `usage-page.tsx` — exports usage data
- Add "Export CSV" button on consumer `consumer-usage-detail-page.tsx` — exports request log
- Export includes: date, service name, API key name, request count, cost

### 10.4 Admin Report Export

- Add "Export CSV" button on `admin-governance-page.tsx` — exports audit logs
- Add "Export CSV" button on `admin-usage-page.tsx` — exports platform usage
- Add "Export CSV" button on `admin-usage-detail-page.tsx` — exports daily request log
- Add "Export CSV" button on `admin-consumer-detail-page.tsx` — exports consumer's usage

### 10.5 Comprehensive Audit Logging

Ensure all action types in `AuditAction` are actually generated by handlers:

**Already logged:**
- `merchant.invited`, `merchant.registered`, `merchant.suspended`, `merchant.unsuspended`
- `service.created`, `service.submitted`, `service.approved`, `service.rejected`, `service.updated`
- `consumer.registered`, `consumer.blocked`, `consumer.unblocked`
- `access.requested`, `access.approved`, `access.denied`
- `apikey.created`, `apikey.revoked`
- `invoice.issued`

**New audit actions to add (from Phase 7-9 features):**
- `merchant.approved`, `merchant.rejected`, `merchant.disabled`
- `merchant.flagged`, `merchant.unflagged`
- `merchant.subscriptions_blocked`, `merchant.subscriptions_unblocked`
- `image.deprecated`, `image.disabled`
- `consumer.service_blocked`, `consumer.service_unblocked`
- `project.member_added`, `project.member_removed`, `project.member_role_changed`
- `apikey.force_regenerated`

Update `AuditAction` type, add to `admin-governance-page.tsx` filter options.

### 10.6 Notification Enhancements

- Ensure notifications fire for all Phase 7-9 events:
  - Merchant approved/rejected → notification to merchant
  - Access request approved/denied → notification to consumer
  - Key revoked by admin → notification to consumer
  - Consumer blocked for service → notification to consumer
  - Member added to project → notification to member
- Notifications link to relevant detail page when clicked

**Spec:** `docs/specs/data-export-audit-enhancements.md`

**AC themes:**
- CSV export downloads valid file with correct headers and data on all applicable pages
- Export respects current filters and date range
- PDF button shows honest prototype limitation toast
- All new Phase 7-9 actions appear in audit log
- Governance page filters include all new action types
- Notifications fire on key governance events and link to detail pages

---

## Out of Scope — Backend-Only Requirements

The following TRD v1 requirements are **not feasible for a frontend prototype** and are documented here for future full-stack implementation.

### System Architecture Layers

| Layer | TRD v1 Requirement | Why Out of Scope |
|-------|---------------------|------------------|
| Identity Layer | External IdP (Microsoft Entra ID), JWKS endpoint validation, JWT processing | Requires real IdP integration |
| API Gateway Layer | Azure API Management — programmatic API registration, policy enforcement, rate limiting, request/response tracing | Requires APIM infrastructure |
| Consumption & Event Processing | Azure Event Hub / Kafka, fire-and-forget async streaming, background workers | Requires event streaming infrastructure |
| Image Registry Layer | Azure Container Registry, scoped PAT tokens, registry abstraction interface (`ImageRegistryProvider`) | Requires container registry infrastructure |
| Data Layer | Structured DB for metadata, keys, usage, licensing, audit | Requires database infrastructure |

### Non-Functional Requirements

| NFR | Description | Why Out of Scope |
|-----|-------------|------------------|
| **NFR1: Monitoring & Alerts** | Azure Application Insights — telemetry collection, distributed tracing with correlation IDs, alert configuration for error rates/latency, dependency tracking | Requires backend services + cloud monitoring |
| **NFR2: Documentation Portal** | Public docs portal with onboarding guides, API examples, versioned docs aligned with releases | Requires separate docs site; content is a product decision |
| **NFR3: Consumption Endpoint Performance** | Stateless ingestion, horizontal scaling, burst traffic handling, idempotent events, retry mechanisms, dead-letter queues | Requires backend infrastructure + load testing |

### Additional Backend-Only Items

| Item | TRD v1 Reference | Description |
|------|------------------|-------------|
| APIM Policy Automation | FR2-MERCH-01 | Auto-register APIs in APIM, apply tracking/logging/throttling policies programmatically |
| Registry Abstraction Interface | FR2-MERCH-02 | `ImageRegistryProvider` interface (PushImage, ValidateImage, GeneratePullToken, GetImageMetadata, RevokeAccess) |
| Image Security Scanning | FR2-MERCH-02 | Automated security scans on pushed images |
| Image Signature Verification | FR2-MERCH-02 | Cryptographic image signature validation |
| Offline TTL License Tokens | FR3-CONS-05 | Signed JWT license tokens with expiry for air-gapped containers — requires crypto/signing backend |
| Real-time Usage Streaming | FR2-MERCH-03 | High-throughput event ingestion with guaranteed delivery and deduplication |
| CDN Integration | NFR1-PERF-001 | Content delivery network for static assets |
| Redis Caching | NFR1-PERF-001 | Cache layer for frequently accessed content |
| CI/CD Pipelines | SDLC | Build, test, deploy automation |
| Environment Management | SDLC | Test/staging/production environments and release triggers |

### SEO (Partially Out of Scope)

TRD v1 specifies SEO-optimized marketplace pages with JSON-LD, OpenGraph metadata, and crawlable URLs.

- **Already done:** Clean URL slugs (`/marketplace/:serviceId`), descriptive headings
- **Not feasible in SPA:** Server-side rendering for crawlers, dynamic meta tags for social sharing, structured data indexing — requires SSR (Next.js/Remix) or pre-rendering
- **Recommendation:** Defer to stack migration if SSR is adopted

---

## Summary

| Phase | Name | Key Deliverables | Est. Scope |
|-------|------|-----------------|------------|
| **7** | Lifecycle, Access Requests & Admin Controls | 4-state merchant lifecycle, consumer access request view, compliance controls, admin credential management | Large |
| **8** | Docker Image Lifecycle & Licensing | Image status/licensing/TTL, merchant management, validation pipeline, consumer pull flow, per-service blocking | Large |
| **9** | Projects & Teams Enhancement | 3-role RBAC, membership management, team-level API keys, project-scoped usage, admin team view | Medium |
| **10** | Data Export & Audit Completeness | CSV export utility + buttons on all data pages, comprehensive audit logging, notification enhancements | Medium |

---

## Spec Files Summary (v1 — 4 new specs)

| Phase | Spec File | FR Coverage |
|-------|-----------|-------------|
| 7 | lifecycle-governance-enhancements.md | FR4-ADMIN-01, FR4-ADMIN-02, FR3-CONS-02 |
| 8 | image-licensing-enhancements.md | FR2-MERCH-02, FR2-MERCH-05, FR3-CONS-05 |
| 9 | projects-teams-rbac.md | FR3-CONS-04, FR3-CONS-03, FR4-ADMIN-02 |
| 10 | data-export-audit-enhancements.md | FR2-MERCH-04, FR3-CONS-01, FR3-CONS-03 |

---

## Verification (per phase)

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
