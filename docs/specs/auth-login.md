# Specification: Authentication — Login (Email OTP + Google SSO)

**Author:** Alex Chen (Tech Lead)
**Date:** 2026-02-20
**Status:** Implemented

---

## 1. Overview

### 1.1 Summary

Implement the `/login` page with a mocked email-based OTP flow and a mocked Google SSO button. On successful authentication, the user is redirected to their role-specific dashboard. Includes a dev-only role selector for rapid prototyping. Unauthenticated users are redirected to `/login` when accessing protected routes.

### 1.2 Goals

- Provide a login UI matching the Ahoy Tech dark design system
- Mock OTP flow: email input → OTP input → authenticated
- Mock SSO button: single click → authenticated
- Dev panel for instant login as any mock user
- Redirect unauthenticated users to `/login`

### 1.3 Non-Goals

- Real email delivery or OTP validation (all mocked)
- Real Google OAuth integration (mocked)
- Password-based authentication (OTP-only per TRD)
- Session expiry / token refresh

### 1.4 User Stories

**US-1:** As a returning user, I want to sign in with my email and an OTP so that I can access my dashboard.

**US-2:** As a returning user, I want to sign in with Google SSO so that I can quickly access my account.

**US-3:** As a developer, I want to instantly log in as any mock user so that I can test different roles without completing the login flow.

---

## 2. Acceptance Criteria

### AC-001: Login page renders with email input and SSO button

GIVEN the user navigates to `/login`
  AND the user is NOT authenticated
WHEN the page loads
THEN the page displays the AMS logo and subtitle
  AND an email input field with placeholder "Enter your email"
  AND a "Continue" button (disabled until email is valid)
  AND a "Sign in with Google" SSO button
  AND a link to "/register" with text "Don't have an account? Register"
  AND a dev panel section at the bottom with role selector buttons

---

### AC-002: Email validation enables Continue button

GIVEN the user is on the `/login` page
WHEN the user enters a valid email address
THEN the "Continue" button becomes enabled
  AND when the user enters an invalid email (no @, empty)
THEN the "Continue" button remains disabled

---

### AC-003: Continue button advances to OTP step

GIVEN the user has entered a valid email on `/login`
WHEN the user clicks "Continue"
THEN the email input is replaced by an OTP input (6-digit code)
  AND a message "We sent a code to {email}" is displayed
  AND a "Verify" button is shown (disabled until 6 digits entered)
  AND a "Back" link allows returning to the email step

---

### AC-004: Valid OTP authenticates and redirects to role dashboard

GIVEN the user is on the OTP step with a valid email
WHEN the user enters any 6-digit OTP code
  AND clicks "Verify"
THEN the mock auth flow finds the matching user by email
  AND calls `authStore.login(user)` to set the authenticated user
  AND redirects to the user's role-specific dashboard (ROLE_HOME[activeRole])

---

### AC-005: OTP for unknown email shows error

GIVEN the user is on the OTP step
  AND the entered email does not match any mock user
WHEN the user enters a 6-digit OTP and clicks "Verify"
THEN an error message is displayed: "No account found for this email"
  AND the user remains on the OTP step

---

### AC-006: Google SSO mock flow authenticates

GIVEN the user is on `/login`
WHEN the user clicks "Sign in with Google"
THEN a brief loading state is shown (simulated delay)
  AND the first active mock user is logged in (or a default consumer)
  AND the user is redirected to their role-specific dashboard

---

### AC-007: Dev panel instant login

GIVEN the user is on `/login`
  AND a dev panel is visible at the bottom of the page
WHEN the user clicks one of the dev panel buttons (e.g. "Admin", "Merchant", "Consumer", "Dual Role")
THEN the corresponding mock user is immediately logged in
  AND the user is redirected to the appropriate role dashboard

---

### AC-008: Authenticated user visiting /login is redirected

GIVEN the user is already authenticated
WHEN the user navigates to `/login`
THEN the user is redirected to their role-specific dashboard (ROLE_HOME[activeRole])

---

### AC-009: Unauthenticated user accessing protected route is redirected to /login

GIVEN the user is NOT authenticated
WHEN the user navigates to a protected route (e.g. `/dashboard`, `/merchant`, `/admin`)
THEN the user is redirected to `/login`

---

### AC-010: Logout clears auth state and redirects to /login

GIVEN the user is authenticated
WHEN the user clicks the logout button (in sidebar footer)
THEN `authStore.logout()` clears the user
  AND the user is redirected to `/login`
  AND localStorage `ams-auth` is cleared

---

## 3. Traceability Matrix

| Criterion | Test File | Test Name | Status |
|-----------|-----------|-----------|--------|
| AC-001 | login.test.tsx | renders email input, continue button, SSO button, register link, and dev panel | ✅ |
| AC-002 | login.test.tsx | keeps Continue disabled for invalid email and enables for valid | ✅ |
| AC-003 | login.test.tsx | transitions to OTP step showing code-sent message | ✅ |
| AC-004 | login.test.tsx | authenticates with valid OTP and redirects to role dashboard | ✅ |
| AC-005 | login.test.tsx | shows error for unknown email | ✅ |
| AC-006 | login.test.tsx | authenticates via SSO button | ✅ |
| AC-007 | login.test.tsx | logs in instantly via dev panel buttons | ✅ |
| AC-008 | login.test.tsx | redirects authenticated user away from login page | ✅ |
| AC-009 | role-switching.test.tsx | redirects unauthenticated user to /login | ✅ |
| AC-010 | login.test.tsx | logout clears auth state | ✅ |

**Status:** ⏳ Pending | ✅ Passed | ❌ Failed

---

## 4. Technical Design

### 4.1 Components/Files to Create or Modify

| File | Action | Description |
|------|--------|-------------|
| `src/features/auth/pages/login-page.tsx` | Create | Login page with OTP flow + SSO + dev panel |
| `src/features/auth/components/login-form.tsx` | Create | Email → OTP step form |
| `src/features/auth/components/sso-button.tsx` | Create | Google SSO mock button |
| `src/features/auth/components/dev-login-panel.tsx` | Create | Dev panel with instant-login buttons |
| `src/features/auth/components/otp-input.tsx` | Create | 6-digit OTP input component |
| `src/app/router.tsx` | Modify | Wire `/login` to LoginPage |

### 4.2 Data Model

Uses existing types — no new types needed.

```typescript
// OTP flow state (local to LoginForm, not a store)
type LoginStep = 'email' | 'otp'
```

### 4.3 Mock Auth Logic

```typescript
// Find user by email in mockUsers
// Any 6-digit code is considered valid
// SSO mock: pick first active consumer user after simulated delay
```

### 4.4 State Management

- **Auth store** (existing `useAuthStore`): `login(user)`, `logout()`, `currentUser`
- **Login form state**: Local `useState` for step, email, OTP, errors, loading
- No new Zustand store needed — OTP flow is ephemeral UI state

---

## 5. UI/UX Requirements

### 5.1 Layout

- Uses existing `AuthLayout` (centered card on dark background)
- AMS logo and subtitle shown above card (from AuthLayout)
- Card contains the login form

### 5.2 Design System Compliance

- Email input: `rounded-lg`, border-input styling
- Buttons: `rounded-full` pill shape per Ahoy design
- "Continue" / "Verify": primary variant (solid blue)
- "Sign in with Google": outline variant with Google icon
- Dev panel: secondary background, small text, outline buttons
- Error messages: `text-destructive` (red-400)

### 5.3 Responsive

- Card max-width: `max-w-md` (from AuthLayout)
- Stack vertically, full-width inputs
- Minimum touch target: 44px for buttons

---

## 6. Error Handling

| Error Scenario | User Message | Technical Handling |
|----------------|--------------|-------------------|
| Unknown email | "No account found for this email" | Display inline error below OTP input |
| Invalid email format | Button stays disabled | HTML5 email validation |
| Suspended/blocked user | "Your account has been suspended" | Check user.status before login |

---

## 7. Testing Strategy

### 7.1 Unit Tests

- LoginForm: renders email step, transitions to OTP step, validates email
- OTP input: accepts 6 digits, enables verify button
- DevLoginPanel: renders buttons for each role, clicking logs in
- SSO button: shows loading, completes mock auth

### 7.2 Integration Tests

- Full login flow: email → OTP → redirect to dashboard
- Auth guard redirect: unauthenticated → /login
- Already authenticated → redirected away from /login

---

## 8. Dependencies

### 8.1 New shadcn Components

- `input` (already installed)
- `label` (needs install)
- `tabs` (needs install — for dev panel role tabs)

### 8.2 Feature Dependencies

- Phase 0 foundation (routing, auth store, mock data, layouts)
