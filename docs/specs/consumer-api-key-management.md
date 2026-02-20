# Specification: Consumer Dashboard — API Key Management

**Author:** Alex Chen (Tech Lead)
**Date:** 2026-02-20
**Status:** Draft

---

## 1. Overview

### 1.1 Summary

Implement API key management for consumers: list all keys with status badges, generate new keys with service selection and TTL, view key details with masked value and copy-to-clipboard, and revoke keys with confirmation dialog.

### 1.2 Goals

- API key list page with filterable table
- Generate new API key form (name, description, services, TTL)
- Key detail page with masked value, copy button, usage stats
- Revoke key with confirmation dialog

### 1.3 Non-Goals

- Key rotation / renewal (future)
- Custom metadata editing (future)
- Key usage rate limiting configuration (merchant-side)

---

## 2. Acceptance Criteria

### AC-052: API keys list page shows consumer's keys

GIVEN a consumer navigates to `/dashboard/api-keys`
WHEN the page loads
THEN a table displays all API keys belonging to the current consumer
  AND each row shows: key name, key prefix, status badge, services count, expiry date
  AND a "Generate New Key" button is visible

---

### AC-053: API key status badges display correctly

GIVEN the API keys list is rendered
WHEN keys have different statuses
THEN active keys show a green "Active" badge
  AND expired keys show a gray "Expired" badge
  AND revoked keys show a red "Revoked" badge

---

### AC-054: Generate new API key form

GIVEN a consumer navigates to `/dashboard/api-keys/new`
WHEN the page loads
THEN a form is displayed with fields:
  - Name (required)
  - Description (optional)
  - Services (multi-select from approved services)
  - TTL in days (required, default 90)
  AND a "Generate Key" button

---

### AC-055: Successful key generation shows the key value once

GIVEN a consumer fills in valid key details and clicks "Generate Key"
WHEN the key is created
THEN a success screen shows the full API key value (visible once)
  AND a "Copy to Clipboard" button is available
  AND a warning message states the key won't be shown again
  AND the consumer can navigate to the key detail page

---

### AC-056: API key detail page shows masked key and metadata

GIVEN a consumer navigates to `/dashboard/api-keys/:keyId`
WHEN the page loads
THEN the page shows key name, description, status, creation date, expiry date
  AND the key value is masked (showing only prefix + `...`)
  AND the assigned services are listed
  AND a "Revoke Key" button is shown for active keys

---

### AC-057: Revoke key with confirmation dialog

GIVEN a consumer is viewing an active API key detail
WHEN the consumer clicks "Revoke Key"
THEN a confirmation dialog appears: "Revoke this API key?"
  AND when confirmed, the key status changes to `revoked`
  AND the "Revoke Key" button is no longer shown

---

### AC-058: Key list row click navigates to detail

GIVEN the consumer is on the API keys list page
WHEN the consumer clicks on a key row
THEN the consumer is navigated to `/dashboard/api-keys/:keyId`

---

## 3. Traceability Matrix

| Criterion | Test File | Test Name | Status |
|-----------|-----------|-----------|--------|
| AC-052 | | | ⏳ |
| AC-053 | | | ⏳ |
| AC-054 | | | ⏳ |
| AC-055 | | | ⏳ |
| AC-056 | | | ⏳ |
| AC-057 | | | ⏳ |
| AC-058 | | | ⏳ |

**Status:** ⏳ Pending | ✅ Passed | ❌ Failed

---

## 4. Technical Design

### 4.1 Components/Files

| File | Action | Description |
|------|--------|-------------|
| `src/features/consumer/pages/api-keys-page.tsx` | Create | Key list with table |
| `src/features/consumer/pages/api-key-new-page.tsx` | Create | Generate new key form |
| `src/features/consumer/pages/api-key-detail-page.tsx` | Create | Key detail with masked value |
| `src/features/consumer/components/api-key-table.tsx` | Create | Sortable key table |
| `src/components/shared/copy-button.tsx` | Create | Click-to-copy utility |
| `src/mocks/handlers.ts` | Modify | Add `createApiKey()`, `revokeApiKey()` |

### 4.2 Mock Handlers

```typescript
export function createApiKey(data: {
  consumerId: string; name: string; description?: string;
  serviceIds: string[]; ttlDays: number;
}): ApiKey

export function revokeApiKey(keyId: string): ApiKey | undefined
```

---

## 5. Dependencies

- Phase 0 (shared components, mock data)
- Phase 2 (service data for multi-select)
- shadcn: `table`, `switch`, `textarea`
