# AMS Platform — Product Requirements Document

**Version 1.0**
**Date: February 23, 2026**
**Author: Product Engineering, Ahoy Tech**

---

| Date | Version | Author | Notes |
|------|---------|--------|-------|
| 2026-02-23 | 1.0 | Product Engineering | Initial PRD aligned to TRD v0.1 |

---

## Table of Contents

1. [Purpose & Scope](#1-purpose--scope)
2. [Background & Problem Statement](#2-background--problem-statement)
3. [Product Vision](#3-product-vision)
4. [Target Users & Personas](#4-target-users--personas)
5. [User Journeys](#5-user-journeys)
6. [Functional Requirements](#6-functional-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Information Architecture & Navigation](#8-information-architecture--navigation)
9. [Domain Model](#9-domain-model)
10. [Consumption Endpoint — Detailed Specification](#10-consumption-endpoint--detailed-specification)
11. [Billing & Invoicing Model](#11-billing--invoicing-model)
12. [Platform Infrastructure](#12-platform-infrastructure)
13. [Release Strategy & Phasing](#13-release-strategy--phasing)
14. [Open Questions & Deferred Decisions](#14-open-questions--deferred-decisions)
15. [Appendix A: Acronyms](#15-appendix-a-acronyms)
16. [Appendix B: Reference Documents](#16-appendix-b-reference-documents)

---

## 1. Purpose & Scope

This document defines the product requirements for the **AMS (Application Management & Service) Platform** — a centralized service marketplace and management system operated by Ahoy Tech. It covers the MVP scope across all three user roles (Admin, Merchant, Consumer) and serves as the binding reference for what the product must do, why, and under what constraints.

This PRD is written against the AMS Technical Requirements Document (TRD v0.1, February 20, 2026) and the confirmed product decisions captured during discovery. Where the TRD describes *how* something is built, this document describes *what* is built and *for whom*.

**In scope for MVP:**
- Authentication (Email OTP, Google SSO)
- Merchant onboarding, API service configuration, Docker image lifecycle
- Consumer self-service (marketplace browsing, access requests, API key management, usage dashboards)
- Admin governance (merchant/consumer management, service approval, audit logs)
- Consumption endpoint (request validation, usage tracking, billing pipeline)
- Invoicing (postpaid, usage-based)

**Out of scope for MVP:**
- SDK and package distribution (future service types)
- Payment processing and collection (billing calculation is in scope; payment gateway is not)
- System health monitoring within the application (handled by Azure Monitor / App Insights)
- Free tier pricing logic (UI stubs only)
- Advanced security scanning of Docker images

---

## 2. Background & Problem Statement

Organizations that build and sell digital services — APIs, containerized applications, data products — face a common set of operational headaches:

1. **Distribution is fragmented.** There is no single surface where a service provider can publish an API and a Docker image under the same brand, with unified access control and billing.
2. **Access management is manual.** Issuing API keys, approving consumers, tracking who has access to what — these steps are typically stitched together with spreadsheets, custom scripts, and hope.
3. **Usage visibility is poor.** Merchants lack real-time consumption data. Consumers lack spending transparency. And platform operators have no consolidated view of what is happening across tenants.
4. **Billing is disconnected from usage.** Invoice generation requires exporting data from one system, correlating it in another, and hoping the numbers match.

AMS solves this by providing a managed marketplace where services are published, discovered, accessed, tracked, and billed through a single platform — with clear separation of concerns between the three parties involved.

---

## 3. Product Vision

AMS is a **service marketplace and management layer** that sits between organizations that provide digital services and the people (or systems) that consume them.

**For Merchants**, AMS is the place to publish APIs and Docker images, configure pricing, monitor consumption, and generate invoices — without building any of that infrastructure themselves.

**For Consumers**, AMS is a single catalog where they discover services, request access, manage API keys, pull Docker images, and track their usage and spending.

**For Ahoy Administrators**, AMS is a governance layer — inviting merchants, approving service listings, managing consumer access, and maintaining platform-wide audit trails.

The platform is designed around three principles:

1. **Control without friction.** Every action that requires approval (merchant onboarding, service listing, consumer access) goes through a lightweight workflow. But once access is granted, the consumption path has no unnecessary gates.
2. **Transparency for all parties.** Merchants see usage by API key. Consumers see spending by service. Admins see everything. Nobody operates blind.
3. **Infrastructure independence.** The platform abstracts away the underlying registry, identity provider, and cloud infrastructure behind clean interfaces. Azure today, AWS tomorrow — the product behavior stays the same.

---

## 4. Target Users & Personas

### 4.1 Ahoy Administrator

**Who they are:** Internal Ahoy Tech operators. Small team (2–5 people in MVP). They are the gatekeepers of the platform.

**What they care about:**
- Onboarding quality merchants quickly
- Keeping the marketplace clean (rejecting bad listings, suspending bad actors)
- Having a clear audit trail of every significant action on the platform
- Not getting paged for things Azure Monitor already handles

**Key constraints:**
- Admins invite merchants; merchants do not self-register
- Admins approve service listings before they go live
- Admins approve consumer access requests
- Admin can suspend merchants (platform-wide) and block consumers (platform-wide for MVP)
- System health, APM, and alerting are handled outside the application via Azure native tooling (Azure Monitor, Application Insights). AMS does not replicate this.

### 4.2 Merchant

**Who they are:** Service providers — companies or teams that build APIs, containerized applications, or (eventually) SDKs. They have been invited to the platform by an admin.

**What they care about:**
- Getting their services listed and live with minimal friction
- Understanding how their services are being consumed
- Getting paid accurately based on actual usage
- Having the ability to cut off bad actors without needing admin intervention for every case

**Key constraints:**
- Registration is invite-only (admin sends an invite code)
- Every service listing requires admin approval before it appears on the marketplace
- Merchants see usage aggregated by API key, not by consumer identity (privacy boundary)
- Merchants can revoke individual consumer API keys
- Billing is monthly postpaid; AMS commission is deducted from transactions
- Service types for MVP: API-based and Docker image-based
- Pricing model details, free tier logic, and payment collection are deferred to business team (stubbed in UI)

### 4.3 Consumer

**Who they are:** Developers, teams, or systems that need to use services published on AMS. Some consumers are individuals; some represent organizations.

**What they care about:**
- Finding the right service quickly
- Getting access without a long wait
- Managing their API keys with fine-grained control
- Understanding what they are spending and where

**Key constraints:**
- The marketplace is publicly browsable without authentication
- A single account can hold both merchant and consumer roles
- Accessing any service requires admin approval
- API keys have configurable TTL (time-to-live)
- No hard usage cap — consumption is billed postpaid
- Rate limiting is merchant-configurable per service
- Consumers can see merchant identity and full service details in the marketplace

---

## 5. User Journeys

### 5.1 Consumer Journey

| Step | Action | System Behavior |
|------|--------|-----------------|
| 1 | Consumer registers on AMS | Account created with consumer role |
| 2 | Browses public marketplace | Sees active services with merchant names, pricing, metadata |
| 3 | Requests access to a service | Access request created with `pending` status |
| 4 | Admin reviews request | Request moves to `approved` or `denied` |
| 5 | Generates API key | Key created with configurable TTL and service assignments |
| 6 | Consumes service | **API:** Calls via consumption endpoint. **Docker:** Pulls image, validates key at runtime |
| 7 | Rate limits enforced | Merchant-configured per-service rate limits applied per request |
| 8 | Usage accrues | No hard cap — postpaid billing based on actual consumption |
| 9 | Views usage dashboard | Counts, cost breakdown, per-service, per-key, historical trends |

### 5.2 Merchant Journey

| Step | Action | System Behavior |
|------|--------|-----------------|
| 1 | Admin invites merchant | Invite code generated and sent |
| 2 | Merchant registers via invite link | Account created with merchant role, linked to invite |
| 3 | Creates new service | Chooses API or Docker image type |
| 4 | Configures service | **API:** Metadata, pricing model, request tracing. **Docker:** Metadata, licensing model, push image |
| 5 | Submits for approval | Service status moves to `pending_approval` |
| 6 | Admin approves | Service goes live on marketplace |
| 7 | Monitors usage | Views consumption by API key (not consumer identity) |
| 8 | Revokes keys if needed | Can revoke individual consumer API keys |
| 9 | End of month | Invoice generated from usage data, AMS commission deducted |

### 5.3 Admin Journey

| Step | Action | System Behavior |
|------|--------|-----------------|
| 1 | Admin logs in | Full dashboard access |
| 2 | Invites merchants | Generates invite codes, sends to prospective merchants |
| 3 | Reviews service listings | Approves or rejects pending services |
| 4 | Manages consumers | Approves access requests, views individual usage data |
| 5 | Suspends or blocks | Can suspend merchants (platform-wide), block consumers (platform-wide) |
| 6 | Reviews governance | Audit logs, platform configuration, team management |

---

## 6. Functional Requirements

The following requirements are organized by role and mapped directly to the TRD's functional requirement identifiers.

### FR1: Authentication

| Aspect | Requirement |
|--------|-------------|
| **Methods** | Email-based OTP for signup and login; Google SSO |
| **Architecture** | Authentication via external IdP (e.g., Microsoft Entra ID); authorization managed internally by AMS |
| **Integration** | JWKS endpoint for token validation; access token processing; no tight coupling to IdP-specific SDKs |
| **Roles** | Three roles: `admin`, `merchant`, `consumer`. A single account may hold multiple roles. |
| **Merchant registration** | Invite-only. Admin generates invite code; merchant registers using that code. |
| **Consumer registration** | Self-service. Public registration form. |
| **Design principle** | Provider-agnostic. The IdP can be swapped without changing application logic. |

### FR2: Merchant Capabilities

#### FR2-MERCH-01: API Service Configuration

Merchants configure API-based services through a structured onboarding flow.

**Service Configuration:**
- Define a usage pricing model (per request, per MB, tiered, etc.)
- Configure billing unit and pricing logic
- Set usage limits (optional, merchant-configurable)

**API-Specific Configuration (REST APIs):**
- Request tracing options: request count, request payload size, response payload size

**Service Metadata (required for all services):**
- Service name
- Service description
- API base URL
- Documentation link
- Version information
- Usage and pricing model
- Additional information (rate limits, authentication method, supported formats, SLAs)

All metadata is visible to consumers when browsing the marketplace or viewing a service detail page.

#### FR2-MERCH-02: Image Storage & Lifecycle Management

Docker images are treated as a **first-class service type** on the platform.

**Image Service Onboarding:**
- Merchant creates an image-based service in AMS
- Defines image type (API container, worker, batch processor, offline licensed image)
- Assigns versioning
- Configures runtime parameters (if applicable)

**Image Publishing Process (from merchant's perspective):**
1. Register the image service in AMS portal
2. Receive push credentials (scoped PAT or token)
3. `docker login registry.ams.io`
4. `docker tag <image> registry.ams.io/<merchant>/<service>:<version>`
5. `docker push`
6. Image appears in AMS portal after validation

**What happens behind the scenes:**
- Image stored in private Azure Container Registry (ACR)
- AMS validates naming conventions, version format, service association, licensing model
- If valid → status = `Active` → eligible for consumer access
- If invalid → status = `Rejected` → merchant receives feedback

**Registry Abstraction:**
- MVP uses Azure Container Registry
- AMS implements a registry abstraction layer (PushImage, ValidateImage, GeneratePullToken, GetImageMetadata, RevokeAccess)
- No hard vendor lock-in; future support for AWS ECR, self-hosted, or on-prem registries

**Service Model:**
- A single service can contain multiple Docker images
- Each image can have multiple versions, independent lifecycle state, independent licensing
- Images are grouped under a merchant-owned service

**Access Control:**
- Registry is not public
- Merchants cannot see other merchants' images
- Merchants can only push to their scoped namespace
- All access controlled via scoped tokens

**Image Configuration & Management:**
- Update metadata
- Control consumer access (who can pull)
- Monitor usage and licensing compliance
- Deprecate or disable specific image versions

**Licensing Models:**
- Internet-connected images that report usage to AMS
- Time-based license images that deactivate after license period expires

#### FR2-MERCH-03: Consumption Endpoint

AMS provides a centralized consumption endpoint that merchants use to route and track service usage.

**Endpoint:** `POST /api/consume`

**Validation Chain (executed in order):**
1. Validate API key → `401` if missing or invalid
2. Check TTL → `403` if expired or revoked
3. Check service authorization → `403` if consumer has no access
4. Check merchant configuration → `502` if merchant misconfigured
5. Check rate limit → `429` if rate limit exceeded

**On successful validation:**
- Forward request to merchant's upstream API
- Queue usage event asynchronously

**Data Stored Per Request:**
- `consumer_id`
- `api_key_id`
- `service_id`
- `timestamp`
- `request_payload_size`
- `response_payload_size`
- `response_time_ms`
- `status_code`

**Async Pipeline:**
- Aggregate usage → update billing counters → feed dashboards → trigger threshold alerts

**Scalability:**
- Must handle high volumes of requests reliably
- Designed for efficient processing under heavy load

#### FR2-MERCH-04: Invoicing

**Invoice Generation:**
- Generate invoices for a specific consumer or group of consumers
- Usage-based calculations per the service's pricing model

**Consumption-Based Pricing:**
- Total cost calculated from: number of API requests or image executions, payload size or resource usage, and any other configurable usage metric

**Reporting:**
- Generate usage reports per consumer or per service
- Reports are exportable and sharable with consumers
- Include historical data for monthly or custom billing periods

**Forwarding:**
- Merchants can send invoices and reports directly to consumers
- Invoices include full metadata for transparency (service used, usage stats, pricing)

**Billing Cycle:**
- Monthly postpaid
- AMS commission deducted from total

#### FR2-MERCH-05: Consumer Management & Monitoring

**Usage Visibility:**
- See which consumers are actively using each API or image
- Detailed metrics: request counts, payload usage, execution frequency
- Per-consumer drill-down with monthly usage history

**Dashboard:**
- Overview of service activity: trends, spikes, usage distribution
- Historical data for reporting, auditing, and review

**Access Control:**
- Block or restrict specific consumers from accessing a service
- Revoke individual consumer API keys

**Image-Specific Monitoring:**
- View license or provisioning status for Docker images
- Track whether images are properly provisioned
- Monitor license validity and usage restrictions
- Ensure compliance with licensing agreements

### FR3: Consumer Capabilities

#### FR3-CONS-01: API Key Management

**Key Generation:**
- Generate API keys to access one or multiple services
- Each key receives a unique value and a visible prefix for identification

**Service Access Configuration:**
- Assign specific services to each API key
- One key can access multiple services

**TTL & Expiration:**
- Configurable time-to-live per key
- Keys automatically become invalid after TTL expires

**Revocation:**
- Consumers can disable or revoke keys at any time

**Metadata:**
- Add description, notes, or purpose to each key
- Metadata helps manage multiple keys efficiently

#### FR3-CONS-02: Service Discovery

**Marketplace Browsing:**
- Search for services by name, description, or merchant
- Filter by service type (API, Docker image), category, or metadata
- Marketplace is publicly accessible (browsable without login)

**Service Detail:**
- Full service metadata visible (name, description, pricing, documentation link, version, rate limits)
- Merchant identity visible to consumers

**Access Requests:**
- Request access to any active service
- Track request status (pending, approved, denied)

#### FR3-CONS-03: Usage Dashboard

**Service-Level Usage:**
- View usage and spending per service

**API Key-Level Usage:**
- Track usage and spending per API key

**Combined Overview:**
- Total consumption and spending across all services and keys

**Historical Data & Trends:**
- Access historical usage data for reporting and budget tracking
- Filter by date range, service, or team/project

**Real-Time Monitoring:**
- Monitor usage as it accrues (within async pipeline latency)

#### FR3-CONS-04: Projects & Teams

**Create Projects/Teams:**
- Define logical groupings for collaboration

**Invite Members:**
- Invite other users to join a project or team
- Manage membership

**Access Configuration:**
- Assign permissions and access rights to team members
- Control which services or resources members can access

**Collective Management:**
- Manage API keys, usage tracking, and service access at the team/project level
- Clear visibility over roles and responsibilities

#### FR3-CONS-05: Image & Container Management

**Image Discovery:**
- Browse and search Docker images by category, service type, or metadata
- Images include descriptions, version information, and usage instructions

**Access Control:**
- Internet-connected images require a valid API key at startup
- Offline or time-limited images enforce TTL configurations

**Image Pulling & Updates:**
- Pull images to local environment
- Refresh API keys when necessary (expiration, rotation)

**Licensing Compliance:**
- Each pulled image respects the merchant-defined licensing model
- Usage tracked for reporting, billing, and auditing

**Team Integration:**
- Assign pulled images to specific teams or projects
- Controlled access per team member

### FR4: Admin Capabilities

#### FR4-ADMIN-01: Merchant Management

- Invite merchants via invite code
- Review and approve service listings
- Suspend merchants platform-wide
- View merchant profiles, services, and activity

#### FR4-ADMIN-02: Consumer Management

- Approve or deny consumer access requests
- View individual consumer usage data
- Block consumers platform-wide (for MVP, no per-service blocking)
- View consumer profiles, access history, and keys

#### FR4-ADMIN-03: Governance

- Full audit log of significant platform actions (who did what, when, to what resource)
- Platform configuration management
- Team oversight

---

## 7. Non-Functional Requirements

### NFR1: API Response Time

| Scenario | Target | Percentile |
|----------|--------|-----------|
| Single content entry retrieval (e.g., `/api/articles/123`) under normal load (100 concurrent RPS) | ≤ 200ms | 95th |
| Collection retrieval (e.g., `/api/articles?limit=10&page=1`) under normal load (50 concurrent RPS) | ≤ 500ms | 90th |
| Static asset delivery via CDN | ≤ 100ms | 99th (global) |

**Design measures to meet targets:**
- Efficient database indexing on critical fields
- Caching layer (e.g., Redis) for frequently accessed content
- Optimized API endpoints to minimize data transfer and processing overhead
- CDN for publicly accessible content

### NFR2: Scalability

- The consumption endpoint must handle sustained high volumes without degradation
- Usage event processing is asynchronous — ingestion must never block the request path
- The system must support horizontal scaling of the consumption path independently of the management plane

### NFR3: Security & Access Control

- All authentication tokens validated via JWKS endpoint
- API keys scoped to specific services with configurable TTL
- Docker registry is private; no direct public access
- Push credentials scoped to specific merchant namespace
- Role-based access control enforced at route and API level
- Audit log captures all significant state changes

### NFR4: Portability & Vendor Independence

- Identity provider integration is abstract (JWKS-based, no IdP SDK lock-in)
- Docker registry behind an abstraction layer (swappable between ACR, ECR, self-hosted)
- No hard dependencies on cloud-specific services in the application layer

### NFR5: Responsiveness

- All interfaces must work across viewports: 320px, 375px, 768px, 1024px, 1440px
- Mobile-first approach for all consumer-facing pages

---

## 8. Information Architecture & Navigation

### Public Pages (no authentication required)

| Page | Path | Purpose |
|------|------|---------|
| Login | `/login` | Email OTP + Google SSO |
| Consumer Registration | `/register` | Self-service signup |
| Merchant Registration | `/register/merchant` | Invite-only signup |
| Marketplace Catalog | `/marketplace` | Browse active services |
| Service Detail | `/marketplace/:serviceId` | View full service information, request access |

### Consumer Dashboard

| Page | Path | Purpose |
|------|------|---------|
| Dashboard Overview | `/dashboard` | KPI cards, activity charts, recent activity |
| API Keys | `/dashboard/api-keys` | List, status, management |
| Create API Key | `/dashboard/api-keys/new` | Generate new key with service assignment and TTL |
| API Key Detail | `/dashboard/api-keys/:keyId` | View key details, revoke |
| Usage | `/dashboard/usage` | Usage analytics with charts |
| Usage Detail | `/dashboard/usage/:date` | Per-day request log |
| Services | `/dashboard/services` | Approved services list |
| Service Detail | `/dashboard/services/:serviceId` | Service info and usage |
| Docker Images | `/dashboard/images` | Image catalog and pull commands |
| Projects | `/dashboard/projects` | Project/team list |
| Project Detail | `/dashboard/projects/:projectId` | Project members and resources |

### Merchant Dashboard

| Page | Path | Purpose |
|------|------|---------|
| Dashboard Overview | `/merchant` | KPI cards, service activity, quick actions |
| Services | `/merchant/services` | Service list with status |
| Create Service | `/merchant/services/new` | New API or Docker service |
| Service Detail | `/merchant/services/:serviceId` | View/edit service, consumption endpoint docs |
| Service Consumers | `/merchant/services/:serviceId/consumers` | Consumers using this service |
| Consumers | `/merchant/consumers` | All consumers across services |
| Invoices | `/merchant/invoices` | Invoice list |
| Invoice Detail | `/merchant/invoices/:invoiceId` | Line items, totals, commission |
| Usage | `/merchant/usage` | Usage analytics |
| Usage Detail | `/merchant/usage/:date` | Per-day request log |
| Docker Images | `/merchant/images` | Image management, push flow |

### Admin Dashboard

| Page | Path | Purpose |
|------|------|---------|
| Dashboard Overview | `/admin` | Platform KPIs, pending items |
| Merchants | `/admin/merchants` | Merchant list with status |
| Merchant Detail | `/admin/merchants/:merchantId` | Profile, services, actions (suspend) |
| Consumers | `/admin/consumers` | Consumer list with status |
| Consumer Detail | `/admin/consumers/:consumerId` | Profile, usage, actions (block) |
| Services | `/admin/services` | All services with approval status |
| Service Detail | `/admin/services/:serviceId` | Review, approve/reject |
| Usage | `/admin/usage` | Platform-wide analytics |
| Usage Detail | `/admin/usage/:date` | Per-day request log |
| Governance | `/admin/governance` | Audit logs, platform config |

---

## 9. Domain Model

### Core Entities

**User**
- `id`, `email`, `name`, `roles[]`, `activeRole`, `status` (active / suspended / blocked), `avatarUrl`
- A user may hold multiple roles simultaneously (e.g., both merchant and consumer)

**Service**
- `id`, `merchantId`, `name`, `description`, `type` (api / docker), `status` (draft / pending_approval / active / rejected / suspended), `visibility` (public / private), `pricing`, `rateLimitPerMinute`, `tags[]`, `documentationUrl`, `version`, `baseUrl`
- Services are owned by a single merchant
- Status transitions require admin approval for activation

**API Key**
- `id`, `consumerId`, `name`, `keyValue`, `keyPrefix`, `serviceIds[]`, `status` (active / expired / revoked), `ttlDays`, `expiresAt`, `description`
- A key can be assigned to multiple services
- TTL is configurable at creation; expiration enforced automatically

**Access Request**
- `id`, `consumerId`, `serviceId`, `status` (pending / approved / denied), `requestedAt`, `resolvedAt`
- Approved requests unlock the ability to assign that service to an API key

**Usage Record**
- `consumerId`, `apiKeyId`, `serviceId`, `timestamp`, `requestPayloadSize`, `responsePayloadSize`, `responseTimeMs`, `statusCode`
- One record per consumption event
- Used to drive dashboards, billing counters, and invoicing

**Invoice**
- `id`, `merchantId`, `consumerId`, `period`, `lineItems[]`, `subtotal`, `commission`, `total`, `status` (draft / issued / paid / overdue)
- Line items reference services with request counts and unit prices

**Docker Image**
- `id`, `serviceId`, `name`, `tag`, `digest`, `sizeBytes`, `license`, `pullCommand`, `pushedAt`
- Images belong to a service; a service can have multiple images with independent versioning

**Docker Registry**
- `serviceId`, `registryUrl`, `repository`, `credentials`
- Abstracted behind a provider interface

**Project**
- `id`, `consumerId`, `name`, `description`, `members[]`, `createdAt`
- Logical grouping for team collaboration and shared access

**Audit Log**
- `id`, `userId`, `action`, `resource`, `resourceId`, `timestamp`, `details`
- Captures all significant platform actions

### Key Relationships

```
Merchant ──owns──▶ Service ──has──▶ Docker Image(s)
                      │
                      ├──▶ Access Request ◀── Consumer
                      │
                      └──▶ Usage Record ◀── API Key ◀── Consumer
                                                │
                                                └──▶ Invoice
Consumer ──creates──▶ Project ──has──▶ Members
Admin ──reviews──▶ Access Request, Service Listing
```

---

## 10. Consumption Endpoint — Detailed Specification

The consumption endpoint is the central nervous system of AMS's value proposition. Every API call from a consumer flows through this endpoint, which handles validation, forwarding, and usage tracking in a single request lifecycle.

### Endpoint

`POST /api/consume`

### Request Flow

```
Consumer Request
    │
    ▼
┌─────────────────────────┐
│ Step 1: Validate API Key │  → 401 Missing/Invalid key
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ Step 2: Check TTL        │  → 403 Expired/Revoked
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ Step 3: Check Service    │  → 403 No access to service
│          Authorization   │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ Step 4: Check Merchant   │  → 502 Merchant misconfigured
│          Config          │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ Step 5: Check Rate Limit │  → 429 Rate limited
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ Forward to Merchant API  │
│ Queue Usage Event (async)│
└─────────────────────────┘
```

### Error Responses

| HTTP Status | Meaning |
|-------------|---------|
| 401 | Missing or invalid API key |
| 403 | Key expired, revoked, or consumer lacks access to this service |
| 429 | Rate limit exceeded (merchant-configurable per service) |
| 502 | Merchant upstream is misconfigured or unreachable |

### Async Usage Pipeline

Once a request passes validation and is forwarded:

1. **Aggregate usage** — roll up raw events into counters
2. **Update billing counters** — increment the running totals for the current billing period
3. **Feed dashboards** — push updated metrics to consumer and merchant dashboards
4. **Trigger threshold alerts** — notify merchants or admins when consumption hits configured thresholds

This pipeline runs asynchronously and must never block the request path.

---

## 11. Billing & Invoicing Model

### Billing Cycle

- **Monthly postpaid.** Consumers use services throughout the month; invoices are generated at month-end.
- **AMS commission.** A platform commission is deducted from each transaction. The commission rate is configured at the platform level.

### Invoice Structure

Each invoice contains:
- Merchant and consumer identifiers
- Billing period (month/year)
- Line items, each referencing a service with:
  - Service name
  - Request count (or other usage metric)
  - Unit price
  - Line subtotal
- Subtotal (sum of line items)
- Commission (AMS take)
- Total (amount due to merchant after commission)

### Invoice Lifecycle

| Status | Meaning |
|--------|---------|
| `draft` | Generated but not yet finalized |
| `issued` | Sent to consumer |
| `paid` | Payment received |
| `overdue` | Past due date, unpaid |

### What Is Deferred

- Actual payment collection (gateway integration) — TBD by business team
- Free tier pricing logic — UI stubs present, logic not implemented
- Pricing model configuration details — merchant can define models, but enforcement is stubbed

---

## 12. Platform Infrastructure

### Infrastructure Overview (MVP)

The AMS platform runs on cloud infrastructure. For MVP, the target deployment environment uses Azure-native services, with abstraction layers to prevent vendor lock-in.

| Component | Service | Purpose |
|-----------|---------|---------|
| Application hosting | Azure Container Apps (or equivalent) | Run the AMS web application and API |
| Container registry | Azure Container Registry (ACR) | Store merchant Docker images (private, not public) |
| Identity provider | Microsoft Entra ID (or equivalent) | Authentication (Email OTP, Google SSO) |
| Database | Azure Database for PostgreSQL (or equivalent) | Primary relational store |
| Caching | Redis | Frequently accessed content, session data |
| CDN | Azure CDN (or equivalent) | Static asset delivery |
| Monitoring | Azure Monitor + Application Insights | System health, APM, alerting (outside AMS app) |
| Secrets | Azure Key Vault (or equivalent) | API keys, registry credentials, IdP secrets |

### Portability Notes

- The container registry is accessed through an abstraction layer (`ImageRegistryProvider` interface) — ACR is the MVP implementation, but the interface supports ECR, self-hosted, or on-prem registries.
- The identity provider is integrated via JWKS endpoint only — no SDK-specific coupling.
- The database layer uses standard PostgreSQL — portable to AWS RDS, self-hosted, or managed alternatives.

### Environments

| Environment | Release Trigger | Source Branch |
|-------------|----------------|---------------|
| Test | Automatic / Manual (feature branch) | `main` or feature branches |
| Production | Manual | `main` |

---

## 13. Release Strategy & Phasing

### MVP Phase (Current)

The MVP covers the complete end-to-end flow for all three roles:

| Area | What Ships |
|------|-----------|
| Authentication | Email OTP, Google SSO, role-based access |
| Marketplace | Public catalog, search, filter, service detail, access requests |
| Consumer | API key management, usage dashboard, service list, Docker images, projects/teams |
| Merchant | Service management (API + Docker), consumer monitoring, invoicing, usage analytics, consumption endpoint |
| Admin | Merchant management (invite, suspend), consumer management (approve, block), service approval, governance & audit logs |
| Infrastructure | Azure-based deployment with abstraction layers |

### Post-MVP (Planned)

These items are referenced in the TRD but explicitly out of scope for MVP:

| Item | Notes |
|------|-------|
| SDK and package distribution | New service type beyond API and Docker |
| Payment gateway integration | Billing calculation exists; payment collection does not |
| Image security scanning | Validation pipeline exists; security scanning is a future enhancement |
| Image signature verification | Referenced as future enhancement in TRD |
| Per-service consumer blocking | MVP supports platform-wide blocking only |
| Advanced analytics and reporting | MVP provides core dashboards; advanced analytics are post-MVP |
| On-premises registry support | Abstraction layer exists; on-prem implementation is future |

---

## 14. Open Questions & Deferred Decisions

These items are flagged as open in the TRD or product discussions. They require decisions before they can be fully specified and built.

| # | Question | Owner | Impact |
|---|----------|-------|--------|
| 1 | What is the specific pricing model for services? (per request, per MB, tiered) | Business team | Affects invoice line item calculation and merchant configuration UI |
| 2 | What is the AMS commission rate? Fixed percentage or tiered? | Business team | Affects invoice total calculation |
| 3 | How are free tiers structured? Per-service or platform-wide? | Business team | Affects consumption endpoint logic (bypass billing under free tier) |
| 4 | What payment collection method will be used? | Business team | Affects invoice lifecycle (when does `issued` become `paid`?) |
| 5 | What defines "normal load" quantitatively for performance targets? | Engineering | Affects NFR validation and load testing |
| 6 | Are there specific geographic regions where performance is more critical? | Business team | Affects CDN and infrastructure placement |
| 7 | What tools will be used for performance monitoring and load testing? | Engineering | Affects NFR verification strategy |
| 8 | Should separate performance targets exist for cached vs. uncached content? | Engineering | Affects caching strategy and NFR definitions |
| 9 | What is the exact scope of per-service vs. platform-wide consumer blocking? | Product | MVP is platform-wide; post-MVP granularity is TBD |
| 10 | What audit events are required for compliance vs. nice-to-have? | Legal / Compliance | Affects audit log scope and retention policy |

---

## 15. Appendix A: Acronyms

| Acronym | Full Name |
|---------|-----------|
| AMS | Application Management & Service |
| ACR | Azure Container Registry |
| API | Application Programming Interface |
| APM | Application Performance Monitoring |
| CDN | Content Delivery Network |
| ECR | Elastic Container Registry (AWS) |
| IdP | Identity Provider |
| JWKS | JSON Web Key Set |
| MVP | Minimum Viable Product |
| OTP | One-Time Password |
| PAT | Personal Access Token |
| PRD | Product Requirements Document |
| RPS | Requests Per Second |
| SLA | Service Level Agreement |
| SSO | Single Sign-On |
| TRD | Technical Requirements Document |
| TTL | Time-to-Live |

---

## 16. Appendix B: Reference Documents

| Document | Location | Purpose |
|----------|----------|---------|
| Technical Requirements Document (TRD) v0.1 | `build-docs/ams-trd.md` | Technical specifications and architecture |
| Consumer Journey | `build-docs/consumer-journey.md` | Consumer user flow diagram |
| Merchant Journey | `build-docs/merchant-yourney.md` | Merchant user flow diagram |
| Admin Journey | `build-docs/admin-journey.md` | Admin user flow diagram |
| Design System | `docs/design-system.md` | Ahoy Tech visual design specification |
| Development Methodology | `docs/METHODOLOGY.md` | Spec-driven development workflow |
| Feature Specifications | `docs/specs/` | Individual feature specs with acceptance criteria |

---

*This document is the product-level source of truth for AMS MVP. All feature specifications, design decisions, and implementation plans should trace back to the requirements defined here. Where a conflict exists between this PRD and the TRD, the discrepancy should be raised and resolved — neither document overrides the other without explicit agreement.*
