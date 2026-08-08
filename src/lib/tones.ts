import type { Tone } from '../components/ui/StatusChip'
import type { CheckSheetStatus, DocumentStatus, OkNotOk } from '../types/domain'
import type { PurchaseOrderStatus, StoreItem, VoucherStatus } from '../types/business'

export const checkSheetStatusTone: Record<CheckSheetStatus, Tone> = {
  draft: 'neutral',
  submitted: 'info',
  approved: 'success',
}

export const documentStatusTone: Record<DocumentStatus, Tone> = {
  draft: 'neutral',
  'in-review': 'info',
  approved: 'success',
  obsolete: 'danger',
}

export const okNotOkTone: Record<OkNotOk, Tone> = {
  OK: 'success',
  'NOT OK': 'danger',
}

export const purchaseOrderStatusTone: Record<PurchaseOrderStatus, Tone> = {
  draft: 'neutral',
  approved: 'info',
  ordered: 'primary',
  received: 'success',
  cancelled: 'danger',
}

export const voucherStatusTone: Record<VoucherStatus, Tone> = {
  Pending: 'info',
  Paid: 'success',
  Overdue: 'danger',
  Cancelled: 'neutral',
}

export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock'

export function stockStatus(item: Pick<StoreItem, 'quantityInStock' | 'reorderLevel'>): StockStatus {
  if (item.quantityInStock <= 0) return 'Out of Stock'
  if (item.quantityInStock <= item.reorderLevel) return 'Low Stock'
  return 'In Stock'
}

export const stockStatusTone: Record<StockStatus, Tone> = {
  'In Stock': 'success',
  'Low Stock': 'warning',
  'Out of Stock': 'danger',
}
