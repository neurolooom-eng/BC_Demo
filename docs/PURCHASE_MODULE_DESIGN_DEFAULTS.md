# Purchase Module - Design Defaults

Module-specific spec for **Purchase** (`/purchase`, `src/pages/Purchase.tsx`). Builds on the
app-wide design system in [`DESIGN_DEFAULTS.md`](./DESIGN_DEFAULTS.md) - tokens, `.card`/`.input`
primitives, `DataTable`, `Drawer`, `FormField` and `StatusChip` all come from there. This file
covers what's specific to Purchase: its two-tab flow, data model, computed totals and print
layout.

---

## 1. Concept

Purchase models a real procurement flow as **two linked documents**, not one flat PO list:

1. **Material Requisitions (MR)** - a floor/department's request for a part/material
   (part no, qty, department, location). Lightweight, single-status record.
2. **Purchase Orders (PO)** - a vendor-facing header/line-item document. Its line items are
   either pulled in from an **Approved** MR (for traceability back to who asked for it) or
   added blank for anything not requisitioned.

Saving a PO whose items reference MRs flips those MRs' status to **Converted to PO**
(`src/pages/Purchase.tsx` → `savePo()`), so a requisition can't be silently pulled into two
POs and Store/Purchase staff can see at a glance what's already on order.

---

## 2. Data model (`src/types/business.ts`)

```ts
type RequisitionStatus = 'Pending' | 'Approved' | 'Converted to PO' | 'Rejected'

interface MaterialRequisition {
  id: string; mrNo: string; partNo: string; partDescription: string
  quantity: number; unit: string; department: string; location: string
  requestedBy: string; requestDate: string; status: RequisitionStatus
}

type PurchaseOrderStatus = 'draft' | 'approved' | 'ordered' | 'received' | 'cancelled'

interface PurchaseOrderItem {
  id: string; mrId?: string          // set when pulled from a Material Requisition
  partNo: string; description: string
  quantity: number; unit: string; rate: number; taxPercent: number
}

interface PurchaseOrderDoc {
  id: string; poNumber: string; poDate: string
  vendorName: string; vendorAddress: string; vendorGstin: string; quoteRefNo: string
  billingAddress: string; shippingAddress: string
  items: PurchaseOrderItem[]; additionalCharges: number
  authorizedSignatory: string; status: PurchaseOrderStatus; requestedBy: string
}
```

Mock/seed data: `src/data/materialRequisitions.ts`, `src/data/purchaseOrders.ts`. Persistence
goes through `loadMaterialRequisitions` / `saveMaterialRequisition` / `updateMaterialRequisition`
and the equivalent PO functions in `src/data/repository.ts` (Sheets-or-mock, per the app-wide
pattern - see [`PREFERENCES.md`](./PREFERENCES.md) §2).

---

## 3. Page layout

- **Header:** icon box (`rounded-lg bg-primary/10 p-2 text-primary`, `ShoppingCart` icon) + title
  + one-line description - the standard module header pattern.
- **Tab switcher:** `Material Requisitions` / `Purchase Orders`, a segmented control -
  `inline-flex rounded-md border border-border bg-surface p-1`, active tab
  `bg-primary/12 text-primary`, inactive `text-muted hover:text-text`. Local `useState`, no
  routing - both tabs share the page's permission gate.
- **Per-tab action row:** right-aligned `New Requisition` / `New Purchase Order` button, gated
  on `purchase:create`.
- **Tables:** each tab is its own `DataTable` with its own `tableKey` (`material-requisitions`,
  `purchase-orders`) so column widths/order/visibility are remembered independently. Give the
  table a `key` matching `tableKey` when two tables can mount in the same tab position, so React
  doesn't reuse internal state across them.

### Requisitions table columns
`MR No. · Part No · Description · Qty (value + unit) · Department · Location · Requested By ·
Date · Status`

### Purchase Orders table columns
`PO Number · Date · Vendor · Items (count) · Net Amount (₹, computed) · Status · Requested By`

---

## 4. Requisition drawer (single-section form)

Standard `Drawer` (not `wide`) with one `fieldset.card` section, "Requisition Details":
MR No., Status (`type="status"`), Part No, Part Description, Quantity, Unit, Department
(`type="select"`, `DEPARTMENT_OPTIONS`), Location, Requested By, Request Date. Footer:
`Cancel/Close` + `Save`/`Save Changes` (only when `purchase:create` or `purchase:edit`).

**Status tones** (table + drawer chip): `Rejected → danger`, `Converted to PO → success`,
`Approved → info`, `Pending → neutral`.

---

## 5. Purchase Order drawer - header/line-item form

Uses `wide` Drawer (`max-w-5xl`, per the rich multi-section form convention) and a dedicated
`PurchaseOrderForm` component (`src/components/purchase/PurchaseOrderForm.tsx`) with **three
stacked `fieldset.card` sections**:

1. **PO Header** - PO Number, PO Date, Vendor Name, Vendor GSTIN, Quote Ref No., Status
   (`select`), Vendor Address (`textarea`, span 2), Billing Address, Shipping Address, Requested
   By.
2. **Items** - an editable line-item table (not `DataTable` - a plain `<table>` since rows are
   inline-editable, not a browsable dataset):
   - Toolbar (hidden when read-only): a `<select>` of **Approved, not-yet-used** requisitions
     (`availableRequisitions` - filtered in `Purchase.tsx` to `status === 'Approved'` and not
     already referenced by an item on this PO) + **Add from Requisition** + **Add Item** (blank
     row) buttons.
   - Columns: Part No, Description, Qty, Unit, Rate (₹), Tax %, Amount, Tax Amt, Line Total
     (last three computed, not editable), plus a trash-icon delete column when editable.
   - Empty state: centered muted row, "No items yet - add one from a Material Requisition or as
     a blank item."
3. **Totals & Sign-off** - Subtotal, Total Tax, Additional Charges (editable number), Net Amount
   (all `₹`, computed fields `readOnly disabled`), **Amount in Words** (`textarea`, span 2,
   computed via `amountInWords()`, `src/lib/numberToWords.ts`), Authorized Signatory
   (`type="signature"` control per the app-wide form system).

Footer adds a third action next to Cancel/Save: **Print Preview** (outline button, `Printer`
icon) - shown once the PO exists (not on a brand-new unsaved one).

### Computed totals (`src/components/purchase/poTotals.ts`)

```ts
itemAmount    = quantity * rate
itemTaxAmount = itemAmount * (taxPercent / 100)
itemLineTotal = itemAmount + itemTaxAmount

subtotal   = Σ itemAmount over items
totalTax   = Σ itemTaxAmount over items
netAmount  = subtotal + totalTax + additionalCharges
```

Never store computed totals on the record - always derive them from `items` +
`additionalCharges` via `poTotals()` / `itemAmount()` / `itemTaxAmount()` / `itemLineTotal()`,
both on the table (`Net Amount` column) and in the form, so they can never drift out of sync
with the line items.

---

## 6. Print preview (`PurchaseOrderPrint.tsx`)

A print-formatted, read-only render of the same `PurchaseOrderDoc` opened in its own `wide`
Drawer, triggered from the PO drawer's **Print Preview** button. Footer: `Close` + `Print`
(calls `window.print()`). Lays out company header, vendor/billing/shipping blocks, the item
table, totals block and signatory - styled for A4 output rather than screen density (larger
type, no interactive controls, print-safe borders instead of card shadows).

---

## 7. Access control

Permissions: `purchase:view` (route-gates `/purchase` via `RequirePermission`),
`purchase:create`, `purchase:edit` (`src/lib/permissions.ts`). `editable = canCreate || canEdit`
governs both the MR and PO drawers - creating a brand-new record only needs `purchase:create`;
editing an existing one needs `purchase:edit`. Default groups with Purchase access: `Purchase
Officer` (view/create/edit + Stores view), `Store Keeper` (view only), `Accountant` (view only),
`Administrator` (everything), `Viewer` (view only). Full matrix lives in `src/data/groups.ts` and
is editable live from **Admin → Groups & Permissions** - see
[`PREFERENCES.md`](./PREFERENCES.md) §3.

---

## 8. Conventions to keep when extending this module

- New PO fields go in `PurchaseOrderDoc`/`PurchaseOrderItem` (`src/types/business.ts`) with a
  matching field in `emptyPurchaseOrder()` and `blankPoItem()`
  (`src/components/purchase/emptyPurchaseOrder.ts`) - never let a "new" record start with a
  field the type declares as required but leaves `undefined`.
- Any new money figure must be **computed**, not stored, and routed through `poTotals.ts` so the
  table, form and print preview stay in lock-step.
- Requisition → PO linkage is one-directional and one-shot by construction: once an MR's `id`
  appears in some PO's `items[].mrId`, `availableRequisitions` excludes it from every other PO's
  picker. If a future change needs to *unlink* (e.g. deleting a line item should free the MR
  again), that's a real gap today - the MR stays `Converted to PO` even if its line is later
  removed from the PO.
- Keep both tabs' tables on independent `tableKey`s; don't collapse MR and PO columns into one
  `DataTable` even if a shared list view looks tempting - they have unrelated column sets and
  independent user column customizations.
