# Specification: Consumer Dashboard — Docker Images (Stub)

**Author:** Alex Chen (Tech Lead)
**Date:** 2026-02-20
**Status:** Draft

---

## 1. Overview

### 1.1 Summary

Implement a stub page for consumer Docker images (`/dashboard/images`) showing available Docker images for subscribed Docker-type services with pull commands and copy-to-clipboard. This is a lightweight placeholder for the full Docker management feature.

### 1.2 Goals

- Display Docker images for subscribed Docker-type services
- Show pull commands with copy button
- TBD badge for features not yet implemented

### 1.3 Non-Goals

- Image version management
- Runtime key validation
- Push/build functionality (merchant-only)

---

## 2. Acceptance Criteria

### AC-062: Docker images page renders with available images

GIVEN a consumer navigates to `/dashboard/images`
WHEN the page loads
THEN the page displays a heading "Docker Images"
  AND shows a list of Docker images from subscribed Docker-type services
  AND if no Docker services are subscribed, shows an empty state

---

### AC-063: Pull command displayed with copy button

GIVEN Docker images are displayed
WHEN the consumer views an image entry
THEN the pull command is shown (e.g. `docker pull registry.ams.io/stream-processor:latest`)
  AND a copy-to-clipboard button is available next to the command

---

## 3. Traceability Matrix

| Criterion | Test File | Test Name | Status |
|-----------|-----------|-----------|--------|
| AC-062 | | | ⏳ |
| AC-063 | | | ⏳ |

**Status:** ⏳ Pending | ✅ Passed | ❌ Failed

---

## 4. Technical Design

### 4.1 Components/Files

| File | Action | Description |
|------|--------|-------------|
| `src/features/consumer/pages/images-page.tsx` | Create | Docker images stub |
| `src/mocks/data/docker-images.ts` | Create | Mock Docker image data |

---

## 5. Dependencies

- Phase 0 (shared components, copy button)
- Phase 2 (service data)
