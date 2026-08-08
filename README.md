# Best Cast e-QMS

A web-based Quality Management System for **Best Cast IT Limited** ([bestcastgroup.com](https://bestcastgroup.com/)),
built around the production line and expanded with lighter supply-chain/finance modules:

- **QMS Documents** - quality manual, SOPs, work instructions and controlled formats
- **Production Line Docs** - master specifications & tolerances for the die-casting process
- **Production Line Records** - digital shift-wise process check sheets (QC FMT 038), with a
  full draft → submitted → approved lifecycle (see below)
- **Purchase** - **Material Requisitions** (part no/description/qty/dept/location) that an
  approved requisition can be pulled into a **Purchase Order**: vendor/GST/quote-ref header,
  billing/shipping addresses, a line-item table (rate/qty/tax %) with computed amount/tax/line
  total, totals (subtotal/total tax/additional charges/net amount), amount-in-words, an
  authorized-signatory field, and a print preview
- **Stores** - four tabs: **Stock Levels** (computed status In Stock / Low Stock / Out of
  Stock), **Stock In**, **Stock Out** (blocks over-issuing past what's in stock) and
  **Stock Transfer** - each receipt/issue/transfer also updates the item's quantity (and
  location, for transfers) on Stock Levels
- **Accounts** - purchase/sales invoices, payments and receipts (vouchers)
- **Ledgers** - chart of accounts with running (debit/credit-normal aware) balances

The QMS core is a **proof-of-concept** built from two source spreadsheets supplied for the
pilot: `Tolerances_updated_.xlsx` (process specification/tolerance master) and
`Master_Cpy_Process_Check_sheet.xlsx_Update.xlsx` (the Mando Model Line shift check sheet,
QC FMT 038 Rev.10), digitised into `src/data/specifications.ts` and `src/data/checkSheets.ts` /
`src/types/domain.ts`. Purchase/Stores/Accounts/Ledgers are illustrative mock data
(`src/types/business.ts`, `src/data/purchaseOrders.ts` etc.) following the same patterns, not
sourced from a specific spreadsheet.

## Stack

React 19 + TypeScript + Vite + Tailwind CSS v3, `@tanstack/react-table`, `recharts`,
`lucide-react`, `clsx`, `react-router-dom` - per [`docs/DESIGN_DEFAULTS.md`](./docs/DESIGN_DEFAULTS.md),
the design-system spec this app was built against. **Keep that file (and this README) up to
date as the app evolves** - `docs/DESIGN_DEFAULTS.md` is the source of truth for tokens,
components and conventions; every module should reuse its primitives rather than introducing
new colors/spacing/components ad hoc.

**Hosting & backend:** this is a static site (no server of its own) - it deploys to
**GitHub Pages** and persists data to a **Google Sheet** through a small Google Apps Script
Web App acting as a JSON API. See [Hosting on GitHub Pages](#hosting-on-github-pages) and
[Google Sheets backend](#google-sheets-backend) below.

## Branding

`bestcastgroup.com` couldn't be reached from the build environment (network egress policy),
so the real logo/colors were supplied directly instead. The default theme (`bestcast-light` /
`bestcast-dark` in `src/styles/themes.css`) is extracted pixel-for-pixel from the real logo:
navy `#09025E`, teal `#177562`, orange `#E68440`. Four supplementary palettes (ocean, midnight,
emerald, high-contrast) round out the theme picker.

- `public/logo.png` - full logo lockup (icon + "BEST CAST" wordmark), used on the Settings page.
- `public/logo-mark.png` - the icon alone, used in the sidebar/favicon. The sidebar's "BEST
  CAST" text is rendered as real (theme-aware) text, not part of the image - the logo file's
  wordmark is fixed dark-navy pixels, which would be illegible on the dark theme.
- `public/favicon.png` - generated from the icon mark.

Every color in the app is a semantic CSS-variable token (`bg-primary`, `text-muted`, ...), so
retuning the palette further is a one-file edit to `src/styles/themes.css`.

**Referencing files in `public/` from code:** always go through `assetUrl()`
(`src/lib/assetUrl.ts`), never a bare `/logo.png`-style root-absolute path. Vite only rewrites
asset paths it can see statically in `index.html`; a path baked into a runtime string in a
`.tsx` file is invisible to it, so on GitHub Pages (served from `/Bestcast/`, not the domain
root) a bare `/logo.png` 404s - `assetUrl()` prefixes it with `import.meta.env.BASE_URL` so it
resolves under whatever path the app is actually served from.

Full company profile (legal/brand name, HQ, leadership, applicable standards - ISO 9001:2015 /
IATF 16949:2016 - core methodologies and industries served) lives in `src/data/company.ts` and
is displayed on the Settings page.

## Running locally

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-checks, bumps the build ID, and produces dist/
npm run preview   # serve the production build locally
```

Copy `.env.example` to `.env` and set `VITE_SHEETS_API_URL` to point at a real backend
(see below); without it, the app runs on its bundled mock data.

## Hosting on GitHub Pages

The app is built as a static site and deploys via
[`.github/workflows/deploy-pages.yml`](./.github/workflows/deploy-pages.yml), which builds
with Vite and publishes `dist/` to GitHub Pages on every push to `main` (or manually via
"Run workflow"). One-time repo setup: **Settings > Pages > Source: GitHub Actions**.

Two things make this work without a server:

- **Relative asset base** (`base: './'` in `vite.config.ts`) so the build works from a project
  page path (`https://<user>.github.io/<repo>/`) without hardcoding the repo name.
- **`HashRouter`** (not `BrowserRouter`) in `src/App.tsx` - GitHub Pages has no server-side
  rewrite rule to send deep links like `/documents` back to `index.html`, so routes live after
  a `#` (`/#/documents`) which always resolves to the single static `index.html`. A hard
  refresh on any page keeps working because of this.

To let the deployed build reach your Google Sheet, add a repository **variable** (not secret -
it's a public-facing URL) named `VITE_SHEETS_API_URL` under
**Settings > Secrets and variables > Actions > Variables**; the workflow passes it through as
a build-time env var.

## Google Sheets backend

There's no database - `src/data/repository.ts` reads/writes a Google Sheet through a Google
Apps Script Web App that exposes it as a small JSON API (`google-apps-script/Code.gs`).
Full setup steps (sheet schema per tab, deploying the script, wiring the URL) are in
[`google-apps-script/README.md`](./google-apps-script/README.md).

If `VITE_SHEETS_API_URL` isn't set, every loader in `repository.ts` falls back to the bundled
mock arrays in `src/data/*.ts`, and it also falls back automatically if a configured Sheets
API call fails - so a broken or unset backend degrades to the demo data instead of breaking
the page.

## Users & access (RBAC)

There's no real login yet (see scope notes below) - instead, **Users & Access** under Admin
(`/admin`, gated to the `admin:access` permission) lets you manage:

- **Users** - name, email, and which Group they belong to.
- **Groups & Permissions** - a matrix of view/create/edit/approve permissions per module
  (Dashboard, QMS Documents, Specifications, Process Check Sheets, Purchase, Stores, Accounts,
  Ledgers, Admin, Developer), toggled live per group.

Seeded groups: `Administrator` (everything), `Developer` (view + Developer Config only),
`Quality Manager` (documents/specifications + check sheet review), `Shift Supervisor`
(check sheet entry), `Operator` (check sheet entry only), `Purchase Officer` (purchase orders),
`Store Keeper` (inventory), `Accountant` (vouchers + ledgers), `Viewer` (read-only everywhere).
The sidebar nav, every module's create/edit buttons, and check sheet
approve/review actions are all gated by these permissions (`src/context/AccessContext.tsx`,
`src/components/RequirePermission.tsx`).

Since there's no backend auth, the topbar's user chip is a **"switch user"** menu (not a real
sign-in) so every group's gating can be demoed live - it persists the chosen user to
localStorage. Wire real authentication in front of this before production use.

## Process Check Sheet lifecycle

This is the flagship module, so its record lifecycle is enforced end to end rather than being
just a status label:

1. **Draft** - every new check sheet starts here. Editable by anyone with `checksheets:create`
   (Operator, Shift Supervisor, Administrator) - including adding/removing Shift Reading rows,
   which only appear when the record is actually editable (this is why earlier revisions looked
   like there was no way to add readings: once saved, records had no edit path at all).
2. Clicking **Send for Review** (shown only on an editable draft) moves it to **Submitted** -
   there's no free-form status dropdown; the `Record Status` field is a read-only chip, and the
   only way to change it is through this action.
3. **Submitted** - editable only by `checksheets:edit` holders (Shift Supervisor, Administrator)
   - the line supervisor reviewing/correcting the shift's entries. A Quality Manager
   (`checksheets:approve` but not `checksheets:edit`) sees it read-only and can only **Approve**.
4. **Approved** - locked for everyone, permanently. No further edits or actions are offered
   regardless of permission.

Clicking anywhere on a row in the Process Check Sheets table opens it (in edit or read-only
mode depending on the above), replacing the old separate "View" link. See
`canEditRecord()` in `src/pages/CheckSheets.tsx`.

## Developer Config page

**Developer Config** (`/config`, gated to the `config:access` permission - the `Developer` and
`Administrator` groups by default) lets a developer wire up and verify the Google Sheets
backend **without a rebuild or redeploy**:

- **Apps Script Exec URL** - overrides the build-time `VITE_SHEETS_API_URL` for this browser.
  Useful right after re-deploying the script, since Apps Script mints a new `/exec` URL on
  "New deployment".
- **Spreadsheet ID** (optional) - lets one script deployment serve more than one spreadsheet.
- **Sheet tab names** - in case the Google Sheet's tabs aren't named exactly `Specifications`
  / `Documents` / `CheckSheets`.
- **Test Connection** - calls each configured tab live and reports rows found / the exact
  error, so a broken deployment is diagnosable from the browser.
- A **Deployment** panel showing the current build ID/date and links to the repo's Actions
  runs and Pages settings.

These overrides are stored in `localStorage` (`src/lib/runtimeConfig.ts`) and take priority
over the build-time env var; `src/lib/sheetsClient.ts` resolves the effective URL/tab
name/spreadsheet ID on every request.

## Hard refresh

The topbar has a refresh icon (`src/components/layout/HardRefreshButton.tsx`) next to the
theme menu that clears any Cache Storage entries and reloads - useful right after a new GitHub
Pages deploy if the browser is showing a stale build.

## Responsive design

The layout is designed mobile-first and verified at mobile (390px), tablet (834px) and
desktop (1440px) widths:

- **Mobile**: sidebar becomes an off-canvas drawer opened via a hamburger button in the topbar;
  KPI/chart/table grids collapse to a single column; tables scroll horizontally inside their
  own container.
- **Tablet**: KPI cards wrap to 2 columns, chart cards to 1-2 columns.
- **Desktop**: full collapsible sidebar (icon-only or full width), 4-column KPI row,
  2-column chart grid.

## Build ID / footer

Every production build increments a numeric build ID via `scripts/generate-build-info.cjs`,
wired in as an npm `prebuild` hook. It reads/writes `src/build-info.json`
(`{ buildId, buildDate }`), which the footer (`src/components/layout/Footer.tsx`) and the
Settings page display alongside the copyright line. Running `npm run dev` does **not**
bump the counter - only `npm run build` does, so the number reflects real production builds.

In GitHub Actions (the Pages deploy workflow), the build ID is `GITHUB_RUN_NUMBER` instead -
it increments forever across pushes with no need to commit the counter file back to the repo.
Locally, it increments the `buildId` already committed in `src/build-info.json`.

## Project structure

```
src/
  components/
    ui/          Button, Card, FormField, StatusChip, KpiCard, ChartCard, DataTable, Drawer
    layout/      Sidebar, Topbar, Footer, ThemeMenu, UserChip, Logo, AppLayout, nav.ts
    checksheet/  CheckSheetForm + empty-record factory (shared by "new" and "view" drawers)
    purchase/    PurchaseOrderForm, PurchaseOrderPrint, poTotals.ts, emptyPurchaseOrder.ts
    stores/      StockLevelsTab, StockInTab, StockOutTab, StockTransferTab
    RequirePermission.tsx  Route/section guard by permission
  context/       ThemeContext (6 palettes) + AccessContext (users/groups/current user, RBAC)
  data/          repository.ts (Sheets-or-mock data layer), groups.ts/users.ts (RBAC seed),
                 mock arrays + dropdown options
  lib/           sheetsClient.ts (Apps Script fetch wrapper), runtimeConfig.ts (Config page
                 overrides), permissions.ts (permission catalog), useAsyncData, cn, id, tones
  types/         domain.ts (Specification, QmsDocument, CheckSheetRecord, ...), business.ts
                 (PurchaseOrder, StoreItem, AccountVoucher, LedgerAccount), access.ts
                 (Permission, Group, User)
  pages/         Dashboard, Documents, Specifications, CheckSheets, Purchase, Stores, Accounts,
                 Ledgers, Settings, Admin, Config
  styles/        themes.css (token definitions per theme)
docs/
  DESIGN_DEFAULTS.md                    The design-system spec this app implements
  PURCHASE_MODULE_DESIGN_DEFAULTS.md    Purchase module spec (MR/PO data model, form, print)
  PREFERENCES.md                        Git / backend / Admin / access & pages conventions
google-apps-script/
  Code.gs, README.md  The Google Sheets backend + its setup guide
scripts/
  generate-build-info.cjs
.github/workflows/
  deploy-pages.yml    Builds and publishes dist/ to GitHub Pages
```

## Data & scope notes (POC)

- Every module is built against typed domain models (`src/types/domain.ts`, `src/types/business.ts`)
  and reads/writes through `src/data/repository.ts`, so the UI is the same whether it's talking
  to the live Google Sheet or running on bundled mock data.
- Accounts/Ledgers are simpler single-status CRUD modules (no multi-stage approval lifecycle
  like Process Check Sheets) - a record is either creatable or, once it exists, editable per
  the module's `:edit` permission.
- Purchase and Stores do have some cross-module linking: saving a Purchase Order flips every
  Material Requisition used in its line items to `Converted to PO` (`savePo()` in
  `src/pages/Purchase.tsx`), and saving a Stock In/Out/Transfer entry updates the matching
  `StoreItem`'s `quantityInStock` (and `location`, for transfers) so Stock Levels reflects it
  immediately (`src/components/stores/StockInTab.tsx` etc.). This is still a POC simplification
  though - approving a PO doesn't auto-create an Accounts voucher, and each store item tracks
  only one location (a transfer overwrites it rather than splitting quantity across locations).
- No real authentication - group/permission gating (RBAC) is real and enforced in the UI, but
  "who you are" is a client-side "switch user" menu, not a login. The Apps Script Web App is
  also reachable by anyone with its URL (see the limitations note in
  `google-apps-script/README.md`).
- The Process Check Sheet form models the original spreadsheet's shift readings, per-machine
  readings, 10-cavity core-pin verification, die-prep start-up checks and sign-off section as
  repeatable rows/fields rather than the fixed 48-half-hour-column grid in the original Excel,
  so shifts of any length can be recorded without a fixed column count.

## Next steps for production

- Add real authentication (SSO/email+password) that resolves to one of the existing Groups,
  replacing the client-side "switch user" menu, and lock down the Apps Script endpoint
  (shared-secret param or a proper backend) before wider rollout - see the limitations note in
  `google-apps-script/README.md`.
- Replace the placeholder theme/logo with Best Cast's real brand assets once available.
- Add non-conformance/CAPA tracking and per-spec tolerance validation on check sheet entry.
- Add an audit trail / e-signature compliance layer for QMS records if regulatory sign-off
  requires it.
