# Spec: Admin Dashboard Overview

**Phase:** 5 — Admin Dashboard
**Feature:** Admin Dashboard Overview
**Requirement Refs:** FR4, Admin Journey

## Overview

The admin dashboard provides a high-level overview of the AMS platform with KPI stats, a list of pending approval items, and quick action links for navigating to management pages.

## Pages

| Route | Component | Purpose |
|-------|-----------|---------|
| `/admin` | `AdminDashboardPage` | KPI stats + pending approvals + quick actions |

## Acceptance Criteria

### AC-086: Admin dashboard KPI stat cards
GIVEN the admin is logged in
WHEN they view the admin dashboard
THEN they see 4 KPI stat cards: Total Merchants, Total Consumers, Pending Approvals, Active Services
AND each card shows a correct aggregated count from the mock data

### AC-087: Pending items section
GIVEN the admin is viewing the dashboard
WHEN there are pending service approvals or pending access requests
THEN a "Pending Items" section lists each pending item with its type, name, and requester
AND the admin can navigate to the relevant detail page

### AC-088: Quick action links
GIVEN the admin is viewing the dashboard
WHEN they look at the Quick Actions card
THEN they see links to Merchants, Consumers, Services, and Governance pages
AND each link navigates to the correct route

## Traceability

| Criterion | Test File | Test Name | Status |
|-----------|-----------|-----------|--------|
| AC-086 | | | |
| AC-087 | | | |
| AC-088 | | | |
