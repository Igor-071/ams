# Specification: Merchant Dashboard — Consumer Management

**Author:** Alex Chen (Tech Lead)
**Date:** 2026-02-20
**Status:** Draft

---

## 1. Overview

### 1.1 Summary

Implement the merchant consumer management pages: view consumers using merchant's services grouped by API key (not consumer identity), per-service consumer lists, and ability to revoke consumer API keys with confirmation.

### 1.2 Goals

- Consumer list page showing usage by API key per service
- Per-service consumer view at `/merchant/services/:serviceId/consumers`
- Revoke consumer API key with confirmation dialog

### 1.3 Non-Goals

- Consumer identity visibility (merchants see API key usage only)
- Direct messaging to consumers
- Consumer account management

---

## 2. Acceptance Criteria

### AC-076: Merchant consumers page shows API key usage across services

GIVEN a merchant navigates to `/merchant/consumers`
WHEN the page loads
THEN the page displays a heading "Consumers"
  AND a table shows API key usage grouped by service
  AND each row shows: API key name, key prefix, service name, request count, status

---

### AC-077: Per-service consumer view shows API key usage

GIVEN a merchant navigates to `/merchant/services/:serviceId/consumers`
WHEN the page loads
THEN the page shows the service name
  AND a table lists all API keys authorized for this service
  AND each row shows: key name, key prefix, status, usage count
  AND a "Revoke" button is shown for active keys

---

### AC-078: Revoke consumer API key with confirmation

GIVEN a merchant is viewing per-service consumers
WHEN the merchant clicks "Revoke" on an active API key
THEN a confirmation dialog appears: "Revoke this API key?"
  AND when confirmed, the key status changes to `revoked` with `revokedBy: 'merchant'`
  AND the "Revoke" button is no longer shown for that key

---

## 3. Traceability Matrix

| Criterion | Test File | Test Name | Status |
|-----------|-----------|-----------|--------|
| AC-076 | | | ⏳ |
| AC-077 | | | ⏳ |
| AC-078 | | | ⏳ |

**Status:** ⏳ Pending | ✅ Passed | ❌ Failed

---

## 4. Technical Design

### 4.1 Components/Files

| File | Action | Description |
|------|--------|-------------|
| `src/features/merchant/pages/merchant-consumers-page.tsx` | Create | Consumers overview |
| `src/features/merchant/pages/merchant-service-consumers-page.tsx` | Create | Per-service consumer view |
| `src/mocks/handlers.ts` | Modify | Add `getApiKeysForService()` handler |

### 4.2 Mock Handlers

```typescript
export function getApiKeysForService(serviceId: string): ApiKey[]
// Returns all API keys that include serviceId in their serviceIds array
```

---

## 5. Dependencies

- Phase 0 (shared components)
- Phase 3 (API key data, revoke handler)
