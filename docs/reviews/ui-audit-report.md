# AMS UI/Design Audit Report

**Date:** 2026-02-20
**Audited by:** Claude Code (visual audit via Chrome)
**Scope:** All pages across Consumer, Merchant, and Admin roles

---

## FINDINGS

### 1. CRITICAL: Table Row Borders Nearly Invisible

**Severity: High** | **Affects: Every table in the app (~15 tables)**

The `--border` CSS variable is set to `#1E1E1E` and `--background` is `#000000`. This is a contrast ratio of only **1.13:1** — virtually indistinguishable. Table rows use `border-b` which resolves to `border-color: #1E1E1E`, making row separators invisible on the dark background.

**Affected pages (all tables):**
- Consumer: API Keys, Usage (daily usage), Services
- Merchant: Services, Consumers, Invoices, Service Detail (Error Codes table)
- Admin: Merchants, Consumers, Services, Governance (Audit Logs)
- All detail pages with embedded tables

**Root cause:** `src/index.css:102` — `--border: #1E1E1E` is too close to `--background: #000000`

**Fix:** Change `--border` to `#252B40` (the value specified in the CLAUDE.md design system spec).

---

### 2. CRITICAL: Form Input Borders Nearly Invisible

**Severity: High** | **Affects: All form inputs**

Input component (`src/components/ui/input.tsx`) uses `border-input` which resolves to `#1E1E1E` — same problem as tables. Form fields on the API Key New page, Register page, Login page, and Merchant New Service page have borders that are barely perceptible.

**Root cause:** `src/index.css:103` — `--input: #1E1E1E`

**Fix:** Change `--input` to `#252B40` to match the design system.

---

### 3. MEDIUM: Sidebar Border Invisible

**Severity: Medium** | **Affects: All dashboard pages**

The sidebar separator uses `--sidebar-border: #1E1E1E` which is invisible against the `--sidebar: #000000` background. There is no visible divider between the sidebar and main content.

**Root cause:** `src/index.css:120` — `--sidebar-border: #1E1E1E`

**Fix:** Change `--sidebar-border` to `#252B40`.

---

### 4. MEDIUM: Background Color Deviates from Design System

**Severity: Medium** | **Affects: Entire app**

The CLAUDE.md design spec defines:
- Background: `#0B0F1A`
- Card: `#141827`

But `src/index.css` uses:
- `--background: #000000` (pure black instead of `#0B0F1A`)
- `--card: #000000` (pure black instead of `#141827`)

**Note:** The app uses a `bg.png` background image overlay which provides visual depth, so pure black may be intentional as a base under the image. However, the card surfaces should still differentiate from the background.

---

### 5. MEDIUM: Card Component Border Radius Mismatch

**Severity: Medium** | **Affects: All cards**

The Card component uses `rounded-[29px]` but the design system spec says `rounded-2xl` (20px).

**Root cause:** `src/components/ui/card.tsx:10` — hardcoded `29px`

**Fix:** Change `rounded-[29px]` to `rounded-2xl`.

---

### 6. LOW: Table Header Lacks Visual Distinction

**Severity: Low** | **Affects: All tables**

Table headers (`<th>`) have the same background as table body rows — there's no visual separation. Adding a subtle background to the header row would improve scannability.

**Fix:** Add `bg-white/[0.03]` to `TableHeader` in `table.tsx`.

---

### 7. LOW: Table Row Hover State Barely Visible

**Severity: Low** | **Affects: All tables**

`TableRow` uses `hover:bg-muted/50` where `--muted` is `#161616`. At 50% opacity on a black background, this produces `~#0B0B0B` — barely perceptible hover.

**Fix:** Change to `hover:bg-white/[0.04]` or `hover:bg-muted` (without /50).

---

### 8. LOW: Secondary/Muted Surfaces Too Dark

**Severity: Low** | **Affects: Multiple components**

`--secondary: #161616`, `--muted: #161616`, `--accent: #1A1A1A` are extremely close to `#000000`. These provide almost no visual distinction for secondary surfaces, hover states, and muted backgrounds.

**Fix:** Bump to `--secondary: #1A1F2E`, `--muted: #1A1F2E`, `--accent: #1E2333`.

---

### 9. LOW: Popover Background Could Be Lighter

**Severity: Low** | **Affects: Dropdowns, popovers**

`--popover: #161616` is very close to background. User menu dropdowns and popovers blend into the page.

**Fix:** Change to `#141827` (design system card color).

---

### 10. LOW: Login "or" Divider Hard to See

**Severity: Low** | **Affects: Login page**

The horizontal rule divider with "or" text between email login and Google SSO uses the border color that's nearly invisible.

---

## SUMMARY TABLE

| # | Issue | Severity | Root Cause | Fix Location |
|---|-------|----------|------------|--------------|
| 1 | Table borders invisible | HIGH | `--border: #1E1E1E` on `#000` bg | `src/index.css:102` |
| 2 | Input borders invisible | HIGH | `--input: #1E1E1E` on `#000` bg | `src/index.css:103` |
| 3 | Sidebar border invisible | MEDIUM | `--sidebar-border: #1E1E1E` | `src/index.css:120` |
| 4 | Background deviates from spec | MEDIUM | `#000000` instead of `#0B0F1A` | `src/index.css:75,77` |
| 5 | Card border radius wrong | MEDIUM | `rounded-[29px]` vs spec `20px` | `src/components/ui/card.tsx:10` |
| 6 | Table header no distinction | LOW | No bg on thead | `src/components/ui/table.tsx:24` |
| 7 | Table hover barely visible | LOW | `hover:bg-muted/50` too subtle | `src/components/ui/table.tsx:58` |
| 8 | Secondary surfaces too dark | LOW | `#161616` vs `#000000` | `src/index.css:87,91,95` |
| 9 | Popover too dark | LOW | `--popover: #161616` | `src/index.css:79` |
| 10 | Login "or" divider invisible | LOW | Uses border color | Login page component |

---

## FILES TO MODIFY

1. `src/index.css` — CSS variables (main fix)
2. `src/components/ui/table.tsx` — Table header bg + hover state
3. `src/components/ui/card.tsx` — Border radius
