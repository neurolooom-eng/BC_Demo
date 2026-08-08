# e-QMS System Design Defaults

The complete design-system kit behind this app: **tokens, themes, base components,
tables, forms, KPI cards, dashboards, status chips, and layout**. Everything is
theme-driven via CSS variables, so it works in light/dark and any palette.

Hand this whole file to Claude on a new project and say *"adopt these design
defaults and use them across every module."*

> The advanced **table** has its own deep-dive with full component code in
> [`TABLE_DESIGN_DEFAULTS.md`](./TABLE_DESIGN_DEFAULTS.md) — summarised here in §4.

---

## 0. Stack & conventions

- **React + TypeScript + Vite + TailwindCSS.**
- Icons: **lucide-react**. Charts: **recharts**. Tables: **@tanstack/react-table**. Class merge: **clsx**.
- **Colour is never hard-coded** — always a semantic token (`bg-surface`, `text-muted`, `text-primary`…).
- Radius scale: `rounded-md` (controls), `rounded-lg` (menus/cards), `rounded-xl` (panels).
- Spacing rhythm: page padding `p-4 md:p-6`; card padding `p-4`; gaps `gap-3`/`gap-4`.
- Font: **Inter**, `font-feature-settings: 'cv11','ss01'`.

```bash
npm i @tanstack/react-table recharts lucide-react clsx
```

---

## 1. Design tokens & themes

Semantic tokens are CSS variables expressed as **`R G B` channels** so Tailwind's
`rgb(var(--x) / <alpha>)` opacity utilities work. Switch themes by setting
`<html data-theme="…">`.

```css
/* themes.css */
:root, [data-theme='clinical-light'] {
  --c-bg: 241 245 249;   --c-surface: 255 255 255; --c-surface-2: 248 250 252;
  --c-border: 226 232 240; --c-text: 15 23 42;      --c-muted: 100 116 139;
  --c-primary: 13 148 136; --c-primary-fg: 255 255 255; --c-accent: 14 116 144;
  --c-success: 22 163 74;  --c-warning: 217 119 6;  --c-danger: 220 38 38; --c-info: 2 132 199;
  color-scheme: light;
}
[data-theme='clinical-dark'] {
  --c-bg: 2 6 23; --c-surface: 15 23 42; --c-surface-2: 30 41 59; --c-border: 51 65 85;
  --c-text: 226 232 240; --c-muted: 148 163 184; --c-primary: 45 212 191; --c-primary-fg: 4 47 46;
  --c-accent: 34 211 238; --c-success: 74 222 128; --c-warning: 251 191 36; --c-danger: 248 113 113; --c-info: 56 189 248;
  color-scheme: dark;
}
/* Further palettes follow the same variable set: ocean, midnight, emerald, high-contrast. */
```

**Token semantics**

| Token | Use |
|---|---|
| `bg` | page background |
| `surface` / `surface-2` | cards & inputs / zebra, hover, header strips |
| `border` | all hairline borders |
| `text` / `muted` | primary text / secondary text & labels |
| `primary` / `primary-fg` | brand accent / text on accent |
| `success` `warning` `danger` `info` `accent` | semantic states |

**Theme switching** — persist the choice, stamp it on `<html>`:

```ts
document.documentElement.setAttribute('data-theme', themeId)
localStorage.setItem('ui.theme', themeId)
```

Ship a small set of themes (this app has 6: `clinical-light`, `clinical-dark`,
`ocean`, `midnight`, `emerald`, `contrast`) and let users pick from a menu with a
colour swatch + light/dark label per theme.

### Tailwind config

```js
// tailwind.config.js
const v = (name) => ({ opacityValue }) =>
  opacityValue === undefined ? `rgb(var(${name}))` : `rgb(var(${name}) / ${opacityValue})`

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {
    colors: {
      bg: v('--c-bg'), surface: v('--c-surface'), 'surface-2': v('--c-surface-2'),
      border: v('--c-border'), text: v('--c-text'), muted: v('--c-muted'),
      primary: v('--c-primary'), 'primary-fg': v('--c-primary-fg'), accent: v('--c-accent'),
      success: v('--c-success'), warning: v('--c-warning'), danger: v('--c-danger'), info: v('--c-info'),
    },
    fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    boxShadow: { card: '0 1px 2px 0 rgb(0 0 0 / .04), 0 1px 3px 0 rgb(0 0 0 / .06)' },
  } },
}
```

---

## 2. Base component classes

Declare once in `@layer components`; use everywhere.

```css
@layer base {
  body { @apply bg-bg text-text antialiased; }
  * { border-color: rgb(var(--c-border)); }
}

@layer components {
  .btn        { @apply inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5
                       text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed; }
  .btn-primary{ @apply btn bg-primary text-primary-fg hover:opacity-90; }
  .btn-ghost  { @apply btn text-text hover:bg-surface-2; }
  .btn-outline{ @apply btn border border-border bg-surface text-text hover:bg-surface-2; }
  .btn-danger { @apply btn bg-danger text-white hover:opacity-90; }

  .card       { @apply rounded-xl border border-border bg-surface shadow-card; }

  .input, .select, .textarea {
    @apply w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text
           outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/30;
  }
  .label { @apply mb-1 block text-xs font-medium text-muted; }
  .chip  { @apply inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium; }
}
```

**Defaults:** controls are `text-sm`, `py-1.5`; focus ring is `primary/30`; buttons
carry an icon+label with `gap-1.5`; disabled = 50% opacity.

---

## 3. Status chips & semantic tones

One tone vocabulary drives every status/badge in the app.

```tsx
type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'primary'

const toneClass: Record<Tone, string> = {
  neutral: 'bg-muted/15 text-muted',
  info:    'bg-info/15 text-info',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/20 text-warning',
  danger:  'bg-danger/15 text-danger',
  primary: 'bg-primary/15 text-primary',
}

export function StatusChip({ value, tone = 'neutral', dot = true }: { value?: string; tone?: Tone; dot?: boolean }) {
  if (!value) return <span className="text-muted">—</span>
  return (
    <span className={`chip ${toneClass[tone]}`}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />}
      {value}
    </span>
  )
}
```

**Default mapping convention** (tune per domain): draft/neutral → `neutral`,
in-review/in-progress → `info`, action-needed/overdue → `warning`/`danger`,
approved/closed/pass → `success`, active/selected → `primary`.

---

## 4. Advanced table (summary)

Full spec + component code: [`TABLE_DESIGN_DEFAULTS.md`](./TABLE_DESIGN_DEFAULTS.md).
Defaults every table ships with:

- **Text wrap on** (per-column `nowrap`, global toggle) · **drag-reorder columns** ·
  **resizable widths** · **fit / natural table width** · **sticky header** ·
  **rows-before-scroll** (default 12) · **show/hide columns** · **sort** ·
  **global search** · **CSV export** · **density** (52/38px rows) ·
  **saved views** persisted per `tableKey`.
- Declarative columns: `{ key, header, width?, nowrap?, accessor?, render?, toText? }`.
- Comfortable row = 52px, compact = 38px; header uses `bg-surface-2`, cells `align-top`.

---

## 5. Form system

Schema-driven forms grouped into titled sections; two-column grid, textareas span full width.

**Field types:** `text · textarea · number · currency · date · select · multiselect ·
status · user · boolean · email · tags · attachment · signature`.

**Layout defaults**
- Each **section** is a `<fieldset class="card p-4">` with a `<legend>` in `text-primary`.
- Fields render in `grid grid-cols-1 sm:grid-cols-2 gap-4`; `textarea` gets `sm:col-span-2`.
- Label via `.label`; required shows a `text-danger` asterisk; helper text `text-[11px] text-muted`.
- Inputs use `.input/.select/.textarea`; `textarea` `min-h-[80px]`.
- `readonly` / `disabled` fields render at reduced opacity; audit fields (created/updated by/at) are readonly.

```tsx
// Field wrapper default
<div className={type === 'textarea' ? 'sm:col-span-2' : ''}>
  <label className="label">{label}{required && <span className="text-danger"> *</span>}</label>
  {/* control */}
  {help && <p className="mt-0.5 text-[11px] text-muted">{help}</p>}
</div>
```

**Special controls**
- `status` / `select` → native `<select>`; options may carry a tone for chip display in tables.
- `user` → `<select>` of people (with an "— Unassigned —" default).
- `signature` → dashed-border row with a pen icon + "type name to e-sign" text input (placeholder e-sig).
- `attachment` → paperclip + link/URL input (placeholder for a real uploader / Drive picker).

**Editing pattern:** open records in a right-hand **slide-over drawer** (`max-w-2xl`,
sticky header + footer, `Cancel` / `Save`), overlay `bg-black/40`.

---

## 6. KPI cards

Value + target + Red/Amber/Green status bar + icon.

```tsx
export interface KpiCardProps {
  label: string; value: number
  format?: 'int' | 'percent' | 'currency'
  target?: number; goal?: 'higher' | 'lower'; icon?: string
}

// RAG: good if value meets target (dir by goal); amber within 20% band; else red.
function rag({ value, target, goal = 'higher' }: KpiCardProps) {
  if (target === undefined) return null
  const good = goal === 'higher' ? value >= target : value <= target
  if (good) return 'green'
  const near = goal === 'higher' ? value >= target * 0.8 : value <= target * 1.25
  return near ? 'amber' : 'red'
}
```

**Visual defaults**
- Container `.card p-4`, relative; a coloured status bar sits at the very bottom (`h-1`, `bg-success|warning|danger`).
- Label: `text-xs uppercase tracking-wide text-muted`.
- Value: `text-3xl font-bold tabular-nums`, tinted by RAG when a target exists.
- Target line: `Target ≥/≤ N` in `text-xs text-muted` (≤ when `goal:'lower'`).
- Icon: lucide icon in a `bg-primary/10 text-primary` rounded box, top-right.
- Formats: `percent → "N%"`, `currency → "€N"`, else `toLocaleString()`.

**Grid default:** `grid grid-cols-2 gap-3 lg:grid-cols-4`.

---

## 7. Dashboards & charts

Chart cards use recharts with a shared 8-colour categorical palette and token-coloured grid.

```tsx
const PALETTE = ['#0d9488','#0284c7','#7c3aed','#d97706','#dc2626','#059669','#db2777','#0891b2']
// grid/stroke: rgb(var(--c-border)); axis ticks ~11px in muted.
```

**Defaults**
- Card: `.card p-4`, title `text-sm font-semibold`, chart body `h-64`, `ResponsiveContainer`.
- **Bar** — `radius={[4,4,0,0]}`, per-cell palette colour, x-axis labels angled `-15°`.
- **Pie** — doughnut: `innerRadius 45 / outerRadius 80`, `paddingAngle 2`, legend `fontSize 11`.
- **Line** — `type="monotone"`, `strokeWidth 2`.
- **Module dashboard layout:** KPI row (§6) on top, then `grid grid-cols-1 lg:grid-cols-2 gap-4` of chart cards.
- **Executive dashboard:** headline KPI row + a couple of charts + a clickable module grid of summary cards.

---

## 8. App layout

- **Sidebar** (`w-64`, collapsible to `w-16`): brand block, nav grouped by section with
  tiny uppercase group labels (`text-[10px] tracking-wider text-muted`); active item
  `bg-primary/12 text-primary`; hover `bg-surface-2`.
- **Topbar** (`bg-surface`, bottom border): breadcrumb left; right side = **theme menu**
  (swatch list) + **user chip** (avatar initials in `bg-primary/15 text-primary`, name + role) + sign-out.
- **Main:** `flex-1 overflow-auto p-4 md:p-6`.
- **Avatars:** initials in a circle, `bg-primary/15 text-primary` (or a per-record tint at 15% alpha).
- **Menus/popovers:** `rounded-lg border border-border bg-surface p-2 shadow-card`, with a
  full-screen invisible click-catcher behind them to close on outside click.

---

## 9. Micro-conventions cheat-sheet

| Thing | Default |
|---|---|
| Card | `rounded-xl border border-border bg-surface shadow-card` |
| Control height | `py-1.5`, `text-sm` |
| Focus | `focus:border-primary focus:ring-2 focus:ring-primary/30` |
| Muted label | `text-xs font-medium text-muted` (uppercase for KPI/section labels) |
| Empty value | `<span className="text-muted">—</span>` |
| Numbers | `tabular-nums` |
| Tone tint | `bg-<tone>/15 text-<tone>` (warning uses `/20`) |
| Hover row/item | `hover:bg-surface-2` |
| Overlay | `bg-black/40` (drawers) / `bg-black/50` (modals) |
| Drawer width | `max-w-2xl` (forms), `max-w-5xl` (rich multi-section forms) |
| Icon box | `rounded-lg bg-primary/10 p-2 text-primary` |

---

### How to reuse in a new project
1. Drop in the **themes.css** + **tailwind.config** tokens (§1) and the **base classes** (§2).
2. Copy the **DataTable** (see the table doc), **StatusChip** (§3), **KpiCard** (§6), **ChartCard** (§7).
3. Build features from these primitives — don't introduce new colours or ad-hoc spacing;
   extend the token set instead. Keep one tone vocabulary and one card/'.input' style everywhere.
