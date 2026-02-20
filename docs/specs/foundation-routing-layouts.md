# Specification: Foundation — Routing, Layouts & Shared Components

**Author:** Alex Chen (Tech Lead)
**Date:** 2026-02-20
**Status:** Implemented

---

## 1. Overview

### 1.1 Summary
Establish the application skeleton for AMS: React Router v7 routing, layout hierarchy (Root, Public, Auth, Dashboard), shared UI components, TypeScript type definitions, mock data layer with Zustand + localStorage persistence, and the auth store. This is the foundational infrastructure that all feature phases build upon. No user-visible features — just the frame.

### 1.2 Goals
- Configure React Router v7 with all planned route stubs
- Build layout hierarchy: RootLayout → PublicLayout, AuthLayout, DashboardLayout
- Create reusable shared components (page-header, status-badge, empty-state, etc.)
- Define all TypeScript interfaces for the domain model
- Build mock data seed files and data access handlers
- Create auth store with Zustand persist middleware
- Create notification store for toasts
- Ensure responsive layouts at 320px, 375px, 768px, 1024px, 1440px
- Apply Ahoy Tech design system tokens throughout

### 1.3 Non-Goals
- No authentication UI (Phase 1)
- No marketplace pages (Phase 2)
- No dashboard content pages (Phase 3-5)
- No real API calls or backend integration
- No dark mode

### 1.4 User Stories
As a **developer**, I want a well-structured application skeleton with routing, layouts, and shared components, so that I can build feature pages quickly on a solid foundation.

As a **user**, I want to see the correct layout for each section of the app (public, auth, dashboard), so that my experience is consistent and navigable.

---

## 2. Acceptance Criteria

### AC-001: Route rendering — public routes use PublicLayout

GIVEN the application is loaded
WHEN a user navigates to `/marketplace`
THEN the PublicLayout is rendered (header with logo + login link, no sidebar)
  AND the route content area displays a placeholder

---

### AC-002: Route rendering — auth routes use AuthLayout

GIVEN the application is loaded
WHEN a user navigates to `/login`
THEN the AuthLayout is rendered (centered card layout)
  AND the route content area displays a placeholder

---

### AC-003: Route rendering — dashboard routes use DashboardLayout

GIVEN the user is authenticated with role "consumer"
WHEN they navigate to `/dashboard`
THEN the DashboardLayout is rendered (sidebar + topbar + content area)
  AND the sidebar shows consumer navigation items

---

### AC-004: DashboardLayout sidebar shows role-specific navigation

GIVEN the user is authenticated
WHEN the DashboardLayout renders
THEN the sidebar displays navigation items matching the user's current role:
  - Consumer: Dashboard, API Keys, Usage, Services, Images, Projects
  - Merchant: Dashboard, Services, Consumers, Invoices, Images
  - Admin: Dashboard, Merchants, Consumers, Services, Governance

---

### AC-005: DashboardLayout sidebar collapses on mobile

GIVEN the viewport width is below 768px
WHEN the DashboardLayout renders
THEN the sidebar is hidden by default
  AND a hamburger/menu button is visible in the topbar
  AND tapping the menu button opens the sidebar as a sheet overlay

---

### AC-006: DashboardLayout sidebar is expanded on desktop

GIVEN the viewport width is 1024px or above
WHEN the DashboardLayout renders
THEN the sidebar is visible and expanded
  AND the content area is offset to the right of the sidebar

---

### AC-007: RoleGuard prevents unauthorized content rendering

GIVEN a RoleGuard component wrapping content requiring role "admin"
WHEN a user with role "consumer" attempts to view that content
THEN the guarded content is NOT rendered
  AND a fallback (redirect or empty) is shown instead

---

### AC-008: Auth store persists to localStorage and rehydrates

GIVEN a user is logged in (auth store has a currentUser)
WHEN the page is reloaded
THEN the auth store rehydrates from localStorage
  AND the user remains logged in with their role intact

---

### AC-009: Auth store logout clears persisted state

GIVEN a user is logged in
WHEN they call the logout action on the auth store
THEN the currentUser is set to null
  AND localStorage auth data is cleared

---

### AC-010: 404 page for unknown routes

GIVEN the application is loaded
WHEN a user navigates to an undefined route (e.g., `/nonexistent`)
THEN a 404 "Page Not Found" page is displayed
  AND the page includes a link to navigate back to home

---

### AC-011: Root redirect based on auth state

GIVEN the application is loaded
WHEN a user navigates to `/`
THEN if unauthenticated, they are redirected to `/marketplace`
  AND if authenticated as consumer, they are redirected to `/dashboard`
  AND if authenticated as merchant, they are redirected to `/merchant`
  AND if authenticated as admin, they are redirected to `/admin`

---

### AC-012: Design tokens applied correctly

GIVEN any page in the application renders
THEN the background color is Ice White (#F3F5FF)
  AND text color is Deep Blue (#333E63)
  AND primary action buttons use Brand Blue (#0066FF) background
  AND headings use font-family "Lexend Deca"
  AND body text uses font-family "Inter"

---

### AC-013: Responsive layouts at all breakpoints

GIVEN any layout renders
WHEN the viewport is at 320px, 375px, 768px, 1024px, or 1440px
THEN no content overflows horizontally
  AND all interactive elements are accessible
  AND text is readable without horizontal scrolling

---

### AC-014: Shared component — PageHeader renders title and breadcrumbs

GIVEN a PageHeader component with title "API Keys" and breadcrumbs
WHEN it renders
THEN the title is displayed as an h1 with Lexend Deca font
  AND breadcrumbs show the navigation path
  AND an optional action slot renders a button if provided

---

### AC-015: Shared component — StatusBadge renders colored pill

GIVEN a StatusBadge with status "active"
WHEN it renders
THEN a colored badge is displayed with the status text
  AND the color corresponds to the status (active=green, pending=yellow, suspended=red, etc.)

---

### AC-016: Shared component — EmptyState renders placeholder

GIVEN an EmptyState component with title and description
WHEN it renders
THEN it displays an icon, title text, description text
  AND an optional CTA button if provided

---

### AC-017: Shared component — LoadingSkeleton renders placeholder animation

GIVEN a LoadingSkeleton component
WHEN it renders
THEN it displays animated pulse placeholder blocks
  AND it matches the shape variant specified (card, table-row, text)

---

### AC-018: Shared component — ConfirmDialog renders and handles actions

GIVEN a ConfirmDialog is triggered
WHEN it opens
THEN it displays a title, description, and confirm/cancel buttons
  AND clicking confirm calls the onConfirm callback
  AND clicking cancel closes the dialog without side effects

---

### AC-019: Mock data layer provides seed data through handlers

GIVEN the mock data layer is initialized
WHEN a handler function is called (e.g., getServices with filters)
THEN it returns typed mock data matching the filter criteria
  AND the response is wrapped in a simulated async delay (200-800ms)

---

### AC-020: Notification store manages toast notifications

GIVEN the notification store is available
WHEN an addNotification action is dispatched with a message
THEN a toast notification is queued
  AND toasts are rendered via the Sonner provider in RootLayout

---

### AC-021: Type definitions compile without errors

GIVEN all TypeScript type files exist in `src/types/`
WHEN `npm run typecheck` is executed
THEN there are zero type errors

---

### AC-022: Test utilities provide custom render with providers

GIVEN the test utility `renderWithProviders` is available
WHEN a component is rendered using it in a test
THEN the component is wrapped with all required providers (Router, Stores)
  AND the test can interact with routing and store state

---

### AC-023: Edge case — Auth store handles corrupted localStorage gracefully

GIVEN localStorage contains corrupted/invalid JSON for auth state
WHEN the application loads and Zustand attempts rehydration
THEN the auth store defaults to the unauthenticated state
  AND no runtime error is thrown

---

## 3. Traceability Matrix

| Criterion | Test File | Test Name | Status |
|-----------|-----------|-----------|--------|
| AC-001 | layout/__tests__/routing.test.tsx | renders PublicLayout for /marketplace | ✅ |
| AC-002 | layout/__tests__/routing.test.tsx | renders AuthLayout for /login | ✅ |
| AC-003 | layout/__tests__/routing.test.tsx | renders DashboardLayout for /dashboard when authenticated as consumer | ✅ |
| AC-004 | layout/__tests__/routing.test.tsx | shows consumer/merchant/admin nav items in sidebar | ✅ |
| AC-005 | — | Manual test (viewport-dependent) | ✅ |
| AC-006 | — | Manual test (viewport-dependent) | ✅ |
| AC-007 | shared/__tests__/role-guard.test.tsx | does not render children when user lacks allowed role | ✅ |
| AC-008 | stores/__tests__/auth-store.test.ts | logs in a user / switches role | ✅ |
| AC-009 | stores/__tests__/auth-store.test.ts | logs out a user | ✅ |
| AC-010 | layout/__tests__/routing.test.tsx | shows 404 page for unknown routes | ✅ |
| AC-011 | layout/__tests__/routing.test.tsx | redirects unauthenticated/consumer/admin from / | ✅ |
| AC-012 | — | Manual test (CSS tokens verified in index.css) | ✅ |
| AC-013 | — | Manual test (responsive layouts) | ✅ |
| AC-014 | shared/__tests__/page-header.test.tsx | renders title as h1 / breadcrumbs / action slot | ✅ |
| AC-015 | shared/__tests__/status-badge.test.tsx | renders with the status text / applies correct class | ✅ |
| AC-016 | shared/__tests__/empty-state.test.tsx | renders title / description / action button | ✅ |
| AC-017 | shared/__tests__/loading-skeleton.test.tsx | renders card/table-row/text variants | ✅ |
| AC-018 | shared/__tests__/confirm-dialog.test.tsx | renders title, calls onConfirm, calls onOpenChange on cancel | ✅ |
| AC-019 | mocks/__tests__/handlers.test.ts | 22 tests covering all data handlers | ✅ |
| AC-020 | stores/__tests__/notification-store.test.ts | adds/removes/marks/clears notifications | ✅ |
| AC-021 | — | npm run typecheck passes with 0 errors | ✅ |
| AC-022 | test/test-utils.tsx | renderWithProviders/renderWithRouter/createMockUser/resetStores | ✅ |
| AC-023 | stores/__tests__/auth-store.test.ts | handles corrupted localStorage gracefully | ✅ |

**Status:** ⏳ Pending | ✅ Passed | ❌ Failed

---

## 4. Technical Design

### 4.1 Components/Files to Create or Modify

| File | Action | Description |
|------|--------|-------------|
| `src/app/router.tsx` | Create | React Router v7 route configuration |
| `src/app/providers.tsx` | Create | All providers wrapper (Router, Toaster) |
| `src/components/layout/root-layout.tsx` | Create | Error boundary, providers, toasts |
| `src/components/layout/public-layout.tsx` | Create | Header with logo + login link |
| `src/components/layout/auth-layout.tsx` | Create | Centered card layout |
| `src/components/layout/dashboard-layout.tsx` | Create | Sidebar + topbar + content |
| `src/components/shared/page-header.tsx` | Create | Title + breadcrumbs + action slot |
| `src/components/shared/status-badge.tsx` | Create | Colored status pill |
| `src/components/shared/empty-state.tsx` | Create | Empty state placeholder |
| `src/components/shared/loading-skeleton.tsx` | Create | Skeleton loader variants |
| `src/components/shared/confirm-dialog.tsx` | Create | AlertDialog wrapper |
| `src/components/shared/role-guard.tsx` | Create | Render children by role |
| `src/components/shared/tbd-badge.tsx` | Create | "TBD" indicator badge |
| `src/types/user.ts` | Create | User, Role interfaces |
| `src/types/service.ts` | Create | Service, ServiceType interfaces |
| `src/types/api-key.ts` | Create | ApiKey interfaces |
| `src/types/usage.ts` | Create | UsageRecord, UsageStats interfaces |
| `src/types/invoice.ts` | Create | Invoice, InvoiceLineItem interfaces |
| `src/types/project.ts` | Create | Project, Team interfaces |
| `src/types/audit.ts` | Create | AuditLog interfaces |
| `src/types/docker.ts` | Create | DockerImage interfaces |
| `src/types/consumption.ts` | Create | ConsumptionRequest/Response interfaces |
| `src/types/common.ts` | Create | PaginatedResponse, FilterParams, etc. |
| `src/mocks/data/users.ts` | Create | Seed user data |
| `src/mocks/data/services.ts` | Create | Seed service data |
| `src/mocks/data/api-keys.ts` | Create | Seed API key data |
| `src/mocks/data/usage.ts` | Create | Seed usage data |
| `src/mocks/data/invoices.ts` | Create | Seed invoice data |
| `src/mocks/data/audit-logs.ts` | Create | Seed audit log data |
| `src/mocks/handlers.ts` | Create | Mock data access functions |
| `src/mocks/delay.ts` | Create | Simulated network latency |
| `src/stores/auth-store.ts` | Create | Auth state with Zustand persist |
| `src/stores/notification-store.ts` | Create | Toast/notification state |
| `src/lib/constants.ts` | Create | Routes, roles, config constants |
| `src/lib/format.ts` | Create | Number/currency/date formatting |
| `src/hooks/use-mock-delay.ts` | Create | Hook for simulated loading |
| `src/hooks/use-debounce.ts` | Create | Debounce hook |
| `src/test/test-utils.tsx` | Create | Custom render with providers |
| `src/pages/not-found.tsx` | Create | 404 page |
| `src/main.tsx` | Modify | Replace App with Providers/Router |
| `src/App.tsx` | Delete | Replaced by router |

### 4.2 Data Model

```typescript
// src/types/user.ts
type Role = 'admin' | 'merchant' | 'consumer';

interface User {
  id: string;
  email: string;
  name: string;
  roles: Role[];
  activeRole: Role;
  status: 'active' | 'suspended' | 'blocked';
  avatarUrl?: string;
  createdAt: string;
}

// src/types/service.ts
type ServiceType = 'api' | 'docker';
type ServiceStatus = 'draft' | 'pending_approval' | 'active' | 'rejected' | 'suspended';

interface Service {
  id: string;
  merchantId: string;
  name: string;
  description: string;
  type: ServiceType;
  status: ServiceStatus;
  category: string;
  pricing: PricingModel;
  rateLimitPerMinute: number;
  createdAt: string;
  updatedAt: string;
}

// src/types/api-key.ts
type ApiKeyStatus = 'active' | 'expired' | 'revoked';

interface ApiKey {
  id: string;
  consumerId: string;
  name: string;
  keyPrefix: string;  // First 8 chars shown
  serviceIds: string[];
  status: ApiKeyStatus;
  ttlDays: number;
  expiresAt: string;
  createdAt: string;
}

// src/types/common.ts
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

### 4.3 API Endpoints
Not applicable — prototype mode with mock data handlers only.

### 4.4 State Management

**Auth Store (Zustand + persist)**
- `currentUser: User | null`
- `login(user: User): void`
- `logout(): void`
- `switchRole(role: Role): void`

**Notification Store (Zustand, no persist)**
- `notifications: Notification[]`
- `addNotification(n): void`
- `removeNotification(id): void`

---

## 5. UI/UX Requirements

### 5.1 Mobile (320px - 767px)
- Sidebar hidden, accessible via hamburger menu (Sheet overlay)
- Topbar shows logo, hamburger, user menu
- Content area full width with 16px padding
- Cards stack vertically

### 5.2 Tablet (768px - 1023px)
- Sidebar collapsed (icons only) or hidden with toggle
- Content area adapts to available width
- Cards may use 2-column grid

### 5.3 Desktop (1024px+)
- Sidebar fully expanded (240px)
- Content area offset by sidebar width
- Full navigation labels visible

### 5.4 Interactions
- Sidebar nav items: hover highlight, active state highlight
- Sidebar collapse/expand: animated transition
- Mobile sheet: slide-in from left

### 5.5 Accessibility
- All nav items keyboard navigable (Tab, Enter)
- Sidebar toggle accessible via keyboard
- Skip to content link in layouts
- ARIA labels on navigation regions

---

## 6. Error Handling

| Error Scenario | User Message | Technical Handling |
|----------------|--------------|-------------------|
| Corrupted localStorage | (Silent) Falls back to unauthenticated | Zustand onRehydrateStorage error catch, reset to default |
| Unknown route | "Page not found" | Catch-all route renders NotFound page |
| Component render error | "Something went wrong" | ErrorBoundary in RootLayout catches and displays fallback |

---

## 7. Performance Considerations
- Lazy load feature route pages (React.lazy + Suspense)
- Sidebar and layout components loaded eagerly (small, always needed)
- Mock delay kept short (200-800ms) to avoid sluggish feel
- No heavy dependencies in foundation — keep bundle minimal

---

## 8. Security Considerations
- RoleGuard prevents unauthorized UI rendering (defense in depth, not sole protection)
- Auth store does NOT store passwords or tokens (mock prototype)
- No sensitive data in localStorage beyond mock user object

---

## 9. Testing Strategy

### 9.1 Unit Tests
- Auth store: login, logout, switchRole, persistence, corrupted data
- Notification store: add, remove
- RoleGuard: renders/hides based on role
- StatusBadge: correct color per status
- EmptyState: renders title, description, CTA
- ConfirmDialog: open, confirm, cancel

### 9.2 Integration Tests
- Router: correct layout renders per route segment
- DashboardLayout: sidebar nav items match role
- Root redirect: correct destination per auth state

### 9.3 Manual Testing
- Responsive check at 320px, 375px, 768px, 1024px, 1440px
- Design token verification (colors, fonts, radius)
- Sidebar collapse/expand on mobile

---

## 10. Dependencies

### 10.1 New Dependencies
- `react-router` (v7) — client-side routing
- `zustand` — state management with persist middleware

### 10.2 shadcn/ui Components (Phase 0)
- button, card, sidebar, avatar, dropdown-menu, badge, skeleton, alert-dialog, sonner, separator, breadcrumb, tooltip, sheet

### 10.3 Feature Dependencies
- None — this is the foundation phase

---

## 11. Rollout Plan

- [ ] Implementation complete
- [ ] All tests passing
- [ ] Quality gates passed
- [ ] User testing approved
- [ ] Documentation generated
- [ ] Ready for commit

---

## 12. Open Questions

- None — all decisions locked per development plan

---

## Sign-off

| Role | Name | Date | Approved |
|------|------|------|----------|
| Product Owner | [User] | | [ ] |
| Tech Lead | Alex Chen | 2026-02-20 | [x] |
| Quality Lead | Dr. Priya Patel | | [ ] |
