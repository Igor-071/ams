# Spec: Cross-Role Approval Flows

**Phase:** 6 — Consumption Endpoint Simulation & Polish
**Feature:** Consumer services pages and dev panel
**Requirement Refs:** FR3-CONS-02, FR3-CONS-03

## Overview

Complete the remaining consumer dashboard pages (subscribed services list and per-service detail) and add a dev panel for mock data management. These pages enable consumers to view their approved services and per-service usage data.

## Pages

| Route | Component | Purpose |
|-------|-----------|---------|
| `/dashboard/services` | `ConsumerServicesPage` | List of consumer's approved services |
| `/dashboard/services/:serviceId` | `ConsumerServiceDetailPage` | Per-service usage detail |

## Acceptance Criteria

### AC-109: Consumer services page lists approved services
GIVEN the consumer is logged in
WHEN they navigate to the services page
THEN a table shows all services they have approved access to
AND each row shows the service name, merchant, type, and category

### AC-110: Consumer service detail shows per-service usage
GIVEN the consumer navigates to a service detail page
WHEN the page loads
THEN it shows the service name, merchant, and description
AND it shows usage stats: total requests, average response time
AND it lists recent usage records for that service

### AC-111: Dev panel with mock data reset
GIVEN the user is in development mode
WHEN they open the dev panel (accessible from the dashboard footer)
THEN a "Reset Mock Data" button is available
AND clicking it reloads the page to reset all mock state

## Traceability

| Criterion | Test File | Test Name | Status |
|-----------|-----------|-----------|--------|
| AC-109 | consumer-services.test.tsx / consumption-handlers.test.ts | renders table of approved services / getConsumerApprovedServices | PASSED |
| AC-110 | consumer-services.test.tsx / consumption-handlers.test.ts | renders service detail with usage stats / getConsumerServiceUsage | PASSED |
| AC-111 | dev-panel.test.tsx | shows reset mock data button when panel opened | PASSED |
