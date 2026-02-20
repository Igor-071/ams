# Specification: Public Marketplace — Service Detail

**Author:** Alex Chen (Tech Lead)
**Date:** 2026-02-20
**Status:** Implemented

---

## 1. Overview

### 1.1 Summary

Implement the service detail page (`/marketplace/:serviceId`) showing full service metadata, pricing breakdown, rate limits, documentation link, merchant info, and tags. Includes a "Request Access" button that gates on authentication.

### 1.2 Goals

- Full service detail view with all metadata
- Pricing display (free, per-request, tiered, flat)
- Request Access button with auth gating
- Back navigation to catalog

### 1.3 Non-Goals

- Inline API testing / playground
- Reviews or ratings
- Service version history

### 1.4 User Stories

**US-1:** As a visitor, I want to view full service details so that I can evaluate whether it fits my needs before requesting access.

---

## 2. Acceptance Criteria

### AC-036: Service detail page renders with full metadata

GIVEN a user navigates to `/marketplace/:serviceId` for an active service
WHEN the page loads
THEN the page displays:
  - Service name as heading
  - Full description
  - Service type badge (API or Docker)
  - Category
  - Merchant name
  - Tags as badges
  - A "Request Access" button

---

### AC-037: Pricing section displays correctly for all pricing types

GIVEN the service detail page is loaded
WHEN the service has pricing information
THEN the pricing section displays:
  - "Free" for `type: 'free'`
  - "$X.XXX per request" with free tier note for `type: 'per_request'`
  - Tiered table for `type: 'tiered'` (showing each tier's range and price)
  - "Flat rate" for `type: 'flat'`

---

### AC-038: Rate limit information is displayed

GIVEN the service detail page is loaded
WHEN the service has a `rateLimitPerMinute` value
THEN the rate limit is shown as "X requests/minute"
  AND if `rateLimitPerMinute` is 0, display "No rate limit" or "Unlimited"

---

### AC-039: Documentation link is shown when available

GIVEN the service detail page is loaded
  AND the service has a `documentationUrl`
WHEN the page renders
THEN a "View Documentation" link is displayed pointing to the URL
  AND if `documentationUrl` is not set, the link is not shown

---

### AC-040: Back navigation returns to catalog

GIVEN the user is on the service detail page
WHEN the user clicks a "Back to Marketplace" link or button
THEN the user is navigated to `/marketplace`

---

### AC-041: Non-existent service shows 404 state

GIVEN the user navigates to `/marketplace/invalid-id`
WHEN the service is not found in mock data
THEN a "Service not found" empty state is shown
  AND a link to return to the marketplace

---

---

## 3. Traceability Matrix

| Criterion | Test File | Test Name | Status |
|-----------|-----------|-----------|--------|
| AC-036 | service-detail.test.tsx | renders service name, description, type badge, merchant, and tags | ✅ |
| AC-037 | service-detail.test.tsx | displays per-request / tiered / flat pricing | ✅ |
| AC-038 | service-detail.test.tsx | displays rate limit information + unlimited | ✅ |
| AC-039 | service-detail.test.tsx | shows/hides documentation link | ✅ |
| AC-040 | service-detail.test.tsx | has back to marketplace link | ✅ |
| AC-041 | service-detail.test.tsx | shows not found for invalid ID + non-active service | ✅ |

**Status:** ⏳ Pending | ✅ Passed | ❌ Failed

---

## 4. Technical Design

### 4.1 Components/Files to Create or Modify

| File | Action | Description |
|------|--------|-------------|
| `src/features/marketplace/pages/service-detail-page.tsx` | Create | Service detail page |
| `src/features/marketplace/components/pricing-display.tsx` | Create | Renders pricing based on model type |
| `src/app/router.tsx` | Modify | Wire `/marketplace/:serviceId` to ServiceDetailPage |

### 4.2 Data Access

```typescript
// Use existing getServiceById() from handlers.ts
// Use getAccessRequestsByConsumer() to check existing request status
```

### 4.3 State Management

- No store needed — derive all from service data + auth store
- Access request status: check existing `mockAccessRequests` for current consumer

---

## 5. UI/UX Requirements

### 5.1 Layout

- Uses `PublicLayout`
- Two-column layout on desktop: main content (left) + sidebar with pricing/actions (right)
- Stack vertically on mobile

### 5.2 Design System Compliance

- Content card: `rounded-2xl border-white/[0.06] shadow-card`
- Tags: outline badges
- Pricing card: highlighted with brand accent
- "Request Access" button: primary variant (`rounded-full`)
- "Back to Marketplace": ghost variant with ArrowLeft icon

### 5.3 Responsive

- Two columns at lg+ → single column below
- Full-width on mobile

---

## 6. Error Handling

| Error Scenario | User Message | Technical Handling |
|----------------|--------------|-------------------|
| Service not found | "Service not found" | Empty state with back link |
| Non-active service accessed | "Service not found" | Treat non-active as not found for public |

---

## 7. Dependencies

- Phase 0 foundation (public layout, shared components)
- Phase 2 marketplace catalog (service card, navigation)
