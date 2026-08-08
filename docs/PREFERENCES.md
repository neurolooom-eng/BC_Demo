# Project Preferences

Working conventions for this repo - Git workflow, backend, Admin, and access/pages. Read this
alongside [`DESIGN_DEFAULTS.md`](./DESIGN_DEFAULTS.md) (UI/design system) and
[`PURCHASE_MODULE_DESIGN_DEFAULTS.md`](./PURCHASE_MODULE_DESIGN_DEFAULTS.md) (Purchase module
specifics).

---

## 1. Git

- **Default branch:** `main`. GitHub Pages deploys automatically on every push to `main`
  (`.github/workflows/deploy-pages.yml`) - treat a push to `main` as a production release, not a
  checkpoint.
- **Feature work** happens on a dedicated branch, pushed with `git push -u origin <branch>`, and
  is folded into `main` (PR or direct merge depending on the workflow in use) once verified.
- **Commit messages:** present-tense summary line describing the change and its purpose (e.g.
  "Rework Purchase into Material Requisitions + header/line-item POs, split Stores into Stock
  In/Out/Transfer/Levels"), with a body explaining *why* when the change isn't self-evident from
  the diff. No emoji.
- **Before pushing:** run the checks in §1.1 below. A broken `main` immediately breaks the live
  GitHub Pages deploy.
- **No force-push to `main`.** No `--no-verify`/hook-skipping. Destructive git operations
  (`reset --hard`, discarding local changes) require explicit confirmation - see the repo-wide
  safety rules this assistant follows.
- **CI:** the only workflow is the Pages deploy (`deploy-pages.yml`) - it builds with `npm ci &&
  npm run build` and publishes `dist/`. There's no separate test/lint gate in CI today; run
  `npm run lint` and `npm run build` locally before pushing.

### 1.1 Local verification checklist

```bash
npm run lint     # oxlint
npm run build    # tsc -b && vite build - type-checks AND bumps the build ID
npm run preview  # sanity-check the production build locally
```
Also manually check responsive breakpoints (mobile 390px / tablet 834px / desktop 1440px) for
any UI change - see the Responsive design section of the main `README.md`.

---

## 2. Backend

- **No server of its own.** The app is a static SPA (Vite build → `dist/`) hosted on GitHub
  Pages. All persistence goes through **Google Sheets**, accessed via a **Google Apps Script**
  Web App that exposes the sheet as a small JSON API (`google-apps-script/Code.gs`, setup in
  `google-apps-script/README.md`).
- **Single data-access seam:** every page reads/writes through `src/data/repository.ts` -
  never call `sheetsClient` or touch mock arrays directly from a page/component. Each entity has
  a `load*`/`save*`/`update*` triplet (e.g. `loadPurchaseOrders`, `savePurchaseOrder`,
  `updatePurchaseOrder`) that:
  1. Tries the configured Sheets API tab.
  2. Falls back to the bundled mock array in `src/data/*.ts` if `VITE_SHEETS_API_URL` is unset
     **or** the live call fails - so a broken/unconfigured backend degrades to demo data instead
     of breaking the page.
- **Configuration, in priority order:**
  1. **Developer Config page** (`/config`, `config:access` permission) - per-browser
     `localStorage` overrides (`src/lib/runtimeConfig.ts`): Apps Script Exec URL, optional
     Spreadsheet ID, sheet tab names, plus a live **Test Connection** check per tab.
  2. **Build-time env var** `VITE_SHEETS_API_URL` - set in `.env` locally (copy from
     `.env.example`), or as a GitHub repo **variable** (not secret - it's a public-facing URL)
     under **Settings → Secrets and variables → Actions → Variables** for the deployed build.
  3. Unset → mock data only.
- **New entity checklist:** add the type to `src/types/business.ts` (or `domain.ts` for
  core-QMS entities) → seed mock data in `src/data/<entity>.ts` → add a sheet tab + `load/save/
  update` in `repository.ts` → document the sheet's expected columns in
  `google-apps-script/README.md`.
- **No auth on the API itself** - the Apps Script Web App is reachable by anyone with its URL.
  Known limitation, called out in `google-apps-script/README.md`; don't rely on it for anything
  sensitive without adding a shared-secret param or a real backend first.

---

## 3. Admin

**Admin** (`/admin`, gated to `admin:access`) is the in-app control panel for RBAC - there's no
separate ops/admin backend.

- **Users tab:** name, email, and which **Group** each user belongs to. Seed data:
  `src/data/users.ts`.
- **Groups & Permissions tab:** a live matrix (view/create/edit/approve, per module) toggled
  directly in the UI. Backing data: `src/data/groups.ts` (the `GROUPS` seed array) and the
  permission catalog in `src/lib/permissions.ts` (`PERMISSION_CATALOG` - one row per
  `module:action` permission key, grouped by module for the matrix).
- **Seeded groups** (`src/data/groups.ts`):

  | Group | Scope |
  |---|---|
  | Administrator | every permission |
  | Developer | view-only across QMS modules + `config:access` (Developer Config) |
  | Quality Manager | QMS Documents + Specifications (create/edit) + Check Sheets approve |
  | Shift Supervisor | Check Sheets create + edit-while-in-review |
  | Operator | Check Sheets create only |
  | Purchase Officer | Purchase view/create/edit + Stores view |
  | Store Keeper | Stores view/create/edit + Purchase view |
  | Accountant | Accounts + Ledgers view/create/edit + Purchase view |
  | Viewer | view-only everywhere |

- **Adding a permission:** add one entry to `PERMISSION_CATALOG` (`src/lib/permissions.ts`) with
  a `key` of the form `module:action`, add it to `ALL_PERMISSIONS` in `groups.ts`, then grant it
  to whichever seeded groups should have it. The Admin matrix picks up new rows automatically -
  no separate UI work needed.
- **No real login.** There's no backend auth yet, so "who you are" is the topbar's **switch
  user** menu (persisted to `localStorage`), not a sign-in. RBAC gating itself (permission checks
  on nav, buttons, routes) is real and enforced - only the identity behind it is a stand-in.
  Wiring real authentication (SSO / email+password) that resolves to one of these Groups is the
  first item under "Next steps for production" in the main `README.md`.

---

## 4. Access & Pages

- **Router:** `HashRouter` (not `BrowserRouter`) - required because GitHub Pages has no
  server-side rewrite rule for deep links; routes live after `#` (e.g. `/#/purchase`), which
  always resolves to the single static `index.html` and survives a hard refresh.
- **Route guard:** wrap any permission-gated route's `element` in
  `<RequirePermission permission="...">` (`src/components/RequirePermission.tsx`) - this both
  hides the nav item (via `AccessContext`) and blocks direct navigation to the URL.
- **Route table** (`src/App.tsx`):

  | Path | Page | Permission |
  |---|---|---|
  | `/` | Dashboard | `dashboard:view` (nav-gated; route itself is open) |
  | `/documents` | QMS Documents | — (route open; nav item gated on `documents:view`) |
  | `/specifications` | Specifications | — (nav item gated on `specifications:view`) |
  | `/check-sheets` | Process Check Sheets | — (nav item gated on `checksheets:view`) |
  | `/purchase` | Purchase | `purchase:view` |
  | `/stores` | Stores | `stores:view` |
  | `/accounts` | Accounts | `accounts:view` |
  | `/ledgers` | Ledgers | `ledgers:view` |
  | `/settings` | Settings | — (always visible) |
  | `/admin` | Users & Access | `admin:access` |
  | `/config` | Developer Config | `config:access` |

  Purchase/Stores/Accounts/Ledgers/Admin/Config are route-guarded directly; the earlier
  QMS-core pages currently rely on nav-item gating only (see `src/components/layout/nav.ts`) -
  match whichever pattern the page's blast radius calls for when adding a new one, but prefer
  route-guarding for anything with create/edit actions.
- **Nav structure** (`src/components/layout/nav.ts`) - grouped sections, each item optionally
  gated by a `permission`; omit `permission` only for pages everyone should see (e.g. Settings):

  ```
  Overview        → Dashboard
  Quality Mgmt.   → QMS Documents, Specifications
  Production      → Process Check Sheets
  Supply Chain    → Purchase, Stores
  Finance         → Accounts, Ledgers
  Admin           → Settings, Users & Access, Developer Config
  ```

- **Adding a page:** create it under `src/pages/`, add its route in `App.tsx` (wrapped in
  `RequirePermission` if it needs gating), add a `NavItem` under the right `NavGroup` in
  `nav.ts`, and - if it introduces new data - a permission entry per §3 plus a `repository.ts`
  seam per §2.
- **In-page gating:** beyond the route guard, individual actions (New/Save buttons, editable
  fields) check `hasPermission('module:create' | 'module:edit')` from `useAccess()`
  (`src/context/AccessContext.tsx`) - see `Purchase.tsx`'s `canCreate`/`canEdit`/`editable`
  pattern, which every CRUD module follows.
