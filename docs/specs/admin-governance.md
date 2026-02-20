# Spec: Admin Governance

**Phase:** 5 — Admin Dashboard
**Feature:** Audit Logs & Platform Config
**Requirement Refs:** FR4, Admin Journey E1

## Overview

The governance page provides audit trail visibility with a filterable log table showing all admin and system actions. A platform config section is stubbed as TBD.

## Pages

| Route | Component | Purpose |
|-------|-----------|---------|
| `/admin/governance` | `AdminGovernancePage` | Audit log table + platform config stub |

## Acceptance Criteria

### AC-100: Audit log table
GIVEN the admin navigates to the governance page
WHEN the page loads
THEN an audit log table displays entries with columns: Action, Actor, Description, Timestamp
AND entries are sorted newest-first

### AC-101: Audit log action filter
GIVEN the admin is viewing the audit log table
WHEN they select an action type filter
THEN only logs matching that action type are displayed
AND clearing the filter shows all logs again

### AC-102: Platform config stub
GIVEN the admin is viewing the governance page
WHEN they look at the Platform Config section
THEN a TBD badge is shown with a "coming soon" message

## Traceability

| Criterion | Test File | Test Name | Status |
|-----------|-----------|-----------|--------|
| AC-100 | | | |
| AC-101 | | | |
| AC-102 | | | |
