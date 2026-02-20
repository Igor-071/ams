# Specification: Merchant Dashboard — Consumption Endpoint Documentation

**Author:** Alex Chen (Tech Lead)
**Date:** 2026-02-20
**Status:** Draft

---

## 1. Overview

### 1.1 Summary

The consumption endpoint documentation is displayed on the merchant service detail page (covered by AC-075 in `merchant-service-management.md`). This spec adds the validation chain visualization as a standalone component showing the full request lifecycle.

### 1.2 Goals

- Validation chain visualization as pipeline steps
- Error code documentation display
- Request/response contract display

### 1.3 Non-Goals

- Live endpoint testing
- Request builder / playground
- SDK generation

---

## 2. Acceptance Criteria

### AC-084: Validation chain shows pipeline steps

GIVEN a merchant is viewing an API-type service detail
WHEN the consumption endpoint section renders
THEN a validation chain is displayed as sequential steps:
  1. API Key Validation (401 if missing/invalid)
  2. TTL Check (403 if expired)
  3. Service Authorization (403 if no access)
  4. Merchant Config (502 if misconfigured)
  5. Rate Limit (429 if exceeded)
  AND each step shows its error code on failure

---

### AC-085: Error codes table displays all response codes

GIVEN the consumption endpoint documentation is displayed
WHEN the merchant views the error codes section
THEN a table shows all possible response codes:
  - 200: Success
  - 401: Missing or invalid API key
  - 403: Expired, revoked, or unauthorized key
  - 429: Rate limit exceeded
  - 502: Merchant service misconfigured

---

## 3. Traceability Matrix

| Criterion | Test File | Test Name | Status |
|-----------|-----------|-----------|--------|
| AC-084 | | | ⏳ |
| AC-085 | | | ⏳ |

**Status:** ⏳ Pending | ✅ Passed | ❌ Failed

---

## 4. Technical Design

### 4.1 Components/Files

| File | Action | Description |
|------|--------|-------------|
| `src/features/merchant/components/validation-chain.tsx` | Create | Pipeline step visualization |
| `src/features/merchant/components/error-codes-table.tsx` | Create | Error codes documentation |

---

## 5. Dependencies

- Phase 0 (shared components)
- merchant-service-management.md (AC-075 — parent service detail page)
