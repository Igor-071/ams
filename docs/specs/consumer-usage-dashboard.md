# Specification: Consumer Dashboard — Usage Dashboard

**Author:** Alex Chen (Tech Lead)
**Date:** 2026-02-20
**Status:** Draft

---

## 1. Overview

### 1.1 Summary

Implement the consumer usage dashboard (`/dashboard/usage`) showing daily request charts, cost breakdown by service, per-key usage, and aggregate statistics. Uses mock daily usage data visualized as simple bar/stat displays (no external chart library required for prototype).

### 1.2 Goals

- Daily usage statistics display
- Cost breakdown by service
- Usage summary stats (total requests, cost, avg response time, error rate)

### 1.3 Non-Goals

- Interactive charts with zoom/pan (prototype uses simple stat displays)
- Date range picker (show all mock data)
- CSV/PDF export

---

## 2. Acceptance Criteria

### AC-059: Usage page renders with summary stats

GIVEN a consumer navigates to `/dashboard/usage`
WHEN the page loads
THEN the page displays summary stat cards:
  - Total Requests
  - Total Cost
  - Avg Response Time
  - Error Rate

---

### AC-060: Daily usage table displays data

GIVEN the usage page is loaded
WHEN daily usage data exists
THEN a table shows each day with: date, request count, cost, error count
  AND data is sorted by date (most recent first)

---

### AC-061: Usage by service breakdown

GIVEN the usage page is loaded
WHEN usage records exist for multiple services
THEN a "By Service" section shows per-service aggregates:
  - Service name, request count, total cost

---

## 3. Traceability Matrix

| Criterion | Test File | Test Name | Status |
|-----------|-----------|-----------|--------|
| AC-059 | | | ⏳ |
| AC-060 | | | ⏳ |
| AC-061 | | | ⏳ |

**Status:** ⏳ Pending | ✅ Passed | ❌ Failed

---

## 4. Technical Design

### 4.1 Components/Files

| File | Action | Description |
|------|--------|-------------|
| `src/features/consumer/pages/usage-page.tsx` | Create | Usage dashboard |
| `src/features/consumer/components/usage-stats.tsx` | Create | Summary stat cards |
| `src/features/consumer/components/daily-usage-table.tsx` | Create | Daily usage table |
| `src/features/consumer/components/usage-by-service.tsx` | Create | Per-service breakdown |

---

## 5. Dependencies

- Phase 0 (stat card, shared components)
- Mock usage data
