import type { PurchaseOrderDoc, PurchaseOrderItem } from '../../types/business'

export function itemAmount(item: PurchaseOrderItem) {
  return item.quantity * item.rate
}

export function itemTaxAmount(item: PurchaseOrderItem) {
  return itemAmount(item) * (item.taxPercent / 100)
}

export function itemLineTotal(item: PurchaseOrderItem) {
  return itemAmount(item) + itemTaxAmount(item)
}

export function poTotals(po: PurchaseOrderDoc) {
  const subtotal = po.items.reduce((sum, i) => sum + itemAmount(i), 0)
  const totalTax = po.items.reduce((sum, i) => sum + itemTaxAmount(i), 0)
  const netAmount = subtotal + totalTax + po.additionalCharges
  return { subtotal, totalTax, netAmount }
}
