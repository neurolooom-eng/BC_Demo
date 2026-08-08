export type PurchaseOrderStatus = 'draft' | 'approved' | 'ordered' | 'received' | 'cancelled'

export type RequisitionStatus = 'Pending' | 'Approved' | 'Converted to PO' | 'Rejected'

/** Material Requisition - a floor/dept request for material, the source for Purchase Order line items. */
export interface MaterialRequisition {
  id: string
  mrNo: string
  partNo: string
  partDescription: string
  quantity: number
  unit: string
  department: string
  location: string
  requestedBy: string
  requestDate: string
  status: RequisitionStatus
}

export interface PurchaseOrderItem {
  id: string
  /** Set when this line was added from a Material Requisition, for traceability. */
  mrId?: string
  partNo: string
  description: string
  quantity: number
  unit: string
  rate: number
  taxPercent: number
}

/** Header-detail Purchase Order: vendor/billing/shipping header + line items + computed totals. */
export interface PurchaseOrderDoc {
  id: string
  poNumber: string
  poDate: string
  vendorName: string
  vendorAddress: string
  vendorGstin: string
  quoteRefNo: string
  billingAddress: string
  shippingAddress: string
  items: PurchaseOrderItem[]
  additionalCharges: number
  authorizedSignatory: string
  status: PurchaseOrderStatus
  requestedBy: string
}

export type StoreCategory = 'Raw Material' | 'Consumable' | 'Spare Part' | 'Finished Goods' | 'Packing Material'

export interface StoreItem {
  id: string
  itemCode: string
  itemName: string
  category: StoreCategory
  unitOfMeasure: string
  quantityInStock: number
  reorderLevel: number
  unitCost: number
  location: string
  lastUpdated: string
}

export interface StockInEntry {
  id: string
  transactionNo: string
  itemCode: string
  itemName: string
  quantity: number
  source: string
  receivedBy: string
  date: string
  remarks: string
}

export interface StockOutEntry {
  id: string
  transactionNo: string
  itemCode: string
  itemName: string
  quantity: number
  purpose: string
  issuedTo: string
  issuedBy: string
  date: string
  remarks: string
}

export interface StockTransferEntry {
  id: string
  transactionNo: string
  itemCode: string
  itemName: string
  quantity: number
  fromLocation: string
  toLocation: string
  transferredBy: string
  date: string
  remarks: string
}

export type VoucherType = 'Purchase Invoice' | 'Sales Invoice' | 'Payment' | 'Receipt'
export type VoucherStatus = 'Pending' | 'Paid' | 'Overdue' | 'Cancelled'

export interface AccountVoucher {
  id: string
  voucherNo: string
  type: VoucherType
  party: string
  amount: number
  voucherDate: string
  dueDate: string
  status: VoucherStatus
  paymentMode: string
  reference: string
}

export type LedgerGroup = 'Assets' | 'Liabilities' | 'Equity' | 'Income' | 'Expenses'

/** Chart-of-accounts style ledger master (Tally-style "Ledgers under Groups"), distinct from the transactional AccountVouchers. */
export interface LedgerAccount {
  id: string
  accountCode: string
  accountName: string
  group: LedgerGroup
  openingBalance: number
  debit: number
  credit: number
  asOfDate: string
}
