# Google Sheets backend

The app's data layer (`src/data/repository.ts`) talks to a Google Sheet through
a small Apps Script Web App (`Code.gs`) instead of a hosted database - this
keeps the whole stack free to run and host on GitHub Pages.

## 1. Create the spreadsheet

Create a new Google Sheet with **eleven tabs**, named exactly as below, each
with a header row (row 1) with these exact column names:

### `Specifications`

```
id  category  parameter  allowedValues  min  max  unit
```

### `Documents`

```
id  code  title  type  status  version  owner  revisionDate  nextReviewDate
```

### `CheckSheets`

```
id  line  date  shift  furnaceNo  metalGrade  degassingGas  bestCastAlloy  otherAlloy  status  readings  machineReadings  corePinChecks  corePinComment  diePrep  signatures
```

The last five `CheckSheets` columns (`readings`, `machineReadings`,
`corePinChecks`, `diePrep`, `signatures`) hold **JSON text**, not a flat
value - the frontend serialises/parses these before sending or after
receiving (see `NESTED_FIELDS` in `src/data/repository.ts`). Leave them as
plain text cells in Sheets.

### `MaterialRequisitions`

```
id  mrNo  partNo  partDescription  quantity  unit  department  location  requestedBy  requestDate  status
```

### `PurchaseOrders`

```
id  poNumber  poDate  vendorName  vendorAddress  vendorGstin  quoteRefNo  billingAddress  shippingAddress  items  additionalCharges  authorizedSignatory  status  requestedBy
```

The `items` column holds **JSON text** (an array of `{ id, mrId?, partNo, description, quantity, unit, rate, taxPercent }`)
- like `CheckSheets`, the frontend serialises/parses it (see `jsonFieldResource` in
`src/data/repository.ts`). Rate/tax/amount math (line amount, tax amount, subtotal,
total tax, net amount, amount-in-words) is all computed client-side from these
items and never stored as separate columns.

### `StoreItems`

```
id  itemCode  itemName  category  unitOfMeasure  quantityInStock  reorderLevel  unitCost  location  lastUpdated
```

### `StockInEntries`

```
id  transactionNo  itemCode  itemName  quantity  source  receivedBy  date  remarks
```

### `StockOutEntries`

```
id  transactionNo  itemCode  itemName  quantity  purpose  issuedTo  issuedBy  date  remarks
```

### `StockTransferEntries`

```
id  transactionNo  itemCode  itemName  quantity  fromLocation  toLocation  transferredBy  date  remarks
```

Saving a Stock In/Out/Transfer entry in the app also updates the matching
`StoreItems` row's `quantityInStock` (and `location`, for transfers) - see
`StockInTab.tsx`/`StockOutTab.tsx`/`StockTransferTab.tsx`. This POC tracks one
location per item, so a transfer overwrites the item's location rather than
splitting quantity across multiple locations.

### `AccountVouchers`

```
id  voucherNo  type  party  amount  voucherDate  dueDate  status  paymentMode  reference
```

### `LedgerAccounts`

```
id  accountCode  accountName  group  openingBalance  debit  credit  asOfDate
```

All of these except `CheckSheets` and `PurchaseOrders` are flat records (no
JSON-text columns) - they go through the Sheets API as plain rows.

You can seed the sheets with the data already in `src/data/*.ts` (export
those arrays as CSV, or leave the tabs empty to start recording live).

## 2. Attach the script

1. In the Sheet, open **Extensions > Apps Script**.
2. Delete the placeholder `Code.gs` content and paste in this repo's
   `google-apps-script/Code.gs`.
3. Click **Deploy > New deployment**.
4. Type: **Web app**. Execute as: **Me**. Who has access: **Anyone**.
5. Deploy, authorize the requested permissions, and copy the Web App URL
   (ends in `/exec`).

## 3. Point the frontend at it

Two ways to configure the exec URL - use whichever fits:

**Build-time (env var)** - set it as an environment variable when building:

```bash
# .env (local dev) - see .env.example
VITE_SHEETS_API_URL=https://script.google.com/macros/s/XXXXXXXX/exec
```

For the GitHub Pages deployment, add it as a repository variable
(**Settings > Secrets and variables > Actions > Variables**) named
`VITE_SHEETS_API_URL` - the deploy workflow (`.github/workflows/deploy-pages.yml`)
passes it through as a build-time env var.

**Runtime (Config page)** - anyone in the `Developer` or `Administrator` group
can open **Developer Config** in the app's sidebar and paste the exec URL
(plus optionally a spreadsheet ID and custom tab names) without a rebuild or
redeploy - useful after re-deploying the script, since "New deployment"
mints a new `/exec` URL. This is stored in the browser's localStorage and
takes priority over the build-time env var. It also has a **Test Connection**
button that calls each configured tab and reports success/failure live.

If neither is set, the app runs entirely on its bundled mock data (no
backend needed) - useful for demos or before the sheet is ready.

### Multiple spreadsheets from one deployment

`Code.gs` accepts an optional `spreadsheetId` (query param on GET, body field
on POST) and opens that spreadsheet via `SpreadsheetApp.openById` instead of
the one the script is bound to. The Config page's "Spreadsheet ID" field
sets this - leave it blank to use the bound spreadsheet (the common case).

## Notes / limitations (POC)

- No auth on the Web App beyond "Anyone with the link can call it" - anyone
  who has the URL can read/append rows. Fine for a pilot; put real auth
  (e.g. a shared secret query param checked in `doGet`/`doPost`, or moving to
  a real backend) in front of it before wider rollout.
- `update` only supports updating an existing row matched by `id`; there is
  no delete endpoint since no UI currently needs one.
- Apps Script Web Apps don't support CORS preflight, so the client
  (`src/lib/sheetsClient.ts`) sends POST bodies as `text/plain` to keep
  requests "simple" (no preflight) and parses the JSON server-side anyway.
