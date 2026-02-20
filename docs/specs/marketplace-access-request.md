# Specification: Public Marketplace — Access Request Flow

**Author:** Alex Chen (Tech Lead)
**Date:** 2026-02-20
**Status:** Implemented

---

## 1. Overview

### 1.1 Summary

Implement the access request flow on the service detail page. Unauthenticated users are prompted to log in before requesting access. Authenticated consumers can submit a request, which creates a `pending` access request in the mock data. The button state reflects the current request status (none → pending → approved/denied).

### 1.2 Goals

- Auth-gated access request button on service detail page
- Create pending access request in mock data
- Reflect existing request status (pending, approved, denied)
- Confirm dialog before submitting request

### 1.3 Non-Goals

- Admin approval workflow (Phase 5)
- Request cancellation
- Request message or justification field
- Notification on request submission

### 1.4 User Stories

**US-1:** As a consumer, I want to request access to a service so that the admin can approve my access.

**US-2:** As an unauthenticated visitor, I want to be prompted to log in when I try to request access so that I understand I need an account.

---

## 2. Acceptance Criteria

### AC-042: Unauthenticated user sees login prompt on Request Access

GIVEN a user is NOT authenticated
  AND is viewing a service detail page
WHEN the user clicks "Request Access"
THEN a dialog appears explaining "Sign in to request access"
  AND provides a button to navigate to `/login`

---

### AC-043: Authenticated consumer can submit an access request

GIVEN a consumer is authenticated
  AND has NO existing access request for this service
  AND is viewing the service detail page
WHEN the user clicks "Request Access"
THEN a confirmation dialog appears: "Request access to {service name}?"
  AND when confirmed, a new access request is created with status `pending`
  AND the button updates to show "Pending Approval"

---

### AC-044: Already approved access shows granted status

GIVEN a consumer has an approved access request for a service
WHEN the consumer views that service's detail page
THEN the button area shows "Access Granted" (disabled, green accent)
  AND the "Request Access" button is NOT shown

---

### AC-045: Pending request shows pending status

GIVEN a consumer has a pending access request for a service
WHEN the consumer views that service's detail page
THEN the button area shows "Pending Approval" (disabled, amber accent)
  AND the "Request Access" button is NOT shown

---

### AC-046: Denied request allows re-request

GIVEN a consumer has a denied access request for a service
WHEN the consumer views that service's detail page
THEN the button shows "Request Access" again (allowing re-request)
  AND a note "Previous request was denied" is visible

---

### AC-047: Access request creates correct mock data

GIVEN a consumer submits an access request
WHEN the request is created
THEN the mock access request has:
  - `consumerId`: current user's ID
  - `consumerName`: current user's name
  - `serviceId`: the service's ID
  - `serviceName`: the service's name
  - `status`: 'pending'
  - `requestedAt`: current timestamp

---

## 3. Traceability Matrix

| Criterion | Test File | Test Name | Status |
|-----------|-----------|-----------|--------|
| AC-042 | access-request.test.tsx | shows login dialog when unauthenticated + navigates to login | ✅ |
| AC-043 | access-request.test.tsx | creates pending access request after confirmation | ✅ |
| AC-044 | access-request.test.tsx | shows Access Granted for approved request | ✅ |
| AC-045 | access-request.test.tsx | shows Pending Approval for pending request | ✅ |
| AC-046 | access-request.test.tsx | shows Request Access with denied note for denied request | ✅ |
| AC-047 | access-request.test.tsx | (covered by AC-043) verifies mock data fields | ✅ |

**Status:** ⏳ Pending | ✅ Passed | ❌ Failed

---

## 4. Technical Design

### 4.1 Components/Files to Create or Modify

| File | Action | Description |
|------|--------|-------------|
| `src/features/marketplace/components/access-request-button.tsx` | Create | Smart button reflecting request status |
| `src/mocks/handlers.ts` | Modify | Add `createAccessRequest()` and `getAccessRequestForService()` |
| `src/features/marketplace/pages/service-detail-page.tsx` | Modify | Integrate AccessRequestButton |

### 4.2 Mock Handlers

```typescript
// New handler functions
export function getAccessRequestForService(
  consumerId: string,
  serviceId: string,
): AccessRequest | undefined

export function createAccessRequest(data: {
  consumerId: string
  consumerName: string
  serviceId: string
  serviceName: string
}): AccessRequest
```

### 4.3 State Management

- **Auth store** (existing): read `currentUser` to determine auth status
- **Access request status**: derived from `getAccessRequestForService()`
- **Local state**: dialog open/close, loading indicator

---

## 5. UI/UX Requirements

### 5.1 Button States

| State | Label | Style | Clickable |
|-------|-------|-------|-----------|
| No auth | "Request Access" | primary | Yes → shows login dialog |
| No request | "Request Access" | primary | Yes → shows confirm dialog |
| Pending | "Pending Approval" | amber outline | No (disabled) |
| Approved | "Access Granted" | emerald outline | No (disabled) |
| Denied | "Request Access" | primary | Yes (re-request) |

### 5.2 Design System Compliance

- Dialogs: `bg-card rounded-2xl border-white/[0.06] shadow-card`
- Buttons: `rounded-full` pill shape
- Status indicators: use status badge color patterns

---

## 6. Error Handling

| Error Scenario | User Message | Technical Handling |
|----------------|--------------|-------------------|
| Not authenticated | "Sign in to request access" | Dialog with login link |
| Duplicate request | Show existing status | Check existing requests before creating |

---

## 7. Dependencies

- Phase 0 foundation (shared components, confirm dialog)
- Phase 1 authentication (auth store, login redirect)
- Phase 2 service detail page
- shadcn: `dialog` (for login prompt and confirmation)
