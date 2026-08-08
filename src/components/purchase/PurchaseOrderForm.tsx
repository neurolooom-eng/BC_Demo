import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { FormField } from '../ui/FormField'
import { Button } from '../ui/Button'
import { PURCHASE_ORDER_STATUS_OPTIONS } from '../../data/options'
import { amountInWords } from '../../lib/numberToWords'
import type { MaterialRequisition, PurchaseOrderDoc, PurchaseOrderItem, PurchaseOrderStatus } from '../../types/business'
import { blankPoItem, itemFromRequisition } from './emptyPurchaseOrder'
import { itemAmount, itemLineTotal, itemTaxAmount, poTotals } from './poTotals'

interface Props {
  po: PurchaseOrderDoc
  onChange: (po: PurchaseOrderDoc) => void
  readOnly?: boolean
  availableRequisitions: MaterialRequisition[]
}

function money(n: number) {
  return `₹${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

export function PurchaseOrderForm({ po, onChange, readOnly, availableRequisitions }: Props) {
  const [pickedMrId, setPickedMrId] = useState('')
  const { subtotal, totalTax, netAmount } = poTotals(po)

  function updateItem(id: string, patch: Partial<PurchaseOrderItem>) {
    onChange({ ...po, items: po.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) })
  }

  function removeItem(id: string) {
    onChange({ ...po, items: po.items.filter((i) => i.id !== id) })
  }

  function addFromRequisition() {
    const mr = availableRequisitions.find((m) => m.id === pickedMrId)
    if (!mr) return
    onChange({ ...po, items: [...po.items, itemFromRequisition(mr)] })
    setPickedMrId('')
  }

  function addBlankItem() {
    onChange({ ...po, items: [...po.items, blankPoItem()] })
  }

  return (
    <div className="space-y-4">
      <fieldset className="card grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
        <legend className="mb-2 px-1 text-sm font-semibold text-primary">PO Header</legend>
        <FormField label="PO Number" required value={po.poNumber} readOnly={readOnly} onChange={(v) => onChange({ ...po, poNumber: String(v) })} placeholder="PO-2026-0XX" />
        <FormField label="PO Date" type="date" required value={po.poDate} readOnly={readOnly} onChange={(v) => onChange({ ...po, poDate: String(v) })} />
        <FormField label="Vendor Name" required value={po.vendorName} readOnly={readOnly} onChange={(v) => onChange({ ...po, vendorName: String(v) })} />
        <FormField label="Vendor GSTIN" value={po.vendorGstin} readOnly={readOnly} onChange={(v) => onChange({ ...po, vendorGstin: String(v) })} placeholder="33AAACB1234A1Z5" />
        <FormField label="Quote Ref No." value={po.quoteRefNo} readOnly={readOnly} onChange={(v) => onChange({ ...po, quoteRefNo: String(v) })} />
        <FormField label="Status" type="select" required value={po.status} options={PURCHASE_ORDER_STATUS_OPTIONS} readOnly={readOnly} onChange={(v) => onChange({ ...po, status: v as PurchaseOrderStatus })} />
        <FormField label="Vendor Address" type="textarea" span={2} value={po.vendorAddress} readOnly={readOnly} onChange={(v) => onChange({ ...po, vendorAddress: String(v) })} />
        <FormField label="Billing Address" type="textarea" value={po.billingAddress} readOnly={readOnly} onChange={(v) => onChange({ ...po, billingAddress: String(v) })} />
        <FormField label="Shipping Address" type="textarea" value={po.shippingAddress} readOnly={readOnly} onChange={(v) => onChange({ ...po, shippingAddress: String(v) })} />
        <FormField label="Requested By" required value={po.requestedBy} readOnly={readOnly} onChange={(v) => onChange({ ...po, requestedBy: String(v) })} />
      </fieldset>

      <fieldset className="card p-4">
        <legend className="mb-2 px-1 text-sm font-semibold text-primary">Items</legend>

        {!readOnly && (
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <select className="select max-w-xs" value={pickedMrId} onChange={(e) => setPickedMrId(e.target.value)}>
              <option value="">— Select a Material Requisition —</option>
              {availableRequisitions.map((mr) => (
                <option key={mr.id} value={mr.id}>
                  {mr.mrNo} - {mr.partNo} - {mr.partDescription} ({mr.quantity} {mr.unit})
                </option>
              ))}
            </select>
            <Button variant="outline" icon={<Plus className="h-3.5 w-3.5" />} onClick={addFromRequisition} disabled={!pickedMrId}>
              Add from Requisition
            </Button>
            <Button variant="outline" icon={<Plus className="h-3.5 w-3.5" />} onClick={addBlankItem}>
              Add Item
            </Button>
          </div>
        )}

        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-2">
              <tr>
                {['Part No', 'Description', 'Qty', 'Unit', 'Rate (₹)', 'Tax %', 'Amount', 'Tax Amt', 'Line Total'].map((h) => (
                  <th key={h} className="whitespace-nowrap px-2 py-1.5 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    {h}
                  </th>
                ))}
                {!readOnly && <th className="w-8" />}
              </tr>
            </thead>
            <tbody>
              {po.items.map((it) => (
                <tr key={it.id} className="border-t border-border">
                  <td className="px-2 py-1">
                    <input className="input py-1" value={it.partNo} disabled={readOnly} onChange={(e) => updateItem(it.id, { partNo: e.target.value })} />
                  </td>
                  <td className="min-w-[180px] px-2 py-1">
                    <input className="input py-1" value={it.description} disabled={readOnly} onChange={(e) => updateItem(it.id, { description: e.target.value })} />
                  </td>
                  <td className="px-2 py-1">
                    <input className="input py-1" type="number" value={it.quantity} disabled={readOnly} onChange={(e) => updateItem(it.id, { quantity: e.target.valueAsNumber || 0 })} />
                  </td>
                  <td className="px-2 py-1">
                    <input className="input py-1" value={it.unit} disabled={readOnly} onChange={(e) => updateItem(it.id, { unit: e.target.value })} />
                  </td>
                  <td className="px-2 py-1">
                    <input className="input py-1" type="number" value={it.rate} disabled={readOnly} onChange={(e) => updateItem(it.id, { rate: e.target.valueAsNumber || 0 })} />
                  </td>
                  <td className="px-2 py-1">
                    <input className="input py-1" type="number" value={it.taxPercent} disabled={readOnly} onChange={(e) => updateItem(it.id, { taxPercent: e.target.valueAsNumber || 0 })} />
                  </td>
                  <td className="whitespace-nowrap px-2 py-1 text-text">{money(itemAmount(it))}</td>
                  <td className="whitespace-nowrap px-2 py-1 text-text">{money(itemTaxAmount(it))}</td>
                  <td className="whitespace-nowrap px-2 py-1 font-medium text-text">{money(itemLineTotal(it))}</td>
                  {!readOnly && (
                    <td className="px-2 py-1">
                      <button type="button" onClick={() => removeItem(it.id)} className="rounded p-1 text-muted hover:bg-danger/10 hover:text-danger">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {po.items.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-2 py-6 text-center text-sm text-muted">
                    No items yet - add one from a Material Requisition or as a blank item.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </fieldset>

      <fieldset className="card grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
        <legend className="mb-2 px-1 text-sm font-semibold text-primary">Totals & Sign-off</legend>
        <FormField label="Subtotal (₹)" value={subtotal} readOnly disabled onChange={() => {}} />
        <FormField label="Total Tax (₹)" value={totalTax} readOnly disabled onChange={() => {}} />
        <FormField label="Additional Charges (₹)" type="number" value={po.additionalCharges} readOnly={readOnly} onChange={(v) => onChange({ ...po, additionalCharges: Number(v) })} />
        <FormField label="Net Amount (₹)" value={netAmount} readOnly disabled onChange={() => {}} />
        <FormField label="Amount in Words" type="textarea" span={2} value={amountInWords(netAmount)} readOnly disabled onChange={() => {}} />
        <FormField label="Authorized Signatory" type="signature" value={po.authorizedSignatory} readOnly={readOnly} onChange={(v) => onChange({ ...po, authorizedSignatory: String(v) })} />
      </fieldset>
    </div>
  )
}
