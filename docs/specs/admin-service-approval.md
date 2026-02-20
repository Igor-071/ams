# Spec: Admin Service Approval

**Phase:** 5 — Admin Dashboard
**Feature:** Service Approval Workflow
**Requirement Refs:** FR4-ADMIN-01, Admin Journey C2

## Overview

Admins review all services across the platform and manage the approval workflow for services submitted by merchants. Pending services can be approved (status → active) or rejected (status → rejected).

## Pages

| Route | Component | Purpose |
|-------|-----------|---------|
| `/admin/services` | `AdminServicesPage` | Service list with status filter |
| `/admin/services/:serviceId` | `AdminServiceDetailPage` | Service detail with approve/reject actions |

## Acceptance Criteria

### AC-097: Service list with status filter
GIVEN the admin navigates to the services page
WHEN the page loads
THEN a table shows all services with columns: Name, Merchant, Type, Status
AND each row is clickable to navigate to the service detail page
AND a status filter allows viewing only pending, active, or all services

### AC-098: Approve pending service
GIVEN the admin is viewing a pending service detail
WHEN they click "Approve"
THEN the service status changes to active
AND a success message is displayed

### AC-099: Reject pending service
GIVEN the admin is viewing a pending service detail
WHEN they click "Reject"
THEN the service status changes to rejected
AND a success message is displayed

## Traceability

| Criterion | Test File | Test Name | Status |
|-----------|-----------|-----------|--------|
| AC-097 | | | |
| AC-098 | | | |
| AC-099 | | | |
