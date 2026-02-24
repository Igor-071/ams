# AMS — Product Requirements Document

**Version 1.0**
**February 24, 2026**

| Date | Ver. | Author | Notes |
|------|------|--------|-------|
| 24/02/2026 | 1.0 | Adnan Bucalović | Initial PRD based on TRD v0.1 (22 Feb 2026) |

---

## 1. Why This Document Exists

The TRD (ams-trd-v1.md, 22 Feb 2026) covers *how* AMS will be built — infrastructure layers, APIM integration details, registry abstraction interfaces, database schemas. That's its job.

This document covers the other half: *what* we're building, *for whom*, and *why it matters*. It defines the product scope, user problems, feature prioritization, success criteria, and the decisions we've already locked. Engineering should be able to read this alongside the TRD and understand not just the technical contract, but the product rationale behind every requirement.

Where the TRD says "AMS provides a highly scalable consumption endpoint," this document explains why that endpoint exists, who depends on it, and what happens to the business if it fails.

---

## 2. Product Vision

AMS is a centralized service marketplace where organizations publish, distribute, monetize, and consume digital services under a single governance layer.

The short version: **one place to sell APIs and Docker images, one place to buy them, one place to govern everything.**

Three roles interact on the platform:

- **Ahoy Administrators** run the platform. They control who gets in, what goes live, and what gets shut down.
- **Merchants** are service providers. They publish APIs and Docker images, configure pricing and tracking, and get paid based on usage.
- **Consumers** find services, request access, generate API keys, pull images, and monitor their own usage and spending.

The business model is postpaid, usage-based. Consumers use services without hard caps. At the end of each billing cycle, merchants generate invoices from actual consumption data, and AMS takes a commission from each transaction.

---

## 3. Problem Statement

Right now, there is no production system. AMS is being built from scratch.

The problems it solves:

1. **Service providers have no standardized way to distribute and monetize their APIs and containerized services.** They build custom portals, handle access control ad hoc, and chase usage data across scattered logs.

2. **Service consumers have no single place to discover, evaluate, and subscribe to services.** They negotiate access separately with each provider, manage API keys across disconnected systems, and have no unified view of their usage or spending.

3. **Platform operators have no centralized governance.** Onboarding merchants, approving services, monitoring abuse, and enforcing compliance all happen through manual processes with no audit trail.

AMS solves these by putting a marketplace, an access control layer, and an observability layer between providers and consumers — with administrators governing the whole thing.

---

## 4. Target Users

### 4.1 Ahoy Administrators

**Who they are:** Internal Ahoy platform operators. Small team (2-5 people initially), technical enough to understand service configurations but not writing code day-to-day.

**What they care about:**
- Full visibility into who's on the platform and what they're doing
- Ability to intervene quickly — suspend a merchant, block a consumer, pull a service
- Audit trail for everything (compliance is non-negotiable)
- Low operational overhead — the platform should mostly run itself

**Key friction points without AMS:**
- No way to vet merchants or services before they go live
- No way to track what consumers are actually doing with the services
- No centralized kill switch when something goes wrong

### 4.2 Merchants

**Who they are:** Companies or teams that provide digital services — REST APIs, containerized applications, batch processors. Technical teams with DevOps capability (they can build and push Docker images, they understand API management).

**What they care about:**
- Getting their services in front of consumers with minimal onboarding friction
- Tracking who's using what and how much
- Getting paid accurately based on actual consumption
- Controlling access — revoking keys, blocking abusers, deprecating old versions

**Key friction points without AMS:**
- Building their own API gateway, usage tracking, key management, and billing systems
- No marketplace distribution — every new customer requires direct sales engagement
- Managing Docker image access manually (registry credentials, token rotation, license enforcement)

### 4.3 Consumers

**Who they are:** Developers, engineering teams, or systems that need to consume services. They range from individual developers pulling a single API to enterprise teams operating across multiple projects with shared API keys and Docker images.

**What they care about:**
- Finding the right service quickly
- Getting access without a 2-week procurement cycle
- Generating API keys with the exact permissions they need
- Understanding their usage and costs before the invoice arrives
- Organizing access across teams and projects

**Key friction points without AMS:**
- Every service has its own onboarding process
- No unified key management across multiple services
- No visibility into spending until the bill arrives
- Sharing access across a team means sharing credentials (insecure and untrackable)

---

## 5. Scope — MVP

### 5.1 What's In

The MVP delivers a complete, functional cycle across all three roles:

| Area | Scope |
|------|-------|
| Authentication | Email OTP + Google SSO, provider-agnostic via JWKS |
| Marketplace | Public browsable catalog, search, filter by type, service detail pages |
| Merchant onboarding | Invite-only, admin sends invite → merchant registers via link |
| Service publishing | API-based and Docker image-based services, multi-step creation wizard |
| Service approval | Admin review and approve/reject workflow before services go live |
| Consumer access | Register, browse marketplace, request access, admin approval gate |
| API key management | Generate, configure (TTL, service scoping), revoke, metadata |
| Docker image management | Push via private registry, versioning, licensing models (online + offline-TTL), pull flow with scoped tokens |
| Consumption tracking | Consumption endpoint with validation chain (API key → TTL → authorization → merchant config → rate limit) |
| Usage dashboards | Per-service, per-key, per-consumer views for all three roles, historical data, date range filtering |
| Invoicing | Usage-based invoice generation, line items, AMS commission deduction, CSV export |
| Projects & Teams | Consumer-side organizational groupings with RBAC (Owner/Admin/Member), team-level API keys |
| Admin governance | Full CRUD over merchants and consumers, lifecycle state management, audit logs, compliance controls |
| Data export | CSV export on all data-heavy pages |

### 5.2 What's Out (MVP)

These are documented, understood, and deferred — not forgotten:

| Item | Why It's Out | When It Comes In |
|------|-------------|-----------------|
| Full automated billing/payment | Business model details (pricing tiers, payment collection, free tier structure) are still TBD | Post-MVP, once pricing is validated with real merchants |
| SDK and package distribution | TRD calls out future support — not MVP scope | Phase 2, after API + Docker patterns are proven |
| SSR/SEO optimization | SPA prototype can't do proper server-side rendering; requires Next.js or Remix migration | Post-MVP stack decision |
| Real-time streaming dashboards | MVP usage data is near-real-time (aggregated); true WebSocket streaming is a backend investment | Post-MVP, once Event Hub pipeline is production-ready |
| Automated security scanning of Docker images | Requires backend infrastructure + scanning toolchain | Post-MVP |
| System health monitoring in-app | Handled by Azure native (Monitor, App Insights) — no in-app dashboard | Possibly never — Azure native tooling may be sufficient |
| Multi-language support / i18n | English-only for MVP | When international merchants onboard |
| Mobile native apps | Responsive web covers mobile use cases for MVP | If mobile-specific workflows emerge |

### 5.3 Decisions Already Locked

These have been discussed, decided, and are not open for re-litigation:

| Decision | Rationale |
|----------|-----------|
| Merchant registration is invite-only | Quality control — admins vet merchants before they can publish anything |
| Services require admin approval before going live | Prevents the marketplace from becoming a dumping ground; builds trust with consumers |
| Merchants see usage per API key, NOT per consumer identity | Privacy boundary — merchants know how much a key is used, not who's behind it |
| Merchants can revoke consumer API keys | Merchants must be able to cut off abusive usage without waiting for admin |
| Monthly postpaid billing cycle | No prepaid complexity for MVP; usage-based billing aligns incentives |
| AMS commission deducted from transactions | Revenue model built into the billing flow, not bolted on |
| One account can be both merchant and consumer | Reduces friction for companies that both provide and consume services |
| No hard usage cap | Consumers use what they need; postpaid billing handles the rest |
| Rate limiting is merchant-configurable per service | Merchants know their capacity better than we do |
| Public marketplace browsable without login | Reduces discovery friction; login required only for access requests |
| API keys have configurable TTL | Security practice — keys should expire; consumers configure the window |
| Docker images as a first-class service type | Not an afterthought — images get the same lifecycle, licensing, and management depth as APIs |
| Authentication and authorization are separate concerns | Authentication via external IdP (JWKS), authorization managed internally by AMS — no vendor lock-in |
| Registry abstraction layer from day one | MVP uses Azure Container Registry, but the interface is pluggable for AWS ECR, self-hosted, or on-prem registries later |

---

## 6. User Journeys

### 6.1 Consumer Journey

```
Register → Browse marketplace → Request access to service → Admin approves
→ Generate API key → Configure key (services, TTL) → Use service
→ API: call via consumption endpoint / Docker: pull image + validate key
→ Merchant rate limits enforced → No hard cap, billed postpaid
→ Usage dashboard: counts, cost breakdown, per-service, per-key, history
```

**Step-by-step:**

1. Consumer registers on AMS (email OTP or Google SSO).
2. Browses the public marketplace — sees merchant identity, service descriptions, pricing, documentation links.
3. Finds a service they want. Clicks "Request Access."
4. If not logged in → redirected to login first.
5. Access request created with status "pending."
6. Admin reviews and approves (or denies) the request.
7. Consumer is notified. If approved, can now generate an API key.
8. Consumer generates a key — assigns it to one or more services, sets TTL, adds metadata (name, description, purpose).
9. Key is displayed once in full, then masked forever. Copy it now or lose it.
10. **For API services:** consumer calls the AMS consumption endpoint with their API key. The endpoint validates the key → checks TTL → checks service authorization → checks merchant config → checks rate limits → forwards to the merchant's upstream API.
11. **For Docker images:** consumer requests pull access → AMS validates entitlement and license → issues a short-lived, scoped pull token → consumer pulls using standard `docker pull`.
12. Usage is tracked per request: consumer_id, api_key_id, service_id, timestamp, payload sizes, response time, status code.
13. Usage dashboard shows real-time consumption: per-service, per-key, combined view, historical data with date range filtering.
14. End of month: merchant generates postpaid invoice based on actual usage. AMS commission deducted.

**Error scenarios the consumer will encounter:**
- `401` — Missing or invalid API key
- `403` — Expired key, revoked key, or no access to the requested service
- `429` — Rate limit exceeded (merchant-configured)
- `502` — Merchant service misconfigured on the backend

### 6.2 Merchant Journey

```
Receive admin invite → Register via invite link → Dashboard
→ Create service (API or Docker) → Configure metadata, pricing, tracing
→ Submit for admin approval → Service goes live
→ Monitor usage by API key → Revoke keys if needed
→ End of month: generate invoice from usage, AMS commission deducted
```

**Step-by-step:**

1. Admin sends invite to merchant (email → generates invite link).
2. Merchant registers using the invite link. Invite code is validated — without a valid code, registration is blocked.
3. Merchant lands on their dashboard — overview KPIs: total services, active consumers, total requests, revenue.
4. Creates a new service via a multi-step wizard:
   - **Step 1:** Choose type — API-based or Docker image-based.
   - **Step 2:** Service metadata — name, description, category, documentation URL, version, tags.
   - **Step 3:** Pricing model — free, per-request, tiered, or flat rate. (Full pricing logic is TBD for MVP — UI stubs are in place.)
   - **Step 4:** Tracing configuration — what to track (request count, payload sizes, response sizes). Rate limiting config (requests per minute/hour/day).
   - **Step 5 (Docker only):** Licensing model — online (internet-connected usage reporting) or offline TTL-based (signed license tokens with expiry). Push credentials display.
   - **Step 6:** Review and submit for approval.
5. Service goes into "pending_approval" state.
6. Admin reviews and approves (or rejects with a reason).
7. If approved, service appears in the public marketplace.
8. Merchant monitors usage — but sees usage per API key, NOT per consumer identity. This is a deliberate privacy boundary.
9. Merchant can revoke consumer API keys.
10. For Docker images: merchant pushes images to the AMS private registry using scoped tokens. AMS runs validation (naming convention → tagging format → service association → licensing config → mark active). Merchant can deprecate or disable specific image versions.
11. End of month: merchant generates usage reports for a selected period. Reports aggregate by consumer, service, or API key. Exportable as CSV. (PDF export planned for post-MVP.)
12. Invoice generated from usage data — line items per service, AMS commission deducted from total.

### 6.3 Admin Journey

```
Login → Admin dashboard (full CRUD) → Manage merchants, consumers, services
→ Invite merchants → Approve services → Approve access requests
→ Suspend/block/disable as needed → Audit logs for everything
```

**Step-by-step:**

1. Admin logs in — dashboard shows KPIs: total merchants, total consumers, pending approvals, active services.
2. **Merchant management:**
   - View all registered merchants with status filter (Pending / Active / Suspended / Disabled).
   - Invite new merchants — enter email, generate invite link, copy to clipboard.
   - Approve or reject merchant onboarding (pending → active or disabled).
   - Suspend a merchant (temporary — services hidden from marketplace, access frozen).
   - Disable a merchant (permanent hard stop — no recovery without manual intervention).
   - Flag a merchant for review (visible warning badge in admin UI).
   - Block new consumer subscriptions for a specific merchant.
3. **Consumer management:**
   - View all consumers with search and status filter.
   - Approve or deny access requests.
   - View individual consumer usage data, subscribed services, assigned teams/projects.
   - Block a consumer (platform-wide for MVP) — revokes all API keys, freezes subscriptions.
   - Revoke individual consumer API keys or force key regeneration.
4. **Service governance:**
   - View all services across all merchants.
   - Approve/reject service listings (with reason field for rejections).
   - Override service visibility or force-disable a specific service.
5. **Audit & compliance:**
   - Filterable audit log capturing every significant action on the platform.
   - Audit entries include: actor, action, target, timestamp, metadata.
   - Exportable as CSV.

---

## 7. Functional Requirements — Product View

This section maps to the TRD's FR numbering. Each requirement here describes the *product behavior* — what the user sees and does. The TRD describes the technical implementation behind it.

### FR1: Authentication

| Aspect | Detail |
|--------|--------|
| Methods | Email OTP + Google SSO |
| Architecture | External IdP (e.g., Microsoft Entra ID) for authentication. Internal AMS authorization layer. Integrated via JWKS endpoint — provider-agnostic. |
| Roles | Admin, Merchant, Consumer. One account can hold multiple roles (e.g., merchant + consumer). |
| Role switching | Users with multiple roles switch via the user menu. Sidebar and accessible routes update immediately. |
| Session persistence | Auth state persisted to localStorage. Survives page refresh. |
| Logout | Clears all local state, redirects to /login. |

**Product rationale:** Keeping authentication provider-agnostic means we can switch from Microsoft Entra ID to Auth0, Okta, or anything else without touching product logic. That's a strategic decision, not a technical one — we don't want our product roadmap held hostage by an IdP vendor.

### FR2: Merchant Capabilities

#### FR2-MERCH-01: API Service Configuration

Merchants configure and expose APIs through AMS. Under the hood, AMS registers the API in Azure API Management and applies policies for tracking, logging, and rate limiting. Merchants never touch APIM directly.

**What the merchant does in the UI:**
- Clicks "Add Service" → multi-step wizard
- Enters metadata (name, description, base URL, documentation link, version, category, tags)
- Configures pricing model
- Configures tracing: request count per API key, request payload size, response payload size
- Sets rate limits (requests per minute/hour/day)
- Submits for admin approval

**What AMS does behind the scenes:**
1. Validates merchant input
2. Calls Azure APIM REST API — creates API object, configures operations, applies policies (tracking → Event Hub, rate limiting, request/response logging)
3. Stores metadata in AMS database
4. Updates merchant dashboard with service status

**What consumers see:**
Service metadata on the marketplace: name, description, proxied API URL, documentation link, version, pricing model, rate limits, authentication method, supported formats, SLA information.

#### FR2-MERCH-02: Image Storage & Lifecycle Management

Docker images are first-class service entities, not second-class citizens. A single service can contain multiple images, each with independent versions and licensing.

**Structure:**
```
Merchant
└── Service (Image-based)
     ├── Image A (API container)
     │     ├── v1.0.0 (active, online license)
     │     └── v1.1.0 (active, online license)
     └── Image B (Worker)
           ├── v1.0.0 (deprecated)
           └── v2.0.0 (active, offline-TTL license)
```

**Image push flow (from merchant's perspective — feels like normal Docker):**
1. Register the image service in AMS → receive scoped push credentials
2. `docker build -t payment-api:1.0.0 .`
3. `docker login registry.ams.io`
4. `docker tag payment-api:1.0.0 registry.ams.io/merchant123/payment-api:1.0.0`
5. `docker push registry.ams.io/merchant123/payment-api:1.0.0`
6. Image appears in AMS portal after automated validation

**Validation pipeline (automated, triggered on push):**
1. Verify naming conventions
2. Validate tag format (semver)
3. Check service association
4. Validate licensing configuration
5. If all pass → status = Active

**Registry design principle:** MVP uses Azure Container Registry, but AMS implements a registry abstraction layer (`ImageRegistryProvider` interface) so the registry backend is swappable — AWS ECR, self-hosted, or on-prem in the future.

**Important constraints:**
- The container registry is NOT publicly accessible
- Consumers never pull directly from the registry
- All access goes through AMS validation logic
- Merchants can only see and push to their own namespaced repositories
- Push tokens are scoped, time-bound, and revocable

**Image lifecycle states:** Active → Deprecated → Disabled

**Licensing models:**
- **Online:** Container must provide a valid AMS API key at startup. Reports usage periodically. Invalid key or expired license → container refuses to start.
- **Offline (TTL-based):** AMS issues a signed license token with expiry. Container validates signature locally. After TTL expires → container disables functionality. No runtime internet dependency.

#### FR2-MERCH-03: Consumption Endpoint

The consumption endpoint is the heart of usage tracking. Every API call from a consumer goes through it. Every Docker container reports to it.

**Endpoint contract: `POST /api/consume`**

Validation chain (in order):
1. Validate API key → `401` if missing/invalid
2. Check TTL → `403` if expired
3. Check service authorization → `403` if consumer doesn't have access
4. Check per-service consumer block → `403` if blocked by merchant for this service
5. Check merchant config → `502` if merchant's upstream is misconfigured
6. Check rate limit → `429` if exceeded

If all checks pass: forward request to merchant's upstream API, queue usage event asynchronously.

**Usage event data captured:**
- consumer_id
- api_key_id
- service_id
- timestamp
- request_payload_size
- response_payload_size
- response_time_ms
- status_code

**Async pipeline:** Usage event → aggregate → update billing counters → feed dashboards → trigger threshold alerts (future).

**Design constraint:** Fire-and-forget to the event streaming layer. Service containers send data asynchronously without waiting for processing. Background workers handle aggregation and persistence.

#### FR2-MERCH-04: Invoicing & Usage Metrics

Full automated billing is NOT in MVP. What is in MVP: usage reporting that lets the business team calculate and communicate spending manually.

**What merchants can do:**
- Generate usage reports for a specific consumer, group of consumers, or an entire service
- Select custom date ranges (monthly, weekly, or arbitrary)
- View aggregated metrics based on service type and pricing model
- Export reports as CSV
- Share reports with consumers (PDF export planned post-MVP — honest limitation)

**Architecture note:** The consumption tracking pipeline is decoupled from the reporting layer. Generating a report doesn't affect the ingestion pipeline. This separation matters — heavy report generation should never degrade real-time tracking.

#### FR2-MERCH-05: Consumer Management & Monitoring

Merchants need to see what's happening with their services and take action when something's wrong.

**Dashboard capabilities:**
- **Overview:** Aggregated consumption across all services. Trends (daily/weekly/monthly), spikes, usage distribution among consumers. Top consumers by activity.
- **Consumer detail view:** Drill-down per consumer (identified by API key, not personal identity). Monthly usage history, historical data.
- **Image-specific:** License validity, provisioning status, TTL compliance for image-based services.

**Access management:**
- Block/restrict specific consumers on a per-service basis (not platform-wide — that's admin territory)
- Revoke consumer API keys
- Per-service blocks enforced at consumption endpoint (403 response)
- All changes are auditable

### FR3: Consumer Capabilities

#### FR3-CONS-01: API Key Management

API keys are the consumer's primary credential for accessing services. Full lifecycle management is critical.

**Key generation:**
- Generate via AMS portal
- Each key gets: unique identifier, creation timestamp, association with one or more services
- Key displayed in full exactly once at creation — then masked permanently
- Stored encrypted at rest

**Key configuration:**
- Assign one or multiple services to a single key
- Set TTL (configurable by consumer)
- Add metadata: name, description, purpose, notes
- Metadata editable without affecting access permissions

**Key lifecycle:**
- Active → in use, passes all validation checks
- Expired → TTL exceeded, automatically rejected at gateway
- Disabled (temporary) → immediately rejected, can be re-enabled
- Revoked (permanent) → cannot be re-enabled, records reason, actor, and timestamp

**Auditability:** Every key action (creation, update, revocation) is logged with actor and timestamp.

#### FR3-CONS-02: Service Discovery & Access Requests

**Public marketplace (no login required):**
- Grid of all active services with metadata (name, description, type badge, pricing, version)
- Search with debounced input (300ms)
- Filter by type (API / Docker image), category, metadata
- Responsive grid: 1 column at 320px → 4 columns at 1440px
- Empty state when no results match

**Service detail page:**
- Full metadata: name, description, base URL (proxied), documentation link, version, pricing model, rate limits, authentication method, supported formats
- Metrics: total requests, active consumers, uptime percentage, success rate
- Quick-start code snippet
- "Request Access" button (login required)

**Access request flow:**
1. Consumer clicks "Request Access" → if not logged in, redirect to login first
2. Request created with status "pending"
3. Admin reviews and approves (or denies)
4. Consumer sees request status on their dashboard: pending / approved / denied
5. Approved request → consumer can now generate API keys for that service

#### FR3-CONS-03: Usage Dashboard

Consumers deserve full transparency into what they're using and what it costs.

**Views:**
- **Per-service:** Usage and spending broken down by individual service. Request count, data transfer, calculated cost.
- **Per-API key:** Usage per key, associated services, key status.
- **Combined overview:** Total usage across all services, total spending, top services by consumption.
- **Historical:** Monthly summaries, custom date ranges, trend visualization (daily/monthly charts).

**Filtering:** Date range, service, API key, team/project.

**Privacy:** Consumers can ONLY see their own usage data. No cross-consumer leakage.

#### FR3-CONS-04: Projects & Teams

Not every consumer is a solo developer. Teams need to organize access, share API keys safely, and track usage by project.

**Project creation:**
- Name, description, owner (creator by default)
- A user can belong to multiple projects

**Roles (RBAC):**
- **Owner:** Full control — manage members, API keys, services, delete project
- **Admin:** Generate/revoke API keys, assign/remove services
- **Member:** Use assigned services, view usage, copy existing keys (read-only)

**Membership management:**
- Invite members via email. If user exists → direct assignment. If not → invitation email.
- Remove members (owner-only, with confirmation)
- Change roles (owner can promote member → admin or demote admin → member)
- Owner cannot remove themselves

**Team-level resources:**
- API keys can be created at the project level (auto-assigned to project's services)
- Usage filterable by project
- Services assignable to specific teams

#### FR3-CONS-05: Image & Container Management

Consumers interact with Docker images through AMS, never directly with the registry.

**Image discovery:**
- Browse by category, merchant, tags
- View version history
- See licensing type (online / offline-TTL)
- Access pull instructions and required environment variables

**Pull flow:**
1. Consumer requests pull access via AMS
2. AMS validates: consumer entitlement, team/project association, license status
3. AMS generates a short-lived, scoped pull token (time-bound, revocable)
4. Consumer pulls using standard `docker pull` with the generated token
5. Token displayed once with expiry countdown

**Licensing enforcement at runtime:**
- **Online images:** Container provides API key at startup → registers with consumption endpoint → reports usage periodically → invalid key or expired license → container refuses to start or deactivates.
- **Offline images:** Signed license token from AMS → container validates signature locally → TTL expires → functionality disabled. No internet required.

### FR4: Admin Capabilities

#### FR4-ADMIN-01: Merchant Management

Admins control the merchant lifecycle end-to-end.

**Merchant lifecycle states:**

| State | Description | Available Actions |
|-------|-------------|-------------------|
| Pending | Merchant registered, awaiting onboarding review | Approve (→ Active), Reject (→ Disabled with reason) |
| Active | Fully operational | Suspend, Disable |
| Suspended | Temporary restriction — services hidden, access frozen | Unsuspend (→ Active), Disable |
| Disabled | Hard stop — no recovery without manual intervention | Read-only (info banner shown) |

**State change impacts:**
- Suspended/Disabled → services hidden from marketplace catalog
- Suspended/Disabled → API and image accessibility frozen
- Suspended/Disabled → revenue tracking eligibility paused

**Service governance:**
- View all services (APIs and images) published by a merchant
- Override service visibility
- Force-disable a specific service
- Review metadata and compliance declarations

**Compliance controls:**
- Flag merchant for review → warning badge in merchant list
- Block new consumer subscriptions for a merchant → prevents access request creation
- Both are toggle-based — reversible

#### FR4-ADMIN-02: Consumer Management

**Consumer lifecycle states:** Active → Suspended → Disabled

**Admin actions:**
- Suspend consumer (temporary — API keys invalidated, image pull tokens revoked, subscriptions frozen)
- Disable consumer (permanent restriction)
- View consumer subscriptions, teams/projects, high-level usage metrics
- Identify abnormal usage patterns

**Credential control:**
- View all consumer's API keys
- Revoke individual keys
- Revoke all keys (bulk action with confirmation)
- Force key regeneration (revoke + create new with same config)

**All admin actions are auditable.** Every state change, every key revocation, every approval/denial — logged with actor, timestamp, target, and reason where applicable.

---

## 8. Non-Functional Requirements — Product Impact

The TRD defines three NFRs. Here's why they matter from a product perspective.

### NFR1: Monitoring & Alerts

**Product impact:** If the consumption endpoint goes down, usage data is lost, and invoices become inaccurate. If API response times spike, consumers blame the marketplace, not the underlying merchant service.

**What we need:**
- Azure Application Insights integration across all backend services
- Request tracing with correlation IDs (so when a consumer reports "my API call failed," we can trace it end-to-end)
- Alerts for: high error rate, increased response time, consumption endpoint failures, dependency downtime
- This is NOT in-app monitoring — it's Azure-native tooling (Monitor, Application Insights). The admin dashboard does NOT replicate this. That's intentional: the admin dashboard shows business metrics, Azure shows operational metrics. Different audiences, different tools.

### NFR2: Documentation

**Product impact:** If a merchant can't figure out how to push a Docker image, they file a support ticket instead of self-serving. If a consumer can't figure out the API key flow, they churn.

**What we need:**
- Public documentation portal (external to the main app)
- Merchant onboarding guide, consumer onboarding guide
- API key usage instructions with code examples
- Docker image pull and licensing instructions
- FAQ and troubleshooting
- Versioned and aligned with platform releases

### NFR3: Consumption Endpoint Performance

**Product impact:** The consumption endpoint sits in the hot path of every API call. If it's slow, every merchant's API feels slow. If it drops events, billing is wrong. If it can't handle burst traffic, the platform fails at exactly the moment it should be succeeding (when usage is high).

**What we need:**
- Stateless ingestion layer — validate minimal metadata, enqueue immediately
- Asynchronous processing — aggregation and billing happen in the background, never in the request path
- Horizontal scaling — auto-scale based on CPU, request rate, queue depth
- Idempotent event handling — retries don't create duplicate billing
- Dead-letter handling — malformed events are captured, not silently dropped

---

## 9. Information Architecture — Routes & Screens

### Public (no auth required)

| Route | Screen | Purpose |
|-------|--------|---------|
| `/marketplace` | Service Catalog | Browsable grid, search, type filter |
| `/marketplace/:serviceId` | Service Detail | Full metadata, metrics, quick-start, "Request Access" |

### Authentication

| Route | Screen | Purpose |
|-------|--------|---------|
| `/login` | Login | Email OTP + Google SSO |
| `/register` | Consumer Registration | Self-service signup |
| `/register/merchant` | Merchant Registration | Invite-only with code validation |

### Consumer Dashboard (`/dashboard/*`)

| Route | Screen |
|-------|--------|
| `/dashboard` | Overview — KPI cards, recent activity, access request status |
| `/dashboard/api-keys` | API key list — generate, view, manage |
| `/dashboard/api-keys/new` | Key generation — name, services, TTL, metadata |
| `/dashboard/api-keys/:keyId` | Key detail — masked key, config, usage, revoke |
| `/dashboard/usage` | Usage charts — daily, per-service, per-key, cost |
| `/dashboard/usage/:date` | Usage detail — drill-down for specific date |
| `/dashboard/requests` | Access request list — status badges, linked services |
| `/dashboard/services` | Subscribed services with usage minibar |
| `/dashboard/services/:serviceId` | Service usage detail |
| `/dashboard/images` | Docker images — browse, pull access, licensing |
| `/dashboard/projects` | Projects list — create, view |
| `/dashboard/projects/:projectId` | Project detail — members, keys, services, usage |

### Merchant Dashboard (`/merchant/*`)

| Route | Screen |
|-------|--------|
| `/merchant` | Overview — KPI cards, charts, recent activity |
| `/merchant/services` | Service list — status, type, actions |
| `/merchant/services/new` | Multi-step service creation wizard |
| `/merchant/services/:serviceId` | Service detail — edit, consumption docs, validation chain |
| `/merchant/services/:serviceId/consumers` | Usage by API key for this service |
| `/merchant/consumers` | All consumers across services |
| `/merchant/usage` | Usage dashboard — charts, date range, breakdowns |
| `/merchant/usage/:date` | Usage detail — drill-down for specific date |
| `/merchant/invoices` | Invoice list — status, export |
| `/merchant/invoices/:invoiceId` | Invoice detail — line items, commission, totals |
| `/merchant/images` | Docker images — versions, push credentials, lifecycle |

### Admin Dashboard (`/admin/*`)

| Route | Screen |
|-------|--------|
| `/admin` | Overview — KPI cards, charts, approval queue |
| `/admin/merchants` | Merchant list — status filter, invite, flag |
| `/admin/merchants/:merchantId` | Merchant detail — lifecycle, services, compliance |
| `/admin/consumers` | Consumer list — search, status filter, block |
| `/admin/consumers/:consumerId` | Consumer detail — usage, keys, teams, subscriptions |
| `/admin/services` | All services — approve/reject workflow |
| `/admin/services/:serviceId` | Service approval detail — reason field |
| `/admin/usage` | Platform-wide usage analytics |
| `/admin/usage/:date` | Usage detail — drill-down for specific date |
| `/admin/governance` | Audit logs — filterable, exportable |

---

## 10. Data Model Summary

These are the core entities the product operates on. See the TRD for storage and schema details.

| Entity | Key Fields | Lifecycle States |
|--------|-----------|-----------------|
| **User** | id, email, name, roles[], activeRole, status | active, pending, suspended, blocked, disabled |
| **MerchantProfile** | userId, companyName, description, inviteCode, flaggedForReview, subscriptionsBlocked | — (governed by User status) |
| **ConsumerProfile** | userId, organization | — (governed by User status) |
| **Service** | id, merchantId, name, type (api/docker), status, pricing, rateLimitPerMinute, endpoint, version, features | draft, pending_approval, active, rejected, suspended |
| **ApiKey** | id, consumerId, name, keyValue, serviceIds[], status, ttlDays, expiresAt, revokedBy | active, expired, revoked |
| **AccessRequest** | id, consumerId, serviceId, status | pending, approved, denied |
| **DockerImage** | id, serviceId, name, version, status, licensingModel, licenseStatus, usageModel, validationSteps[] | active, deprecated, disabled |
| **DockerRegistry** | serviceId, registryUrl, repository, scopedToken, tokenExpiresAt | — |
| **UsageRecord** | id, consumerId, apiKeyId, serviceId, timestamp, payloadSizes, responseTimeMs, statusCode | — |
| **Invoice** | id, merchantId, consumerId, period, lineItems[], subtotal, commission, total, status | draft, issued, paid, overdue |
| **Project** | id, consumerId, name, members[], serviceIds[], apiKeyIds[] | — |
| **AuditLog** | id, action, actorId, actorRole, targetId, targetType, description, timestamp | — |
| **ServiceBlock** | consumerId, serviceId, blockedAt, blockedBy | — |

---

## 11. Cross-Cutting Concerns

### 11.1 Audit Trail

Every meaningful action on the platform is logged. This is non-negotiable — it's a compliance requirement, not a nice-to-have.

**Logged actions include (not exhaustive):**
- Merchant: invited, registered, approved, rejected, suspended, unsuspended, disabled, flagged, unflagged, subscriptions blocked/unblocked
- Service: created, submitted, approved, rejected, updated, suspended
- Consumer: registered, blocked, unblocked, service-level blocked/unblocked
- Access: requested, approved, denied
- API Key: created, revoked, force-regenerated
- Image: deprecated, disabled
- Invoice: issued

**Audit log fields:** actor (who), action (what), target (on what), timestamp (when), metadata (context). All filterable, all exportable.

### 11.2 Notification System

In-app notifications for key events:
- Merchant approved/rejected → notification to merchant
- Access request approved/denied → notification to consumer
- Key revoked by admin → notification to consumer
- Consumer blocked for service → notification to consumer
- Member added to project → notification to member

Notifications link to the relevant detail page when clicked.

### 11.3 Data Export

CSV export available on all data-heavy pages: usage dashboards (all roles), invoices, audit logs, consumer/merchant lists. PDF export is acknowledged as a post-MVP capability — the prototype honestly communicates this ("PDF generation requires server — feature planned").

### 11.4 Responsive Design

All screens must work at: 320px, 375px, 768px, 1024px, 1440px. This is verified per feature — not a final-pass checkbox.

---

## 12. Success Metrics

### Launch Criteria (MVP)

These must be true before MVP ships:

- [ ] All three roles can complete their primary journey end-to-end without dead ends
- [ ] Consumption endpoint validates all 6 steps correctly (API key → TTL → authorization → service block → merchant config → rate limit)
- [ ] Usage data accurately reflects consumption within the same billing period
- [ ] Admin can intervene at any point — suspend merchant, block consumer, revoke keys, disable services
- [ ] Audit log captures every admin and system action
- [ ] All screens responsive at defined breakpoints
- [ ] Zero unresolved P0 bugs

### Post-Launch KPIs (first 90 days)

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| Merchant onboarding time | < 1 day from invite to first service published | Measures onboarding friction |
| Service approval cycle time | < 24 hours | Admin responsiveness — slow approvals kill merchant momentum |
| Consumer time-to-first-API-call | < 30 minutes from registration | Measures the full access request → key generation → first call flow |
| Consumption endpoint uptime | > 99.9% | This is the revenue-critical path |
| Invoice accuracy | 100% match between tracked usage and invoiced amounts | Billing trust is binary — one wrong invoice breaks confidence |
| Support tickets per merchant per month | < 3 | Proxy for self-service effectiveness |

---

## 13. Open Questions & Known Risks

### Open Questions

| # | Question | Impact | Owner | Target Date |
|---|----------|--------|-------|-------------|
| 1 | Final pricing model details — per-request, per-MB, tiered, flat? Free tiers? | Affects merchant service creation wizard, invoice calculations, consumer cost projections | Product / Business | Pre-launch |
| 2 | Payment collection mechanism — who processes payments, what PSP, what currency? | Affects invoicing flow and merchant payout | Business / Finance | Pre-launch |
| 3 | Commission rate structure — flat % or tiered? | Affects invoice calculations | Business | Pre-launch |
| 4 | Will we migrate to SSR (Next.js/Remix) for SEO? | Affects marketplace discoverability and technical architecture | Engineering / Product | Post-MVP |
| 5 | Image security scanning requirements — what level of scanning, what blocks a publish? | Affects image validation pipeline | Security / Engineering | Post-MVP |
| 6 | Offline TTL license token format — what's the signing mechanism? | Affects Docker licensing for air-gapped environments | Engineering | Post-MVP |
| 7 | Alerting thresholds — what error rate triggers alerts, what response time is acceptable? | Affects NFR1 monitoring configuration | Engineering / Ops | Pre-launch |

### Known Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Consumption endpoint becomes a bottleneck under high load | Medium | High — affects all API calls and billing accuracy | Stateless design, async processing, horizontal scaling, load testing before launch |
| Merchants don't understand the Docker image push flow | Medium | Medium — support tickets, slow onboarding | Clear documentation, in-app push credentials display, validation pipeline feedback |
| Pricing model changes significantly after MVP | High | Medium — requires UI rework on service creation, invoicing, consumer dashboards | UI stubs already in place with TBD badges; service creation wizard is modular |
| Single-account dual-role (merchant + consumer) creates confusing UX | Low | Medium — users confused about which "mode" they're in | Clear role switcher in header, distinct sidebar navigation per role, visual indicators |
| Admin team becomes bottleneck for approvals (merchants, services, access requests) | Medium | High — slows down the entire marketplace | Dashboard prominently surfaces pending items, notification system for new requests, consider SLA tracking |

---

## 14. Appendices

### A. Glossary

| Term | Definition |
|------|-----------|
| **AMS** | Application Management & Service — the platform being built |
| **APIM** | Azure API Management — the API gateway layer |
| **ACR** | Azure Container Registry — the private Docker image registry (MVP) |
| **Consumption Endpoint** | The central `POST /api/consume` endpoint through which all API usage flows |
| **TTL** | Time To Live — configurable expiry period for API keys and Docker image licenses |
| **PAT** | Personal Access Token — scoped credential for Docker image push operations |
| **JWKS** | JSON Web Key Set — the mechanism for validating authentication tokens from the IdP |
| **IdP** | Identity Provider — external service handling authentication (e.g., Microsoft Entra ID) |
| **RBAC** | Role-Based Access Control — used both at the platform level (admin/merchant/consumer) and within projects (owner/admin/member) |
| **Postpaid** | Billing model where consumers pay after usage, based on actual consumption |
| **Service Block** | Per-service restriction where a merchant blocks a specific consumer from accessing a specific service |

### B. Document References

| Document | Location | Purpose |
|----------|----------|---------|
| Technical Requirements Document (TRD v0.1) | `build-docs/ams-trd-v1.md` | Technical specifications, architecture, infrastructure |
| Consumer User Journey | `build-docs/consumer-journey.md` | Consumer flow diagram |
| Merchant User Journey | `build-docs/merchant-yourney.md` | Merchant flow diagram |
| Admin User Journey | `build-docs/admin-journey.md` | Admin flow diagram |
| Design System Specification | `docs/design-system.md` | UI design tokens, component rules, typography |
| Development Plan | `build-docs/development-plan.md` | Phase 0-6 implementation plan |
| Development Plan v1 | `build-docs/development-plan-v1.md` | Phase 7-10 extension (aligned with TRD v1) |

### C. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 24/02/2026 | Adnan Bucalović | Initial PRD. Full alignment with TRD v0.1 (22 Feb 2026). Covers all FRs (FR1, FR2-MERCH-01 through 05, FR3-CONS-01 through 05, FR4-ADMIN-01 and 02) and all NFRs (1-3). |
