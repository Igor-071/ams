# Specification: Merchant Dashboard — Docker Image Management

**Author:** Alex Chen (Tech Lead)
**Date:** 2026-02-20
**Status:** Draft

---

## 1. Overview

### 1.1 Summary

Implement the merchant Docker image management page (`/merchant/images`) showing Docker image versions for the merchant's Docker-type services, with push credentials display and copy-to-clipboard.

### 1.2 Goals

- List Docker images grouped by service
- Show image versions with tags, sizes, and push dates
- Display push credentials with copy button
- Push command display

### 1.3 Non-Goals

- Actual image push/build functionality
- Image deletion
- Version comparison

---

## 2. Acceptance Criteria

### AC-082: Docker images page lists merchant's Docker images

GIVEN a merchant navigates to `/merchant/images`
WHEN the page loads
THEN the page displays a heading "Docker Images"
  AND images are listed grouped by Docker-type service
  AND each image shows: name, tag, size, pushed date
  AND if no Docker services exist, an empty state is shown

---

### AC-083: Push credentials are displayed with copy button

GIVEN Docker images are displayed for a service
WHEN the merchant views the image section
THEN a push command is shown (e.g. `docker push registry.ams.io/stream-processor:latest`)
  AND a copy-to-clipboard button is available next to the command

---

## 3. Traceability Matrix

| Criterion | Test File | Test Name | Status |
|-----------|-----------|-----------|--------|
| AC-082 | | | ⏳ |
| AC-083 | | | ⏳ |

**Status:** ⏳ Pending | ✅ Passed | ❌ Failed

---

## 4. Technical Design

### 4.1 Components/Files

| File | Action | Description |
|------|--------|-------------|
| `src/features/merchant/pages/merchant-images-page.tsx` | Create | Docker image management |
| `src/mocks/handlers.ts` | Modify | Add `getDockerImagesByMerchant()` handler |

### 4.2 Mock Handlers

```typescript
export function getDockerImagesByMerchant(merchantId: string): DockerImage[]
// Returns Docker images for services owned by this merchant
```

---

## 5. Dependencies

- Phase 0 (shared components, copy button)
- Phase 3 (Docker image mock data)
