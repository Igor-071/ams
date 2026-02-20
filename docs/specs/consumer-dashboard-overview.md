# Specification: Consumer Dashboard — Overview

**Author:** Alex Chen (Tech Lead)
**Date:** 2026-02-20
**Status:** Draft

---

## 1. Overview

### 1.1 Summary

Implement the consumer dashboard overview page (`/dashboard`) showing KPI stat cards (active services, active API keys, total requests, total cost) and a recent activity list. This is the landing page for authenticated consumers.

### 1.2 Goals

- KPI stat cards with aggregated data from mock data
- Recent activity feed (latest usage records)
- Quick action links to key management and usage pages

### 1.3 Non-Goals

- Real-time data updates
- Customizable dashboard widgets
- Notifications panel (Phase 6)

---

## 2. Acceptance Criteria

### AC-048: Dashboard overview renders with KPI stat cards

GIVEN a consumer is authenticated and navigates to `/dashboard`
WHEN the page loads
THEN the page displays a heading "Dashboard"
  AND 4 stat cards showing: Active Services, Active API Keys, Total Requests, Total Cost

---

### AC-049: KPI stat cards show correct aggregated values

GIVEN the consumer has mock data (API keys, usage records)
WHEN the dashboard loads
THEN "Active Services" shows the count of services with approved access
  AND "Active API Keys" shows the count of keys with `status: 'active'`
  AND "Total Requests" shows the total usage record count for this consumer
  AND "Total Cost" shows the aggregated cost formatted as currency

---

### AC-050: Recent activity section displays latest usage

GIVEN the consumer has usage records
WHEN the dashboard loads
THEN a "Recent Activity" section shows the latest usage records
  AND each entry shows service name, timestamp, and status code
  AND the list is limited to the most recent 5 entries

---

### AC-051: Quick action links navigate correctly

GIVEN the consumer is on the dashboard
WHEN the page renders
THEN links to "API Keys" and "Usage" pages are visible
  AND clicking them navigates to the correct pages

---

## 3. Traceability Matrix

| Criterion | Test File | Test Name | Status |
|-----------|-----------|-----------|--------|
| AC-048 | | | ⏳ |
| AC-049 | | | ⏳ |
| AC-050 | | | ⏳ |
| AC-051 | | | ⏳ |

**Status:** ⏳ Pending | ✅ Passed | ❌ Failed

---

## 4. Technical Design

### 4.1 Components/Files

| File | Action | Description |
|------|--------|-------------|
| `src/features/consumer/pages/dashboard-page.tsx` | Create | Consumer dashboard overview |
| `src/components/shared/stat-card.tsx` | Create | Reusable KPI stat card |
| `src/app/router.tsx` | Modify | Wire `/dashboard` to DashboardPage |

### 4.2 Data Access

```typescript
// Aggregate from existing mock data:
// - getAccessRequestsByConsumer() → count approved
// - getApiKeysByConsumer() → count active
// - getUsageRecords({ consumerId }) → sum requests, compute cost
```

---

## 5. Dependencies

- Phase 0 foundation (dashboard layout, shared components)
- Phase 1 authentication (auth guard, consumer role)
