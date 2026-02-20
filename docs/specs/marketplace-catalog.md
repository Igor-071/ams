# Specification: Public Marketplace — Service Catalog

**Author:** Alex Chen (Tech Lead)
**Date:** 2026-02-20
**Status:** Implemented

---

## 1. Overview

### 1.1 Summary

Implement the public marketplace catalog page (`/marketplace`) displaying all active services in a responsive card grid. The catalog is browsable without authentication and includes real-time search and service type filtering. Each card links to the service detail page.

### 1.2 Goals

- Public-facing service catalog (no auth required)
- Responsive card grid with service cards
- Search by name, description, or merchant name (debounced 300ms)
- Filter by service type (All / API / Docker)
- Only show active services (hide draft, pending, suspended, rejected)

### 1.3 Non-Goals

- Pagination (catalog will show all active services — small dataset for prototype)
- Category filter (future enhancement)
- Sort options (future enhancement)
- Favoriting or bookmarking services

### 1.4 User Stories

**US-1:** As a visitor, I want to browse available services without logging in so that I can discover what the platform offers.

**US-2:** As a visitor, I want to search and filter services so that I can quickly find relevant APIs or Docker images.

---

## 2. Acceptance Criteria

### AC-028: Marketplace catalog page renders without authentication

GIVEN any user (authenticated or not) navigates to `/marketplace`
WHEN the page loads
THEN the page displays a heading "Marketplace"
  AND a search input with placeholder "Search services..."
  AND a type filter (All / API / Docker)
  AND a grid of service cards

---

### AC-029: Service cards display key information

GIVEN the marketplace catalog is loaded
WHEN service cards render
THEN each card shows:
  - Service name
  - Merchant name
  - Service type badge (API or Docker)
  - Category label
  - Truncated description (max ~2 lines)
  - Pricing summary (e.g. "Free", "$0.001/req", "Tiered", "Flat rate")
  AND the card is clickable, navigating to `/marketplace/:serviceId`

---

### AC-030: Only active services are displayed

GIVEN the marketplace catalog is loaded
WHEN service cards render
THEN only services with `status: 'active'` are shown
  AND services with status draft, pending_approval, rejected, or suspended are NOT shown

---

### AC-031: Search filters services in real-time

GIVEN the user is on the marketplace catalog
WHEN the user types a search query into the search input
THEN the service grid filters after a 300ms debounce
  AND matching is case-insensitive against service name, description, and merchant name

---

### AC-032: Type filter narrows services by type

GIVEN the user is on the marketplace catalog
WHEN the user selects "API" from the type filter
THEN only services with `type: 'api'` are shown
  AND when the user selects "Docker"
THEN only services with `type: 'docker'` are shown
  AND when the user selects "All"
THEN all active services are shown

---

### AC-033: Responsive grid layout

GIVEN the marketplace catalog is loaded
WHEN viewed at different viewport widths
THEN the service grid displays:
  - 1 column at 320px (mobile)
  - 2 columns at 768px (tablet)
  - 3 columns at 1024px (desktop)
  - 4 columns at 1440px (large desktop)

---

### AC-034: Empty state when no services match

GIVEN the user has applied search or filter
WHEN no services match the criteria
THEN an empty state is shown with a message like "No services found"
  AND a suggestion to clear filters

---

### AC-035: Clicking a service card navigates to detail page

GIVEN the marketplace catalog is loaded
WHEN the user clicks on a service card
THEN the user is navigated to `/marketplace/:serviceId`

---

## 3. Traceability Matrix

| Criterion | Test File | Test Name | Status |
|-----------|-----------|-----------|--------|
| AC-028 | catalog.test.tsx | renders heading, search input, type filter, and service cards | ✅ |
| AC-029 | catalog.test.tsx | displays service name, merchant, type badge, category, and pricing | ✅ |
| AC-030 | catalog.test.tsx | does not show draft, pending, suspended, or rejected services | ✅ |
| AC-031 | catalog.test.tsx | filters services by search query + filters by merchant name | ✅ |
| AC-032 | catalog.test.tsx | filters services by type when selecting API / Docker | ✅ |
| AC-033 | (responsive) | grid classes: grid-cols-1 md:2 lg:3 xl:4 | ✅ |
| AC-034 | catalog.test.tsx | shows empty state + clears filters | ✅ |
| AC-035 | catalog.test.tsx | navigates to service detail when clicking a card | ✅ |

**Status:** ⏳ Pending | ✅ Passed | ❌ Failed

---

## 4. Technical Design

### 4.1 Components/Files to Create or Modify

| File | Action | Description |
|------|--------|-------------|
| `src/features/marketplace/pages/catalog-page.tsx` | Create | Marketplace catalog page |
| `src/features/marketplace/components/service-card.tsx` | Create | Service card for grid display |
| `src/features/marketplace/components/service-grid.tsx` | Create | Responsive grid of service cards |
| `src/features/marketplace/components/service-filters.tsx` | Create | Search input + type filter bar |
| `src/components/shared/search-input.tsx` | Create | Debounced search input (shared) |
| `src/app/router.tsx` | Modify | Wire `/marketplace` to CatalogPage |

### 4.2 Data Model

Uses existing types — no new types needed.

```typescript
// Filter state (local to CatalogPage)
interface CatalogFilters {
  search: string
  type: 'all' | 'api' | 'docker'
}
```

### 4.3 Mock Data Access

```typescript
// Use existing getActiveServices() from handlers.ts
// Client-side filtering for search and type
```

### 4.4 State Management

- **Catalog filters**: Local `useState` for search and type — no Zustand store needed for prototype
- **Debounce**: Custom `useDebounce` hook or inline `setTimeout` for 300ms debounce

---

## 5. UI/UX Requirements

### 5.1 Layout

- Uses existing `PublicLayout` (header with logo + login link)
- Full-width container with max-w-7xl centering
- Filter bar above grid

### 5.2 Design System Compliance

- Service cards: `rounded-2xl border-white/[0.06] shadow-card` (Card component)
- Type badge: StatusBadge or custom badge (`bg-blue-500/15 text-blue-400` for API, `bg-purple-500/15 text-purple-400` for Docker)
- Search input: `rounded-lg` with search icon
- Type filter: segmented button group or Select dropdown
- Card hover: subtle border highlight or scale

### 5.3 Responsive

- Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- Search and filter stack vertically on mobile

---

## 6. Error Handling

| Error Scenario | User Message | Technical Handling |
|----------------|--------------|-------------------|
| No active services | "No services available yet" | Empty state component |
| No search results | "No services found" | Empty state with "Clear filters" action |

---

## 7. Dependencies

- Phase 0 foundation (public layout, shared components, mock data)
- shadcn: `select` (for type filter dropdown)
