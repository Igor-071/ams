# Spec: Notification System

**Phase:** 6 — Consumption Endpoint Simulation & Polish
**Feature:** In-app notification center
**Requirement Refs:** Cross-cutting UX

## Overview

A notification center accessible from the dashboard topbar. Shows in-app notifications for platform events (approvals, denials, invites). Uses the existing notification store (Zustand).

## Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `NotificationCenter` | `src/components/shared/notification-center.tsx` | Bell icon + dropdown |
| Updated `DashboardLayout` | `src/components/layout/dashboard-layout.tsx` | Embed notification center in topbar |

## Acceptance Criteria

### AC-112: Notification bell icon in dashboard topbar
GIVEN the user is on any dashboard page
WHEN the page loads
THEN a bell icon is visible in the topbar header
AND an unread count badge shows the number of unread notifications (hidden when 0)

### AC-113: Notification dropdown shows list
GIVEN the user clicks the bell icon
WHEN the dropdown opens
THEN it shows a list of notifications with title, description, and timestamp
AND unread notifications are visually distinct from read ones
AND a "Mark all as read" button is available

### AC-114: Mark as read functionality
GIVEN the user views the notification dropdown
WHEN they click on a notification
THEN it is marked as read and the unread count updates
WHEN they click "Mark all as read"
THEN all notifications are marked as read

### AC-115: Seed initial notifications for demo
GIVEN the user logs in
WHEN the dashboard loads for the first time
THEN seed notifications are added (e.g., "Welcome to AMS", "Service approved", "Access request approved")
AND these notifications demonstrate the notification system

## Traceability

| Criterion | Test File | Test Name | Status |
|-----------|-----------|-----------|--------|
| AC-112 | notification-center.test.tsx | renders bell icon in the topbar / shows unread count badge | PASSED |
| AC-113 | notification-center.test.tsx | opens dropdown showing notifications when bell clicked | PASSED |
| AC-114 | notification-center.test.tsx | marks a notification as read / marks all notifications as read | PASSED |
| AC-115 | notification-center.test.tsx | seeds notifications on first dashboard load | PASSED |
