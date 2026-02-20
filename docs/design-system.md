# AMS Design System — Ahoy Tech Inspired

Reference: https://ahoy.technology/

## Color Palette (DARK THEME ONLY)

> **LOCKED** — Do not change these colors.

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#0B0F1A` | Page background |
| Card | `#141827` | Card/panel surfaces |
| Foreground | `#E0E4F0` | Primary text |
| Muted Foreground | `#7B83A0` | Secondary/subtle text |
| Brand / Primary | `#0066FF` | CTA buttons, links, active states |
| Primary Foreground | `#FFFFFF` | Text on brand buttons |
| Secondary | `#1A1F33` | Secondary surfaces |
| Accent | `#1E2440` | Hover/focus states |
| Destructive | `#FF4444` | Danger/error |
| Border | `#252B40` | Subtle borders |
| Sidebar | `#0F1322` | Sidebar background |

### Glass / Elevated Surfaces

| Name | Background | Blur | Border | Usage |
|------|-----------|------|--------|-------|
| Glass | `rgba(255,255,255,0.05)` | `blur(12px)` | `1px solid rgba(255,255,255,0.08)` | Elevated cards, overlays |
| Glass Strong | `rgba(72,73,99,0.5)` | `blur(7px)` | `1px solid rgba(255,255,255,0.1)` | Feature panels |

### Shadows

| Name | Value | Usage |
|------|-------|-------|
| Card Shadow | `0 25px 50px -12px rgba(27,56,142,0.1)` | Cards, elevated panels |
| Glow | `0 0 20px rgba(0,102,255,0.15)` | Brand accent glow |

---

## Typography

### Font Families

| Token | Family | Usage |
|-------|--------|-------|
| `font-heading` | `Lexend Deca` | Headings, buttons, nav, logo |
| `font-body` | `Inter` | Body text, descriptions, form inputs |

### Heading Scale

| Level | Size (desktop) | Size (mobile) | Weight | Line-height | Font |
|-------|---------------|---------------|--------|-------------|------|
| Hero H1 | 56-68px | 32-40px | 500 | 1.1 | Lexend Deca |
| Page H1 | 36-40px | 24-28px | 400 | 1.3 | Lexend Deca |
| Section H2 | 28-32px | 20-24px | 400 | 1.3 | Lexend Deca |
| Card H3 | 20-24px | 18-20px | 500 | 1.3 | Lexend Deca |
| Subtitle | 16-18px | 14-16px | 300 | 1.35 | Lexend Deca |

### Body Text

| Variant | Size | Weight | Line-height | Font |
|---------|------|--------|-------------|------|
| Body | 14-16px | 400 | 1.5 | Inter |
| Body Small | 12-14px | 400 | 1.5 | Inter |
| Caption | 11-12px | 400 | 1.4 | Inter |
| Label | 12-14px | 500 | 1 | Inter |

---

## Buttons

### Shape

All buttons use **pill shape** (`rounded-full`, border-radius 9999px / ~42px).

### Variants

| Variant | Background | Border | Text | Height |
|---------|-----------|--------|------|--------|
| Primary | `#0066FF` | none | `#FFFFFF` | 40-48px |
| Outline | transparent | `1px solid rgba(255,255,255,0.2)` | `#E0E4F0` | 40-48px |
| Ghost | transparent | none | `#E0E4F0` | 36-40px |
| Destructive | `#FF4444` | none | `#FFFFFF` | 40-48px |

### Button Text

- Font: Lexend Deca
- Weight: 300-400
- Size: 14px
- Letter-spacing: normal

### Icon Buttons

- Arrow icon buttons: 36x36 circle, outline border `rgba(255,255,255,0.15)`
- Used for card actions and external links

---

## Cards

### Standard Card

- Border-radius: `20-24px`
- Background: `#141827` (card token)
- Border: `1px solid rgba(255,255,255,0.06)` (very subtle)
- Shadow: `0 25px 50px -12px rgba(27,56,142,0.1)`
- Padding: `24px`
- Overflow: `hidden` (clips child images)

### Glass Card

- Border-radius: `20-24px`
- Background: `rgba(255,255,255,0.05)`
- Backdrop-filter: `blur(12px)`
- Border: `1px solid rgba(255,255,255,0.08)`

### Feature Card (with image)

- Image area at top, content at bottom
- Tag badge overlaid on image
- Title: Lexend Deca, 20px, weight 500
- Description: Inter, 14px, weight 400, muted color

---

## Badges / Tags

### Status Badge

Pill shape (`rounded-full`), colored bg/text pattern:

| Status | Background | Text |
|--------|-----------|------|
| Active | `bg-emerald-500/15` | `text-emerald-400` |
| Pending | `bg-amber-500/15` | `text-amber-400` |
| Suspended/Blocked | `bg-red-500/15` | `text-red-400` |
| Expired | `bg-gray-500/15` | `text-gray-400` |
| Draft | `bg-slate-500/15` | `text-slate-400` |

### Tag Badge

- Pill shape
- Blue outline: `border border-primary/30 text-primary`
- Or filled: `bg-primary/15 text-primary`
- Font: 11-12px, weight 500, uppercase, tracking-wide
- Padding: `4px 12px`

### TBD Badge

- Dashed border: `border-dashed border-amber-500/40`
- Background: `bg-amber-500/10`
- Text: `text-amber-400`

---

## Navigation

### Top Nav (Public)

- Height: ~64px
- Background: transparent or `bg-card`
- Logo: Lexend Deca, 20px, weight 300
- Nav links: 14px, weight 400, `text-muted-foreground`
- CTA button: Outline pill style

### Sidebar (Dashboard)

- Width: 240-260px
- Background: `#0F1322`
- Nav items: 14px, weight 400
- Active item: `bg-primary/10 text-primary`
- Hover: `bg-accent`

---

## Category Tabs

- Pill-shaped container
- Active: `bg-primary text-white rounded-full`
- Inactive: `text-muted-foreground`
- Font: 14px, weight 400
- Padding: `8px 20px`

---

## Spacing

| Token | Value | Usage |
|-------|-------|-------|
| Page padding | `16-32px` | Responsive page margins |
| Section gap | `48-80px` | Between major sections |
| Card gap | `16-24px` | Between cards in grid |
| Card padding | `24px` | Inside cards |
| Component gap | `8-16px` | Between related elements |

---

## Border Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | `6px` | Small inputs, minor elements |
| `rounded-md` | `8px` | Default inputs, small cards |
| `rounded-lg` | `12px` | Medium cards, panels |
| `rounded-xl` | `16px` | Large cards |
| `rounded-2xl` | `20px` | Product cards, feature panels |
| `rounded-3xl` | `24px` | Hero cards |
| `rounded-full` | `9999px` | Buttons, badges, tabs, avatars |

---

## Transitions

- Default: `transition-all duration-200 ease-out`
- Hover effects: subtle brightness/opacity change
- Focus ring: `ring-2 ring-primary/50`
