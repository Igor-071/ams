# Specification: Merchant Dashboard — Overview

**Author:** Alex Chen (Tech Lead)
**Date:** 2026-02-20
**Status:** Draft

---

## 1. Overview

### 1.1 Summary

Implement the merchant dashboard overview page (`/merchant`) showing KPI stat cards (total services, active consumers, total usage, revenue) and recent activity. This is the landing page for authenticated merchants.

### 1.2 Goals

- KPI stat cards with aggregated data from mock data
- Recent activity feed (latest audit logs relevant to merchant)
- Quick action links to service management and invoicing

### 1.3 Non-Goals

- Real-time data updates
- Customizable dashboard widgets
- Revenue charts (simple stat cards for prototype)

---

## 2. Acceptance Criteria

### AC-067: Merchant dashboard renders with KPI stat cards

GIVEN a merchant is authenticated and navigates to `/merchant`
WHEN the page loads
THEN the page displays a heading "Dashboard"
  AND 4 stat cards showing: Total Services, Active Consumers, Total Requests, Revenue

---

### AC-068: KPI stat cards show correct aggregated values

GIVEN the merchant has mock data (services, invoices, usage)
WHEN the dashboard loads
THEN "Total Services" shows the count of services owned by this merchant
  AND "Active Consumers" shows the count of approved access requests for merchant's services
  AND "Total Requests" shows aggregated usage for merchant's services
  AND "Revenue" shows total invoice revenue formatted as currency

---

### AC-069: Quick action links navigate correctly

GIVEN the merchant is on the dashboard
WHEN the page renders
THEN links to "Services" and "Invoices" pages are visible
  AND clicking them navigates to the correct pages

---

## 3. Traceability Matrix

| Criterion | Test File | Test Name | Status |
|-----------|-----------|-----------|--------|
| AC-067 | | | ⏳ |
| AC-068 | | | ⏳ |
| AC-069 | | | ⏳ |

**Status:** ⏳ Pending | ✅ Passed | ❌ Failed

---

## 4. Technical Design

### 4.1 Components/Files

| File | Action | Description |
|------|--------|-------------|
| `src/features/merchant/pages/merchant-dashboard-page.tsx` | Create | Merchant dashboard overview |
| `src/app/router.tsx` | Modify | Wire `/merchant` to MerchantDashboardPage |

### 4.2 Data Access

```typescript
// Aggregate from existing mock data:
// - getServicesByMerchant(merchantId) → count services
// - getAccessRequests filtered by merchant's services → count approved
// - getUsageRecords filtered by merchant's services → sum requests
// - getInvoicesByMerchant(merchantId) → sum total revenue
```

---

## 5. Dependencies

- Phase 0 foundation (dashboard layout, shared components)
- Phase 1 authentication (auth guard, merchant role)
- Phase 3 shared components (stat-card)
