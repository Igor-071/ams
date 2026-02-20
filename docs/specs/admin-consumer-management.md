# Spec: Admin Consumer Management

**Phase:** 5 — Admin Dashboard
**Feature:** Consumer Management (Approve Access, Block)
**Requirement Refs:** FR4-ADMIN-02, Admin Journey D1/D2/D3

## Overview

Admins manage consumer lifecycle: view all consumers, view consumer detail with subscribed services and usage, approve/deny access requests, and block/unblock consumers platform-wide.

## Pages

| Route | Component | Purpose |
|-------|-----------|---------|
| `/admin/consumers` | `AdminConsumersPage` | Consumer list table |
| `/admin/consumers/:consumerId` | `AdminConsumerDetailPage` | Consumer profile + services + usage + access requests + block toggle |

## Acceptance Criteria

### AC-093: Consumer list table
GIVEN the admin navigates to the consumers page
WHEN the page loads
THEN a table displays all consumers with columns: Name, Email, Organization, Status
AND each row is clickable to navigate to the consumer detail page

### AC-094: Consumer detail page
GIVEN the admin navigates to a consumer detail page
WHEN the page loads
THEN it shows the consumer's name, email, organization, and status
AND it lists the consumer's access requests with their statuses
AND it shows a usage summary (total requests)

### AC-095: Block and unblock consumer
GIVEN the admin is viewing an active consumer
WHEN they click "Block Consumer" and confirms
THEN the consumer status changes to blocked
GIVEN the admin is viewing a blocked consumer
WHEN they click "Unblock Consumer"
THEN the consumer status changes to active

### AC-096: Approve and deny access requests
GIVEN the admin is viewing a consumer detail with pending access requests
WHEN they click "Approve" on a pending request
THEN the request status changes to approved
WHEN they click "Deny" on a pending request
THEN the request status changes to denied

## Traceability

| Criterion | Test File | Test Name | Status |
|-----------|-----------|-----------|--------|
| AC-093 | | | |
| AC-094 | | | |
| AC-095 | | | |
| AC-096 | | | |
