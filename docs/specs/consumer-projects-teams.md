# Specification: Consumer Dashboard — Projects & Teams

**Author:** Alex Chen (Tech Lead)
**Date:** 2026-02-20
**Status:** Draft

---

## 1. Overview

### 1.1 Summary

Implement the projects and teams pages (`/dashboard/projects` and `/dashboard/projects/:projectId`) allowing consumers to organize their service subscriptions and API keys into logical projects. Each project can have members and assigned services/keys.

### 1.2 Goals

- Projects list page with cards
- Project detail page with members and assigned services
- Create project form (basic)

### 1.3 Non-Goals

- Team role permissions (owner/member distinction is display-only)
- Member invitation flow (add members is mocked)
- Project deletion

---

## 2. Acceptance Criteria

### AC-064: Projects list page renders with project cards

GIVEN a consumer navigates to `/dashboard/projects`
WHEN the page loads
THEN the page displays a heading "Projects"
  AND project cards show: project name, member count, service count
  AND a "New Project" button is visible
  AND if no projects exist, an empty state is shown

---

### AC-065: Project detail page shows members and services

GIVEN a consumer navigates to `/dashboard/projects/:projectId`
WHEN the page loads
THEN the page shows: project name, description
  AND a "Members" section lists all members with name, email, and role
  AND a "Services" section lists assigned services
  AND a "API Keys" section lists assigned API keys

---

### AC-066: Create new project

GIVEN a consumer clicks "New Project" on the projects list
WHEN a dialog/form appears
THEN the consumer can enter: project name (required), description (optional)
  AND on submit, the project is created in mock data
  AND the new project appears in the list

---

## 3. Traceability Matrix

| Criterion | Test File | Test Name | Status |
|-----------|-----------|-----------|--------|
| AC-064 | | | ⏳ |
| AC-065 | | | ⏳ |
| AC-066 | | | ⏳ |

**Status:** ⏳ Pending | ✅ Passed | ❌ Failed

---

## 4. Technical Design

### 4.1 Components/Files

| File | Action | Description |
|------|--------|-------------|
| `src/features/consumer/pages/projects-page.tsx` | Create | Projects list |
| `src/features/consumer/pages/project-detail-page.tsx` | Create | Project detail |
| `src/features/consumer/components/project-card.tsx` | Create | Project summary card |
| `src/mocks/data/projects.ts` | Create | Mock project data |
| `src/mocks/handlers.ts` | Modify | Add project CRUD handlers |

---

## 5. Dependencies

- Phase 0 (shared components)
- Phase 2 (service data)
- shadcn: `dialog` (already installed)
