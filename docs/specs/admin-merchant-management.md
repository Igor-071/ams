# Spec: Admin Merchant Management

**Phase:** 5 — Admin Dashboard
**Feature:** Merchant Management (Invite, Suspend)
**Requirement Refs:** FR4-ADMIN-01, Admin Journey C1/C3

## Overview

Admins manage merchant lifecycle: view all merchants, invite new merchants via generated codes, view merchant detail with their services, and suspend/unsuspend merchants platform-wide.

## Pages

| Route | Component | Purpose |
|-------|-----------|---------|
| `/admin/merchants` | `AdminMerchantsPage` | Merchant list table + invite dialog |
| `/admin/merchants/:merchantId` | `AdminMerchantDetailPage` | Merchant profile + services + suspend toggle |

## Acceptance Criteria

### AC-089: Merchant list table
GIVEN the admin navigates to the merchants page
WHEN the page loads
THEN a table displays all merchants with columns: Name, Company, Status, Invited
AND each row is clickable to navigate to the merchant detail page
AND an "Invite Merchant" button is visible

### AC-090: Invite merchant dialog
GIVEN the admin is on the merchants page
WHEN they click "Invite Merchant" and enter an email
THEN an invite code is generated and displayed
AND the invite link is copyable to clipboard
AND the dialog shows the registration URL with the invite code

### AC-091: Merchant detail page
GIVEN the admin navigates to a merchant detail page
WHEN the page loads
THEN it shows the merchant's name, company, email, status, and invite date
AND it lists the merchant's services with their statuses

### AC-092: Suspend and unsuspend merchant
GIVEN the admin is viewing an active merchant detail
WHEN they click "Suspend Merchant"
THEN the merchant status changes to suspended
AND a confirmation dialog is shown before the action
GIVEN the admin is viewing a suspended merchant
WHEN they click "Unsuspend Merchant"
THEN the merchant status changes to active

## Traceability

| Criterion | Test File | Test Name | Status |
|-----------|-----------|-----------|--------|
| AC-089 | | | |
| AC-090 | | | |
| AC-091 | | | |
| AC-092 | | | |
