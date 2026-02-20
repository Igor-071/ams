# Specification: Merchant Dashboard — Service Management

**Author:** Alex Chen (Tech Lead)
**Date:** 2026-02-20
**Status:** Draft

---

## 1. Overview

### 1.1 Summary

Implement the merchant service management pages: list all services with status/type filtering, create new service form (API or Docker type with metadata, pricing, configuration), and service detail/edit page with consumption endpoint documentation.

### 1.2 Goals

- Service list page with table showing name, type, status, category
- Create service form with type selection (API/Docker), metadata, pricing configuration
- Service detail page with full metadata and consumption endpoint docs
- Validation chain visualization (API key → TTL → authorization → config → rate limit)

### 1.3 Non-Goals

- Multi-step wizard with back/forward (single-page form for prototype)
- Live endpoint testing
- Service versioning

---

## 2. Acceptance Criteria

### AC-070: Service list page shows merchant's services

GIVEN a merchant navigates to `/merchant/services`
WHEN the page loads
THEN a table displays all services belonging to the current merchant
  AND each row shows: service name, type badge, status badge, category
  AND a "New Service" button is visible

---

### AC-071: Create service form with type selection

GIVEN a merchant navigates to `/merchant/services/new`
WHEN the page loads
THEN a form is displayed with fields:
  - Type selection (API or Docker)
  - Name (required)
  - Description (required)
  - Category (required)
  - Tags (optional)
  AND a "Submit for Approval" button

---

### AC-072: API-type service shows pricing and endpoint configuration

GIVEN a merchant selects "API" type on the new service form
WHEN the type is selected
THEN additional fields appear:
  - Pricing model (free, per_request, tiered, flat)
  - Rate limit per minute
  - Endpoint base URL
  - HTTP method

---

### AC-073: Docker-type service shows image configuration

GIVEN a merchant selects "Docker" type on the new service form
WHEN the type is selected
THEN additional fields appear:
  - License type
  AND pricing/rate-limit fields are hidden (Docker services use flat pricing)

---

### AC-074: Service creation submits with pending_approval status

GIVEN a merchant fills in valid service details and clicks "Submit for Approval"
WHEN the service is created
THEN the service is added to mock data with status `pending_approval`
  AND the merchant is redirected to the service detail page
  AND a success message is shown

---

### AC-075: Service detail page shows metadata and consumption endpoint docs

GIVEN a merchant navigates to `/merchant/services/:serviceId`
WHEN the page loads
THEN the page shows: service name, type, status, category, description, pricing
  AND for API-type services, a "Consumption Endpoint" section shows:
  - Endpoint URL: `POST /api/consume`
  - Required headers (X-API-Key)
  - Validation chain: API Key → TTL Check → Service Authorization → Merchant Config → Rate Limit
  - Error codes: 401, 403, 429, 502

---

## 3. Traceability Matrix

| Criterion | Test File | Test Name | Status |
|-----------|-----------|-----------|--------|
| AC-070 | | | ⏳ |
| AC-071 | | | ⏳ |
| AC-072 | | | ⏳ |
| AC-073 | | | ⏳ |
| AC-074 | | | ⏳ |
| AC-075 | | | ⏳ |

**Status:** ⏳ Pending | ✅ Passed | ❌ Failed

---

## 4. Technical Design

### 4.1 Components/Files

| File | Action | Description |
|------|--------|-------------|
| `src/features/merchant/pages/merchant-services-page.tsx` | Create | Service list with table |
| `src/features/merchant/pages/merchant-service-new-page.tsx` | Create | Create service form |
| `src/features/merchant/pages/merchant-service-detail-page.tsx` | Create | Service detail with endpoint docs |
| `src/features/merchant/components/consumption-endpoint-docs.tsx` | Create | Endpoint documentation display |
| `src/mocks/handlers.ts` | Modify | Add `createService()` handler |

### 4.2 Mock Handlers

```typescript
export function createService(data: {
  merchantId: string; merchantName: string;
  name: string; description: string; type: ServiceType;
  category: string; pricing: PricingModel;
  rateLimitPerMinute?: number; endpoint?: ServiceEndpointConfig;
  tags?: string[];
}): Service
```

---

## 5. Dependencies

- Phase 0 (shared components)
- Phase 2 (service data, pricing display)
- shadcn: `table` (already installed)
