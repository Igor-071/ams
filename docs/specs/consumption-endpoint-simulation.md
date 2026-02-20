# Spec: Consumption Endpoint Simulation

**Phase:** 6 — Consumption Endpoint Simulation & Polish
**Feature:** Interactive consumption endpoint simulator
**Requirement Refs:** FR2-MERCH-03, CLAUDE.md Consumption Endpoint

## Overview

An interactive simulator on the merchant service detail page that allows testing the POST /api/consume validation pipeline. The simulator runs 5 sequential validation steps against live mock data and shows pass/fail results per step with the appropriate error code. Successful simulations create a usage record.

## Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `ConsumptionSimulator` | `src/features/merchant/components/consumption-simulator.tsx` | Interactive form + validation results |
| `simulateConsumption` | `src/mocks/handlers.ts` | Handler that runs 5-step validation pipeline |

## Acceptance Criteria

### AC-103: simulateConsumption handler runs 5-step validation
GIVEN a ConsumptionRequest with an API key and service ID
WHEN simulateConsumption is called
THEN it runs 5 sequential validation steps: API Key Validation → TTL Check → Service Authorization → Merchant Config → Rate Limit
AND it stops at the first failing step returning the appropriate error code
AND it returns a ConsumptionResponse with all validation results

### AC-104: Simulator form renders on merchant service detail
GIVEN the merchant is viewing an API-type service detail page
WHEN the page loads
THEN a "Try Consumption Endpoint" section is visible
AND it contains an API key input field and a "Simulate" button

### AC-105: Validation step results show pass/fail indicators
GIVEN the merchant submits a simulation request
WHEN the simulation completes
THEN each validation step shows a visual pass (green) or fail (red) indicator
AND the failing step shows its error code (401, 403, 429, or 502)
AND steps after the failing step show as skipped

### AC-106: Error scenarios produce correct error codes
GIVEN the merchant enters an invalid API key
WHEN they simulate
THEN step 1 fails with 401 (Unauthorized)
GIVEN the merchant enters an expired key
WHEN they simulate
THEN step 2 fails with 403 (Forbidden)

### AC-107: Successful simulation creates usage record
GIVEN the merchant enters a valid, active API key authorized for the service
WHEN they simulate
THEN all 5 steps pass with a 200 (Success) response
AND a new usage record is appended to mock data
AND the simulated response time is shown

### AC-108: Usage pipeline visualization
GIVEN the merchant is viewing an API-type service detail page
WHEN the page loads
THEN a "Usage Pipeline" section shows the async processing steps:
  Aggregate Usage → Update Billing → Feed Dashboards → Trigger Alerts

## Traceability

| Criterion | Test File | Test Name | Status |
|-----------|-----------|-----------|--------|
| AC-103 | consumption-handlers.test.ts | returns 401/403/200 for API key validation pipeline | PASSED |
| AC-104 | consumption-simulator.test.tsx | renders simulator form on API-type service detail | PASSED |
| AC-105 | consumption-simulator.test.tsx | shows pass/fail indicators after simulation with invalid key | PASSED |
| AC-106 | consumption-simulator.test.tsx | returns 401 for invalid API key / returns 403 for expired API key | PASSED |
| AC-107 | consumption-simulator.test.tsx | shows 200 success for valid active key | PASSED |
| AC-108 | consumption-simulator.test.tsx | shows usage pipeline section on API-type service | PASSED |
