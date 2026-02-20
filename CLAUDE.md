# CLAUDE.md - AMS Platform Development Instructions

This file provides instructions to Claude Code for how to work on the AMS project.

## Project Overview

**Project:** AMS (Application Management & Service)
**Approach:** prototype
**Type:** web
**Stack:** React + TypeScript + Tailwind + shadcn/ui

AMS is a centralized service marketplace connecting three user roles:
- **Admins** — platform operators with full oversight and governance
- **Merchants** — service providers who publish APIs and Docker images
- **Consumers** — users who discover, access, and consume services

## Tech Stack (from workflow.config.yaml)

- **Framework:** React with TypeScript
- **Styling:** Tailwind CSS
- **UI Library:** shadcn/ui
- **Testing:** Vitest
- **Linting:** ESLint + Prettier
- **Backend:** Mock data / local storage (prototype mode)

## Development Approach — PROTOTYPE MODE

- **Focus:** Frontend-only, fast iteration
- **Backend:** Mock data, local storage
- **Quality Gates:** 5 essential gates only
- **Goal:** Validate ideas, get visual feedback quickly

## Design System — Ahoy Tech Palette

| Token            | Color   | Name            | Usage     |
|------------------|---------|-----------------|-----------|
| Ice White        | #F3F5FF | Primary Light   | 100%      |
| Deep Blue        | #333E63 | Primary Dark    | 50%       |
| Brand/Primary    | #0066FF | Neon Blue       | 35%       |
| Danger           | #FF0005 | Red             | 5%        |

**Typography:**
- Headings: `Lexend Deca` (Regular, Light weights)
- Body: `Inter` (Regular)
- Text color: `#333E63` (Deep Blue)

**Component Styling:**
- Border radius: ~32px for cards
- Card shadows: `0px 0.93px 23.2px rgba(255,255,255,0.1)`
- Backdrop blur: ~54px for glass effects
- Stroke: `hsla(0, 0%, 100%, 0.50)` inside borders

**Footer:**
- Text: "© 2025 Ahoy Tech. All rights reserved."
- Font: Lexend Deca Regular, 16px, color #333E63

## Confirmed Product Decisions (LOCKED — do not deviate)

### Merchant
- Registration is invite-only (admin sends invite)
- Services require admin approval before going live
- Merchants see usage per API key, NOT consumer identity
- Merchants can revoke consumer API keys
- Monthly postpaid billing cycle, AMS commission deducted from transactions
- Service types: API-based and Docker image-based
- Pricing model, free tiers, payment collection — TBD (stub in UI)

### Consumer
- Public marketplace (browsable without login)
- One account can be both merchant and consumer
- Access to services requires admin approval
- API keys have configurable TTL
- No hard usage cap — use as needed, billed postpaid
- Rate limiting is merchant-configurable per service
- Consumer sees merchant identity and service details
- Usage dashboard: counts, cost breakdown, per-service, per-key, history

### Admin
- Full CRUD over merchants and consumers
- Invites merchants, approves service listings, approves consumer access requests
- Can suspend merchants (platform-wide) and block consumers (platform-wide for MVP)
- Can view individual consumer usage data
- System health monitoring NOT in app — handled by Azure native (Monitor, App Insights)

### Consumption Endpoint (POST /api/consume)
- Validates API key → checks TTL → checks service authorization → checks merchant config → checks rate limit
- Error responses: 401 (missing/invalid key), 403 (expired/revoked/no access), 502 (merchant misconfigured), 429 (rate limited)
- Queues usage event async (for billing and analytics)
- Forwards request to merchant's upstream API
- Stores: consumer_id, api_key_id, service_id, timestamp, request_payload_size, response_payload_size, response_time_ms, status_code
- Async pipeline: aggregate usage → update billing counters → feed dashboards → trigger threshold alerts

## User Journeys (reference: build-docs/)

### Consumer Journey
1. Register on AMS
2. Browse public marketplace (see merchant + service details)
3. Request access to a service
4. Admin approves/denies access
5. Generate API key → configure (assign services, set TTL)
6. API: call via consumption endpoint / Docker: pull image + validate key
7. Merchant rate limits enforced per request
8. No hard cap — postpaid billing
9. Usage dashboard: counts, cost breakdown, per-service, per-key, history

### Merchant Journey
1. Admin invites merchant → merchant registers via invite link
2. Access dashboard → create new service (API or Docker image)
3. API: set metadata, pricing, tracing / Docker: set metadata, license, push image
4. Submit for admin approval → service goes live on marketplace
5. Monitor usage by API key (not consumer identity)
6. Can revoke consumer API keys
7. End of month: generate postpaid invoice from usage, AMS commission deducted

### Admin Journey
1. Login → admin dashboard (full CRUD)
2. Merchant management: invite, approve service listings, suspend
3. Consumer management: approve access requests, view usage data, block
4. Governance: audit logs, platform config, teams

## Functional Requirements (reference: build-docs/ams-trd.md)

| ID | Area | Description |
|----|------|-------------|
| FR1 | Authentication | Email OTP + Google SSO, JWKS-based, provider-agnostic |
| FR2-MERCH-01 | Merchant: API Config | Service metadata, pricing model, request tracing |
| FR2-MERCH-02 | Merchant: Image Mgmt | Docker image push, versioning, licensing, registry abstraction |
| FR2-MERCH-03 | Merchant: Consumption | High-scale consumption endpoint, API key validation, usage tracking |
| FR2-MERCH-04 | Merchant: Invoicing | Usage-based invoice generation, reports, forwarding to consumers |
| FR2-MERCH-05 | Merchant: Consumer Mgmt | Usage monitoring, access control, license status |
| FR3-CONS-01 | Consumer: API Keys | Generate, configure TTL, assign services, revoke |
| FR3-CONS-02 | Consumer: Service Discovery | Search, filter, browse marketplace, request access |
| FR3-CONS-03 | Consumer: Usage | Dashboard with per-service, per-key, historical data |
| FR3-CONS-04 | Consumer: Projects & Teams | Logical groupings, invite members, shared access |
| FR3-CONS-05 | Consumer: Image Mgmt | Pull Docker images, API key validation at runtime |
| FR4-ADMIN-01 | Admin: Merchant Mgmt | Invite, approve, suspend merchants |
| FR4-ADMIN-02 | Admin: Consumer Mgmt | Approve access, view usage, block consumers |

## Workflow Methodology

This project follows **Spec-Driven Development with BDD-style Acceptance Criteria**.

### Core Principles

1. **Spec First** — Never write code without an approved specification
2. **Given/When/Then** — All acceptance criteria use BDD format
3. **TDD** — Write failing tests before implementation (Red-Green-Blue)
4. **Traceability** — Every spec criterion has a matching test
5. **Stop & Wait** — Always wait for explicit user approval
6. **Manual Git** — Never commit or push without user instruction

## Team Personas

### Tech Lead (Alex Chen)
- **Active in:** Spec & Design, Implementation
- **Focus:** Architecture, clean code, TDD, performance
- **Style:** Technical but clear, comprehensive

### Quality Lead (Dr. Priya Patel)
- **Active in:** Test Planning, Review, User Testing
- **Focus:** Quality gates, UX, accessibility, testing
- **Style:** Thorough, detailed checklists

## Development Phases

### Phase 1: Spec & Design
1. Create specification in `docs/specs/[feature-name].md`
2. Use SPEC_TEMPLATE.md format
3. Write all acceptance criteria in Given/When/Then format
4. Include traceability matrix (empty, to be filled during implementation)
5. **STOP** — Wait for user to approve spec before proceeding

### Phase 2: Test Planning
1. Create test strategy based on approved spec
2. Plan tests for each acceptance criterion
3. Identify edge cases and error scenarios

### Phase 3: Implementation (TDD)
1. For each acceptance criterion:
   - Write failing test (RED)
   - Implement minimum code to pass (GREEN)
   - Refactor while keeping tests green (BLUE)
2. Update traceability matrix with test locations

### Phase 4: Team Review
1. Run all quality gates (see checklist below)
2. Create review document in `docs/reviews/[feature-name].md`
3. All gates must pass before proceeding

### Phase 5: User Testing
1. Present completed feature to user
2. **STOP & WAIT** for explicit approval
3. On approval: Generate feature documentation
4. User may request changes — iterate as needed

## Quality Gates (PROTOTYPE MODE — 5 gates)

- [ ] **Code Quality** — Linting passes, no warnings
- [ ] **Functionality** — All acceptance criteria met
- [ ] **Mobile Responsive** — Works at 320px, 375px, 768px, 1024px, 1440px
- [ ] **UX Consistency** — Matches Ahoy Tech design system
- [ ] **Documentation** — Code commented where needed

## Feature Delivery Format

```
FEATURE COMPLETE: [Feature Name]

WHAT WAS BUILT:
[Clear description]

ACCEPTANCE CRITERIA STATUS:
- AC-001: [description] - PASSED
- AC-002: [description] - PASSED

QUALITY GATES: ALL PASSED
[List each gate with status]

HOW TO TEST:
1. [Step-by-step instructions]

TRACEABILITY:
| Criterion | Test File | Test Name | Status |
|-----------|-----------|-----------|--------|
| AC-001    | ...       | ...       | PASSED |

AWAITING YOUR APPROVAL
```

## Acceptance Criteria Format

```gherkin
### AC-001: [Brief description]
GIVEN [precondition/context]
WHEN [action taken]
AND [additional action if needed]
THEN [expected result]
AND [additional expectation if needed]
```

## Bug Handling

1. **STOP** — Don't fix immediately
2. **ANALYZE** — Root cause analysis (5 Whys)
3. **DOCUMENT** — Create post-mortem in `docs/bugs/`
4. **TEST** — Write failing regression test FIRST
5. **FIX** — Implement minimal fix
6. **VERIFY** — Run all tests
7. **REVIEW** — Quality Lead reviews
8. **CLOSE** — Update post-mortem

## Git Workflow

**NEVER commit or push without explicit user instruction.**

Conventional Commits format: `<type>(<scope>): <description>`

Types: `feat`, `fix`, `docs`, `spec`, `test`, `refactor`, `chore`

## Commands

```bash
npm run dev              # Start dev server
npm run test             # Run tests
npm run test:coverage    # Run with coverage
npm run lint             # Run linter
npm run lint:fix         # Fix linting issues
npm run typecheck        # TypeScript check
npm run build            # Production build
```

## Key Files

| File | Purpose |
|------|---------|
| `config/workflow.config.yaml` | Project-specific workflow settings |
| `config/personas.yaml` | AI persona definitions |
| `build-docs/ams-trd.md` | Technical Requirements Document |
| `build-docs/consumer-journey.md` | Consumer user journey flow |
| `build-docs/merchant-yourney.md` | Merchant user journey flow |
| `build-docs/admin-journey.md` | Admin user journey flow |
| `docs/SPEC_TEMPLATE.md` | Feature specification template |
| `docs/METHODOLOGY.md` | Core philosophy and principles |
| `docs/WORKFLOW_RULES.md` | Complete workflow reference |

## Documentation Auto-Generation

When user says "approved", "green light", or "looks good":
1. Generate feature documentation in `docs/features/[feature-name].md`
2. Include both technical and user-facing documentation
3. Mark feature as COMPLETE

## Critical Rules

1. **NEVER** write code without an approved spec
2. **NEVER** skip the Given/When/Then format for acceptance criteria
3. **NEVER** proceed without explicit user approval at phase gates
4. **NEVER** commit or push without user instruction
5. **NEVER** skip quality gates
6. **ALWAYS** write failing tests before implementation
7. **ALWAYS** update traceability matrix
8. **ALWAYS** generate documentation on feature approval
9. **ALWAYS** use Ahoy Tech design system tokens for colors, typography, and spacing
10. **ALWAYS** refer to build-docs/ for domain requirements before implementing features
