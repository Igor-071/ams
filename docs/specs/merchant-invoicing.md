# Specification: Merchant Dashboard — Invoicing

**Author:** Alex Chen (Tech Lead)
**Date:** 2026-02-20
**Status:** Draft

---

## 1. Overview

### 1.1 Summary

Implement the merchant invoicing pages: invoice list with status filtering, and invoice detail with line items showing per-service usage charges, AMS commission deduction, and TBD payment section.

### 1.2 Goals

- Invoice list page with filterable table
- Invoice detail page with line items, commission breakdown
- TBD badge on payment section (payment collection not yet implemented)

### 1.3 Non-Goals

- Payment processing
- Invoice generation (invoices are pre-existing in mock data)
- PDF export

---

## 2. Acceptance Criteria

### AC-079: Invoice list page shows merchant's invoices

GIVEN a merchant navigates to `/merchant/invoices`
WHEN the page loads
THEN a table displays all invoices for the current merchant
  AND each row shows: invoice period, consumer name, total amount, status badge
  AND clicking a row navigates to the invoice detail page

---

### AC-080: Invoice detail page shows line items and commission

GIVEN a merchant navigates to `/merchant/invoices/:invoiceId`
WHEN the page loads
THEN the page shows: invoice period, consumer name, status badge
  AND a "Line Items" table shows each service with: service name, request count, unit price, subtotal
  AND a summary section shows: subtotal, AMS commission (with rate), total (net of commission)

---

### AC-081: Payment section shows TBD badge

GIVEN the invoice detail page is loaded
WHEN the merchant views the payment section
THEN a "Payment" section shows a "TBD" badge
  AND a note states "Payment collection coming soon"

---

## 3. Traceability Matrix

| Criterion | Test File | Test Name | Status |
|-----------|-----------|-----------|--------|
| AC-079 | | | ⏳ |
| AC-080 | | | ⏳ |
| AC-081 | | | ⏳ |

**Status:** ⏳ Pending | ✅ Passed | ❌ Failed

---

## 4. Technical Design

### 4.1 Components/Files

| File | Action | Description |
|------|--------|-------------|
| `src/features/merchant/pages/merchant-invoices-page.tsx` | Create | Invoice list with table |
| `src/features/merchant/pages/merchant-invoice-detail-page.tsx` | Create | Invoice detail with line items |

---

## 5. Dependencies

- Phase 0 (shared components)
- Mock invoice data (already exists)
