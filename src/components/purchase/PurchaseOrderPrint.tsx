import { COMPANY } from '../../data/company'
import { amountInWords } from '../../lib/numberToWords'
import { assetUrl } from '../../lib/assetUrl'
import type { PurchaseOrderDoc } from '../../types/business'
import { itemAmount, itemLineTotal, itemTaxAmount, poTotals } from './poTotals'

function money(n: number) {
  return `Rs. ${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

export function PurchaseOrderPrint({ po }: { po: PurchaseOrderDoc }) {
  const { subtotal, totalTax, netAmount } = poTotals(po)

  return (
    <div id="print-area" className="mx-auto max-w-3xl bg-white p-8 text-black">
      <div className="mb-6 flex items-center justify-between border-b border-black/20 pb-4">
        <div className="flex items-center gap-3">
          <img src={assetUrl('/logo-mark.png')} alt="Best Cast" className="h-10 w-auto" />
          <div>
            <p className="text-lg font-bold">{COMPANY.legalName}</p>
            <p className="text-xs text-black/70">{COMPANY.headquarters}</p>
            <p className="text-xs text-black/70">{COMPANY.email} · {COMPANY.website}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold uppercase tracking-wide">Purchase Order</p>
          <p className="text-sm">{po.poNumber}</p>
          <p className="text-sm">{po.poDate}</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase text-black/60">Vendor</p>
          <p className="font-medium">{po.vendorName}</p>
          <p className="whitespace-pre-line text-black/80">{po.vendorAddress}</p>
          {po.vendorGstin && <p className="text-black/80">GSTIN: {po.vendorGstin}</p>}
          {po.quoteRefNo && <p className="text-black/80">Quote Ref: {po.quoteRefNo}</p>}
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase text-black/60">Billing Address</p>
          <p className="whitespace-pre-line text-black/80">{po.billingAddress}</p>
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase text-black/60">Shipping Address</p>
          <p className="whitespace-pre-line text-black/80">{po.shippingAddress}</p>
        </div>
      </div>

      <table className="mb-4 w-full border-collapse text-sm">
        <thead>
          <tr className="border-y border-black/30 bg-black/5">
            <th className="px-2 py-1.5 text-left">Part No</th>
            <th className="px-2 py-1.5 text-left">Description</th>
            <th className="px-2 py-1.5 text-right">Qty</th>
            <th className="px-2 py-1.5 text-left">Unit</th>
            <th className="px-2 py-1.5 text-right">Rate</th>
            <th className="px-2 py-1.5 text-right">Amount</th>
            <th className="px-2 py-1.5 text-right">Tax %</th>
            <th className="px-2 py-1.5 text-right">Tax Amt</th>
            <th className="px-2 py-1.5 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {po.items.map((it) => (
            <tr key={it.id} className="border-b border-black/10">
              <td className="px-2 py-1.5">{it.partNo}</td>
              <td className="px-2 py-1.5">{it.description}</td>
              <td className="px-2 py-1.5 text-right">{it.quantity}</td>
              <td className="px-2 py-1.5">{it.unit}</td>
              <td className="px-2 py-1.5 text-right">{money(it.rate)}</td>
              <td className="px-2 py-1.5 text-right">{money(itemAmount(it))}</td>
              <td className="px-2 py-1.5 text-right">{it.taxPercent}%</td>
              <td className="px-2 py-1.5 text-right">{money(itemTaxAmount(it))}</td>
              <td className="px-2 py-1.5 text-right font-medium">{money(itemLineTotal(it))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mb-6 flex justify-end">
        <table className="w-64 text-sm">
          <tbody>
            <tr>
              <td className="py-0.5 text-black/70">Subtotal</td>
              <td className="py-0.5 text-right">{money(subtotal)}</td>
            </tr>
            <tr>
              <td className="py-0.5 text-black/70">Total Tax</td>
              <td className="py-0.5 text-right">{money(totalTax)}</td>
            </tr>
            <tr>
              <td className="py-0.5 text-black/70">Additional Charges</td>
              <td className="py-0.5 text-right">{money(po.additionalCharges)}</td>
            </tr>
            <tr className="border-t border-black/30 font-bold">
              <td className="py-1">Net Amount</td>
              <td className="py-1 text-right">{money(netAmount)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mb-8 text-sm italic text-black/80">Amount in Words: {amountInWords(netAmount)}</p>

      <div className="flex justify-between text-sm">
        <div>
          <p className="text-black/70">Requested By</p>
          <p className="mt-8 border-t border-black/30 pt-1">{po.requestedBy}</p>
        </div>
        <div>
          <p className="text-black/70">Authorized Signatory</p>
          <p className="mt-8 border-t border-black/30 pt-1">{po.authorizedSignatory || '—'}</p>
        </div>
      </div>
    </div>
  )
}
