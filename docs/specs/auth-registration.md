# Specification: Authentication — Registration (Consumer + Merchant Invite)

**Author:** Alex Chen (Tech Lead)
**Date:** 2026-02-20
**Status:** Implemented

---

## 1. Overview

### 1.1 Summary

Implement consumer self-registration (`/register`) and invite-only merchant registration (`/register/merchant`). Consumer registration collects name, email, and organization. Merchant registration requires a valid invite code and collects company details. Both create new mock users and log them in immediately.

### 1.2 Goals

- Consumer self-registration form with validation
- Merchant invite-only registration with invite code validation
- Mock user creation (adds to in-memory store)
- Immediate login after successful registration

### 1.3 Non-Goals

- Email verification flow (mocked — skip verification)
- Real invite code generation by admin (use hardcoded valid codes)
- Profile editing after registration (future phase)

### 1.4 User Stories

**US-1:** As a new consumer, I want to register on AMS so that I can browse and request access to services.

**US-2:** As an invited merchant, I want to register using my invite code so that I can start publishing services.

---

## 2. Acceptance Criteria

### AC-011: Consumer registration page renders

GIVEN the user navigates to `/register`
  AND is NOT authenticated
WHEN the page loads
THEN a registration form is displayed with fields:
  - Full name (required)
  - Email (required)
  - Organization (optional)
  AND a "Create Account" button (disabled until required fields are valid)
  AND a link "Already have an account? Sign in" pointing to `/login`
  AND a link "Have a merchant invite? Register as merchant" pointing to `/register/merchant`

---

### AC-012: Consumer registration validates required fields

GIVEN the user is on `/register`
WHEN the user submits the form with an empty name or invalid email
THEN inline validation errors are shown
  AND the form is NOT submitted

---

### AC-013: Successful consumer registration creates user and logs in

GIVEN the user fills in valid name and email on `/register`
WHEN the user clicks "Create Account"
THEN a new mock user is created with role `['consumer']` and `activeRole: 'consumer'`
  AND the user is logged in via `authStore.login(newUser)`
  AND the user is redirected to `/dashboard` (consumer home)

---

### AC-014: Consumer registration with existing email shows error

GIVEN the user is on `/register`
WHEN the user enters an email that already exists in mock users
  AND clicks "Create Account"
THEN an error message is displayed: "An account with this email already exists"
  AND the user is NOT logged in

---

### AC-015: Merchant registration page renders with invite code field

GIVEN the user navigates to `/register/merchant`
  AND is NOT authenticated
WHEN the page loads
THEN a registration form is displayed with fields:
  - Invite code (required)
  - Full name (required)
  - Email (required)
  - Company name (required)
  - Company description (optional)
  - Website (optional)
  AND a "Register as Merchant" button (disabled until required fields valid)
  AND a link "Already have an account? Sign in" pointing to `/login`

---

### AC-016: Invalid invite code shows error

GIVEN the user is on `/register/merchant`
WHEN the user enters an invite code that does not match any unused mock invite code
  AND submits the form
THEN an error message is displayed: "Invalid or expired invite code"
  AND the form is NOT submitted

---

### AC-017: Valid invite code with valid fields registers merchant

GIVEN the user is on `/register/merchant`
  AND enters a valid unused invite code (e.g. "INV-NEW-2025")
  AND fills in name, email, and company name
WHEN the user clicks "Register as Merchant"
THEN a new mock user is created with role `['merchant']` and `activeRole: 'merchant'`
  AND a merchant profile is created with the company details
  AND the user is logged in via `authStore.login(newUser)`
  AND the user is redirected to `/merchant` (merchant home)

---

### AC-018: Invite code from URL query parameter is pre-filled

GIVEN the user navigates to `/register/merchant?code=INV-NEW-2025`
WHEN the page loads
THEN the invite code field is pre-filled with "INV-NEW-2025"
  AND the field is read-only (invite code from URL cannot be modified)

---

### AC-019: Authenticated user visiting registration pages is redirected

GIVEN the user is already authenticated
WHEN the user navigates to `/register` or `/register/merchant`
THEN the user is redirected to their role-specific dashboard

---

## 3. Traceability Matrix

| Criterion | Test File | Test Name | Status |
|-----------|-----------|-----------|--------|
| AC-011 | registration.test.tsx | renders registration form with name, email, organization, and CTA | ✅ |
| AC-012 | registration.test.tsx | keeps Create Account disabled when required fields are empty | ✅ |
| AC-013 | registration.test.tsx | creates consumer user and redirects to dashboard | ✅ |
| AC-014 | registration.test.tsx | shows error for duplicate email | ✅ |
| AC-015 | registration.test.tsx | renders merchant registration form with invite code and company fields | ✅ |
| AC-016 | registration.test.tsx | shows error for invalid invite code | ✅ |
| AC-017 | registration.test.tsx | creates merchant user with valid invite code | ✅ |
| AC-018 | registration.test.tsx | pre-fills invite code from URL query parameter | ✅ |
| AC-019 | registration.test.tsx | redirects authenticated user away from register | ✅ |

**Status:** ⏳ Pending | ✅ Passed | ❌ Failed

---

## 4. Technical Design

### 4.1 Components/Files to Create or Modify

| File | Action | Description |
|------|--------|-------------|
| `src/features/auth/pages/register-page.tsx` | Create | Consumer registration page |
| `src/features/auth/pages/merchant-register-page.tsx` | Create | Merchant invite registration page |
| `src/features/auth/components/register-form.tsx` | Create | Consumer registration form |
| `src/features/auth/components/merchant-register-form.tsx` | Create | Merchant registration form |
| `src/mocks/handlers.ts` | Modify | Add `createUser`, `createMerchantProfile`, `validateInviteCode` |
| `src/app/router.tsx` | Modify | Wire `/register` and `/register/merchant` |

### 4.2 Mock Invite Codes

```typescript
// Valid unused invite codes for testing
const VALID_INVITE_CODES = ['INV-NEW-2025', 'INV-TEST-2025', 'INV-DEMO-2025']
```

### 4.3 State Management

- **Auth store** (existing): `login(user)` after registration
- **Form state**: Local `useState` for field values, errors, loading
- **Mock handlers**: `createUser()` adds to in-memory array, `validateInviteCode()` checks list

---

## 5. UI/UX Requirements

### 5.1 Layout

- Uses existing `AuthLayout` (centered card)
- Card max-width: `max-w-md`

### 5.2 Design System Compliance

- Inputs: `rounded-lg`, label above each input
- Buttons: `rounded-full` pill shape
- "Create Account" / "Register as Merchant": primary variant
- Links: `text-primary` with hover underline
- Error messages: `text-destructive` inline below fields
- Optional fields marked with "(optional)" in label

---

## 6. Error Handling

| Error Scenario | User Message | Technical Handling |
|----------------|--------------|-------------------|
| Duplicate email | "An account with this email already exists" | Check mockUsers before creating |
| Invalid invite code | "Invalid or expired invite code" | Validate against invite code list |
| Missing required fields | Inline validation per field | HTML5 required + custom validation |

---

## 7. Dependencies

- Phase 0 foundation (auth store, mock data, auth layout)
- Auth Login spec (shares AuthLayout, auth store patterns)
