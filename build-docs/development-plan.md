# AMS MVP Prototype — Development Plan

## Context

AMS is a centralized service marketplace connecting Admins, Merchants, and Consumers. This plan covers the full frontend prototype: mock data, all three role dashboards, public marketplace, and the consumption endpoint simulation. No real backend — all data is mocked with Zustand + localStorage.

**Locked decisions:** React Router v7, Zustand, Projects & Teams included (basic UI), Docker image management as UI stubs only.

---

## Architecture

### Folder Structure

```
src/
  app/
    router.tsx                  # React Router v7 routes
    providers.tsx               # All providers wrapper
  assets/                       # Static assets (logos, icons)
  components/
    ui/                         # shadcn/ui (auto-installed)
    layout/
      root-layout.tsx           # Error boundary, providers, toasts
      public-layout.tsx         # Header + logo + login link (no sidebar)
      auth-layout.tsx           # Centered card layout
      dashboard-layout.tsx      # Sidebar + topbar + content
    shared/
      data-table.tsx            # Sortable/filterable table with pagination
      stat-card.tsx             # KPI metric card
      status-badge.tsx          # Colored status pill
      empty-state.tsx           # Empty state placeholder
      page-header.tsx           # Title + breadcrumbs + actions
      search-input.tsx          # Debounced search
      confirm-dialog.tsx        # AlertDialog wrapper
      role-guard.tsx            # Render by role
      loading-skeleton.tsx      # Skeleton loader
      copy-button.tsx           # Click-to-copy
      tbd-badge.tsx             # "TBD" indicator
      user-menu.tsx             # Avatar dropdown (profile, role switch, logout)
      notification-center.tsx   # Bell icon + notification dropdown
    dev/
      dev-panel.tsx             # Reset data, impersonate user
  features/
    auth/
      pages/                    # Login, Register, MerchantRegister
      components/               # LoginForm, SSOButton, OTPInput, RoleSwitcher
      store.ts                  # OTP flow, registration state
    marketplace/
      pages/                    # Catalog, ServiceDetail
      components/               # ServiceCard, ServiceGrid, ServiceFilters
      store.ts                  # Search, filters
    consumer/
      pages/                    # Dashboard, ApiKeys, Usage, Services, Images, Projects
      components/               # ApiKeyTable, UsageChart, CostSummary, etc.
      store.ts                  # Consumer-specific filters
    merchant/
      pages/                    # Dashboard, Services, ServiceNew, Consumers, Invoices, Images
      components/               # ServiceForm wizard, ConsumerUsageTable, InvoiceTable, etc.
      store.ts                  # Service wizard, filters
    admin/
      pages/                    # Dashboard, Merchants, Consumers, Services, Governance
      components/               # ApprovalQueue, MerchantTable, InviteDialog, etc.
      store.ts                  # Approval filters
  hooks/
    use-mock-delay.ts           # Simulate async loading
    use-debounce.ts             # Debounced values
  lib/
    utils.ts                    # cn() utility (exists)
    constants.ts                # Routes, roles, config
    format.ts                   # Number/currency/date formatting
  mocks/
    data/                       # Static seed data (users, services, keys, usage, invoices, etc.)
    handlers.ts                 # Mock data access functions (filter, paginate, CRUD)
    delay.ts                    # Simulated network latency
  stores/
    auth-store.ts               # Auth state + persist middleware
    notification-store.ts       # Toasts + in-app notifications
  types/                        # All TypeScript interfaces
    user.ts, service.ts, api-key.ts, usage.ts, invoice.ts,
    project.ts, audit.ts, docker.ts, consumption.ts, common.ts
  test/
    setup.ts                    # Exists
    test-utils.tsx              # Custom render with providers
```

### Route Map

```
/                               → Redirect based on auth state
/login                          → Auth: email OTP + Google SSO
/register                       → Auth: consumer registration
/register/merchant              → Auth: merchant invite registration
/marketplace                    → Public: service catalog
/marketplace/:serviceId         → Public: service detail

/dashboard                      → Consumer: overview KPIs
/dashboard/api-keys             → Consumer: key list
/dashboard/api-keys/new         → Consumer: generate key
/dashboard/api-keys/:keyId      → Consumer: key detail
/dashboard/usage                → Consumer: usage charts
/dashboard/services             → Consumer: subscribed services
/dashboard/services/:serviceId  → Consumer: service usage detail
/dashboard/images               → Consumer: Docker images (stub)
/dashboard/projects             → Consumer: projects list
/dashboard/projects/:projectId  → Consumer: project detail

/merchant                       → Merchant: overview KPIs
/merchant/services              → Merchant: service list
/merchant/services/new          → Merchant: create service (multi-step)
/merchant/services/:serviceId   → Merchant: service detail/edit
/merchant/services/:serviceId/consumers → Merchant: consumers of service
/merchant/consumers             → Merchant: all consumers
/merchant/invoices              → Merchant: invoice list
/merchant/invoices/:invoiceId   → Merchant: invoice detail
/merchant/images                → Merchant: Docker images (stub)

/admin                          → Admin: overview + approval queue
/admin/merchants                → Admin: merchant list + invite
/admin/merchants/:merchantId    → Admin: merchant detail
/admin/consumers                → Admin: consumer list
/admin/consumers/:consumerId    → Admin: consumer detail
/admin/services                 → Admin: all services + approvals
/admin/services/:serviceId      → Admin: service approval detail
/admin/governance               → Admin: audit logs + config
```

### Layout Hierarchy

```
<RootLayout>                         # Error boundary, providers, toasts
  <PublicLayout>                     # Logo header, login link
    /marketplace, /marketplace/:id
  <AuthLayout>                       # Centered card
    /login, /register, /register/merchant
  <DashboardLayout>                  # Sidebar + topbar
    Consumer sidebar → /dashboard/*
    Merchant sidebar → /merchant/*
    Admin sidebar    → /admin/*
```

### Mock Data Strategy

- **Seed data** in `src/mocks/data/*.ts` — typed arrays of mock objects
- **Handlers** in `src/mocks/handlers.ts` — filtering, pagination, sort, CRUD (all return Promises)
- **Simulated latency** via `src/mocks/delay.ts` (200-800ms random)
- **Persistence** via Zustand `persist` middleware → localStorage
- **Reset** via `?reset=true` URL param or dev panel

### Zustand Stores

| Store | Persisted | Purpose |
|-------|-----------|---------|
| `stores/auth-store.ts` | Yes | currentUser, role, login/logout/switchRole |
| `stores/notification-store.ts` | No | Toasts + in-app notifications |
| `features/auth/store.ts` | No | OTP step, registration form |
| `features/marketplace/store.ts` | No | Search query, filters |
| `features/consumer/store.ts` | No | Key filters, usage date range |
| `features/merchant/store.ts` | No | Service wizard state, filters |
| `features/admin/store.ts` | No | Approval queue filters |

---

## Phase 0: Foundation

**Goal:** Application skeleton — routing, layouts, shared components, mock data layer, auth store. No user-visible features yet.

**Install:**
- `react-router` (v7), `zustand`
- shadcn: `button`, `card`, `sidebar`, `avatar`, `dropdown-menu`, `badge`, `skeleton`, `alert-dialog`, `sonner`, `separator`, `breadcrumb`, `tooltip`, `sheet`

**Build:**
- All layout components (root, public, auth, dashboard with collapsible sidebar)
- Shared components: page-header, status-badge, empty-state, loading-skeleton, role-guard, tbd-badge, confirm-dialog
- Type definitions: `types/*.ts` (user, service, api-key, usage, invoice, project, audit, docker, consumption, common)
- Mock seed data: `mocks/data/*.ts`
- Mock handlers: `mocks/handlers.ts`
- Auth store with persist
- Notification store
- Router config with all route stubs
- 404 page
- Test utils (custom render with providers)

**Spec:** `docs/specs/foundation-routing-layouts.md`

**AC themes:**
- Router renders correct layout for each route segment
- Sidebar collapses on mobile, shows full nav on desktop
- Role guard prevents rendering protected content
- Auth store persists to localStorage and rehydrates on reload
- 404 page shows for unknown routes
- All layouts responsive at 320px, 375px, 768px, 1024px, 1440px
- Design tokens (colors, fonts, radius) applied correctly

---

## Phase 1: Authentication & Role System

**Goal:** Mocked auth flow (email OTP + Google SSO UI), role-based routing, role switching for dual accounts.

**Depends on:** Phase 0

**Install shadcn:** `input`, `label`, `tabs`

**Build:**
- `/login` — email + OTP inputs, Google SSO button, dev role selector
- `/register` — consumer self-registration form
- `/register/merchant` — invite-only with invite code validation
- Auth feature store (OTP steps, registration)
- Role switcher component (for merchant+consumer dual accounts)
- User menu (avatar dropdown: profile, switch role, logout)
- Route guards (redirect to /login if unauthenticated)

**Specs:**
- `docs/specs/auth-login.md`
- `docs/specs/auth-registration.md`
- `docs/specs/auth-role-switching.md`

**AC themes:**
- Valid OTP → redirect to role dashboard
- SSO mock flow completes → lands on dashboard
- Unauthenticated → /login redirect
- Dual role switching updates sidebar and accessible routes
- Invite code required for merchant registration
- Logout clears state → /login

---

## Phase 2: Public Marketplace & Service Discovery

**Goal:** Public service catalog browsable without login. Search, filter, detail pages, access request.

**Depends on:** Phase 0, Phase 1 (for Request Access auth gating)

**Install shadcn:** `select`, `dialog`, `scroll-area`

**Build:**
- `/marketplace` — responsive grid of service cards, search bar, type filter (API/Docker)
- `/marketplace/:serviceId` — full detail: metadata, pricing, docs link, "Request Access" button
- Search input (shared, debounced 300ms)
- Service card, service grid, service filters components
- Access request flow (login required → mock request with "pending" status)

**Specs:**
- `docs/specs/marketplace-catalog.md`
- `docs/specs/marketplace-service-detail.md`
- `docs/specs/marketplace-access-request.md`

**AC themes:**
- No login required to browse
- Search filters in real-time (debounced)
- Type filter (API/Docker) works
- Responsive grid: 1col at 320px → 4col at 1440px
- Unauthenticated "Request Access" → login redirect
- Access request creates pending state
- Empty state on no results
- Service cards show type badge and pricing

---

## Phase 3: Consumer Dashboard

**Goal:** Full consumer experience — dashboard overview, API key management, usage charts, Docker images (stub), Projects & Teams.

**Depends on:** Phases 0-2

**Install shadcn:** `table`, `switch`, `textarea`, `popover`, `calendar`, `chart`, `progress`, `collapsible`, `accordion`

**Build:**
- `/dashboard` — KPI cards (services, keys, usage, cost), recent activity
- `/dashboard/api-keys` — keys table, generate, detail, revoke
- `/dashboard/api-keys/new` — name, description, select services, TTL, metadata
- `/dashboard/api-keys/:keyId` — masked key (copy), config, usage, revoke
- `/dashboard/usage` — line/bar charts (daily usage, per-service, per-key, cost)
- `/dashboard/services` — subscribed services with usage minibar
- `/dashboard/images` — Docker images with pull instructions (stub)
- `/dashboard/projects` — project list, project detail with members/services

**Specs:**
- `docs/specs/consumer-dashboard-overview.md`
- `docs/specs/consumer-api-key-management.md`
- `docs/specs/consumer-usage-dashboard.md`
- `docs/specs/consumer-docker-images.md`
- `docs/specs/consumer-projects-teams.md`

**AC themes:**
- KPIs show correct aggregates from mock data
- Key visible once on creation then masked forever
- TTL expiry logic works (expired keys show as expired)
- Revoke changes status after confirmation dialog
- Usage chart filters by date/service/key
- Cost breakdown per service accurate
- Docker pull commands displayed with copy button
- Projects show members and assigned services

---

## Phase 4: Merchant Dashboard

**Goal:** Merchant experience — service creation (API + Docker types), consumption endpoint docs, consumer monitoring by API key, invoicing with TBD stubs.

**Depends on:** Phases 0-3

**Install shadcn:** `radio-group`, `checkbox`, `hover-card`

**Build:**
- `/merchant` — KPI cards (services, consumers, usage, revenue)
- `/merchant/services` — service table with status/type
- `/merchant/services/new` — multi-step wizard: type → metadata → pricing → tracing → Docker config → review
- `/merchant/services/:serviceId` — detail/edit, consumption endpoint docs, validation chain visualization
- `/merchant/services/:serviceId/consumers` — usage by API key (not consumer identity)
- `/merchant/consumers` — all consumers across services
- `/merchant/invoices` — invoice table, detail with line items, TBD payment
- `/merchant/images` — Docker image versions, push credentials display

**Specs:**
- `docs/specs/merchant-dashboard-overview.md`
- `docs/specs/merchant-service-configuration.md`
- `docs/specs/merchant-docker-image-management.md`
- `docs/specs/merchant-consumption-endpoint.md`
- `docs/specs/merchant-invoicing.md`
- `docs/specs/merchant-consumer-management.md`

**AC themes:**
- Multi-step service form validates per step
- Docker type shows license config + push instructions
- Consumption endpoint docs display full contract + error codes (401/403/429/502)
- Validation chain visualized as pipeline steps
- Usage grouped by API key NOT consumer identity
- Revoke consumer key works after confirmation
- Invoices show line items with TBD badge on payment section
- Push credentials are copyable

---

## Phase 5: Admin Dashboard

**Goal:** Admin oversight — merchant invite/approve/suspend, consumer approve/block, service approval workflow, governance (audit logs mock).

**Depends on:** Phases 0-4

**Build:**
- `/admin` — KPI cards (merchants, consumers, pending approvals, services), approval queue
- `/admin/merchants` — merchant table, invite dialog (email input → generate invite link)
- `/admin/merchants/:merchantId` — detail, services, suspend/unsuspend
- `/admin/consumers` — consumer table, block action
- `/admin/consumers/:consumerId` — detail, subscribed services, usage, block
- `/admin/services` — all services with approve/reject workflow
- `/admin/services/:serviceId` — approval detail with reason field
- `/admin/governance` — audit logs (mock filterable table), platform config (TBD card)

**Specs:**
- `docs/specs/admin-dashboard-overview.md`
- `docs/specs/admin-merchant-management.md`
- `docs/specs/admin-consumer-management.md`
- `docs/specs/admin-service-approval.md`
- `docs/specs/admin-governance.md`

**AC themes:**
- Invite generates link to clipboard
- Approve/reject changes service status (active/rejected)
- Suspend merchant hides all their services from marketplace
- Block consumer revokes all their API keys
- Audit log filterable by action type
- Approval queue shows all pending items across merchants

---

## Phase 6: Cross-role Flows & Polish

**Goal:** Connect the dots — consumption endpoint simulation, end-to-end approval flows, notification system, responsive polish.

**Depends on:** Phases 0-5

**Build:**
- Consumption simulator (form on merchant service detail — simulate POST /api/consume with validation steps)
- Error code simulation (401, 403, 429, 502 scenarios with visual indicators)
- Usage pipeline visualization (aggregate → billing → dashboards → alerts)
- End-to-end flow: merchant creates → admin approves → consumer requests → admin approves → consumer generates key
- Notification center (bell icon in topbar, in-app notifications)
- Dev panel (reset mock data, role impersonation)
- Responsive polish pass on all pages

**Specs:**
- `docs/specs/consumption-endpoint-simulation.md`
- `docs/specs/cross-role-approval-flows.md`
- `docs/specs/notification-system.md`

**AC themes:**
- Simulator shows pass/fail per validation step with correct error codes
- Cross-role flow works end-to-end in the UI
- Notifications appear on approval events
- All pages pass responsive checks at 320px, 375px, 768px, 1024px, 1440px
- Design system consistency across all pages

---

## Spec Files Summary (26 total)

| Phase | Spec File | FR |
|-------|-----------|-----|
| 0 | foundation-routing-layouts.md | Infra |
| 1 | auth-login.md | FR1 |
| 1 | auth-registration.md | FR1 |
| 1 | auth-role-switching.md | FR1 |
| 2 | marketplace-catalog.md | FR3-CONS-02 |
| 2 | marketplace-service-detail.md | FR3-CONS-02 |
| 2 | marketplace-access-request.md | FR3-CONS-02 |
| 3 | consumer-dashboard-overview.md | FR3 |
| 3 | consumer-api-key-management.md | FR3-CONS-01 |
| 3 | consumer-usage-dashboard.md | FR3-CONS-03 |
| 3 | consumer-docker-images.md | FR3-CONS-05 |
| 3 | consumer-projects-teams.md | FR3-CONS-04 |
| 4 | merchant-dashboard-overview.md | FR2 |
| 4 | merchant-service-configuration.md | FR2-MERCH-01 |
| 4 | merchant-docker-image-management.md | FR2-MERCH-02 |
| 4 | merchant-consumption-endpoint.md | FR2-MERCH-03 |
| 4 | merchant-invoicing.md | FR2-MERCH-04 |
| 4 | merchant-consumer-management.md | FR2-MERCH-05 |
| 5 | admin-dashboard-overview.md | FR4 |
| 5 | admin-merchant-management.md | FR4-ADMIN-01 |
| 5 | admin-consumer-management.md | FR4-ADMIN-02 |
| 5 | admin-service-approval.md | FR4-ADMIN-01 |
| 5 | admin-governance.md | FR4 |
| 6 | consumption-endpoint-simulation.md | FR2-MERCH-03 |
| 6 | cross-role-approval-flows.md | Cross-cutting |
| 6 | notification-system.md | Cross-cutting |

## shadcn/ui Components (cumulative install order)

**Phase 0:** button, card, sidebar, avatar, dropdown-menu, badge, skeleton, alert-dialog, sonner, separator, breadcrumb, tooltip, sheet

**Phase 1:** input, label, tabs

**Phase 2:** select, dialog, scroll-area

**Phase 3:** table, switch, textarea, popover, calendar, chart, progress, collapsible, accordion

**Phase 4:** radio-group, checkbox, hover-card

## Verification (per phase)

1. `npm run typecheck` — no TypeScript errors
2. `npm run lint` — no ESLint warnings
3. `npm run test` — all tests pass
4. `npm run build` — production build succeeds
5. Manual check at 320px, 375px, 768px, 1024px, 1440px
6. Visual check: design tokens applied (Deep Blue text, Ice White bg, Brand Blue CTAs)

## Execution Process (per phase)

1. **Write specs** (all specs for the phase at once) → **STOP & WAIT** for user approval
2. **Plan tests** from approved specs
3. **Implement** via TDD (Red → Green → Blue) per acceptance criterion
4. **Run quality gates** (5 prototype gates: code quality, functionality, mobile responsive, UX consistency, documentation)
5. **Present** completed work → **STOP & WAIT** for approval → generate feature docs
