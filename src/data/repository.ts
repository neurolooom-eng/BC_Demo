import * as sheets from '../lib/sheetsClient'
import type { SheetName } from '../lib/sheetsClient'
import type { CheckSheetRecord, QmsDocument, Specification } from '../types/domain'
import type {
  AccountVoucher,
  LedgerAccount,
  MaterialRequisition,
  PurchaseOrderDoc,
  StockInEntry,
  StockOutEntry,
  StockTransferEntry,
  StoreItem,
} from '../types/business'
import { ACCOUNT_VOUCHERS } from './accountVouchers'
import { CHECK_SHEETS } from './checkSheets'
import { DOCUMENTS } from './documents'
import { LEDGER_ACCOUNTS } from './ledgerAccounts'
import { MATERIAL_REQUISITIONS } from './materialRequisitions'
import { PURCHASE_ORDERS } from './purchaseOrders'
import { SPECIFICATIONS } from './specifications'
import { STOCK_IN_ENTRIES, STOCK_OUT_ENTRIES, STOCK_TRANSFER_ENTRIES } from './stockTransactions'
import { STORE_ITEMS } from './storeItems'

/**
 * Data-access layer. Reads/writes go through the Google Sheets backend
 * (google-apps-script/Code.gs) when VITE_SHEETS_API_URL is configured;
 * otherwise every function resolves with the bundled mock data so the app
 * still works standalone. Any Sheets API failure (misconfigured script,
 * network error) falls back to mock data rather than breaking the page.
 */

/** Flat records with no nested fields go through the Sheets API as-is. */
function simpleResource<T extends { id: string }>(sheet: SheetName, mockData: T[]) {
  return {
    async load(): Promise<T[]> {
      if (!sheets.isConfigured()) return mockData
      try {
        return await sheets.listRows<T>(sheet)
      } catch (err) {
        console.warn(`Falling back to mock ${sheet}:`, err)
        return mockData
      }
    },
    async save(record: T): Promise<void> {
      if (!sheets.isConfigured()) return
      await sheets.createRow(sheet, record)
    },
    async update(record: T): Promise<void> {
      if (!sheets.isConfigured()) return
      await sheets.updateRow(sheet, record.id, record)
    },
  }
}

/** Records with array/object fields that don't fit flat sheet columns - stored as JSON-text columns. */
function jsonFieldResource<T extends { id: string }>(sheet: SheetName, mockData: T[], jsonFields: readonly (keyof T)[]) {
  function decode(row: Record<string, unknown>): T {
    const decoded: Record<string, unknown> = { ...row }
    for (const field of jsonFields) {
      const value = decoded[field as string]
      if (typeof value === 'string') decoded[field as string] = JSON.parse(value)
    }
    return decoded as unknown as T
  }

  function encode(record: T): Record<string, unknown> {
    const encoded: Record<string, unknown> = { ...record }
    for (const field of jsonFields) {
      encoded[field as string] = JSON.stringify(record[field])
    }
    return encoded
  }

  return {
    async load(): Promise<T[]> {
      if (!sheets.isConfigured()) return mockData
      try {
        const rows = await sheets.listRows<Record<string, unknown>>(sheet)
        return rows.map(decode)
      } catch (err) {
        console.warn(`Falling back to mock ${sheet}:`, err)
        return mockData
      }
    },
    async save(record: T): Promise<void> {
      if (!sheets.isConfigured()) return
      await sheets.createRow(sheet, encode(record))
    },
    async update(record: T): Promise<void> {
      if (!sheets.isConfigured()) return
      await sheets.updateRow(sheet, record.id, encode(record))
    },
  }
}

export async function loadSpecifications(): Promise<Specification[]> {
  if (!sheets.isConfigured()) return SPECIFICATIONS
  try {
    return await sheets.listRows<Specification>('Specifications')
  } catch (err) {
    console.warn('Falling back to mock specifications:', err)
    return SPECIFICATIONS
  }
}

export async function loadDocuments(): Promise<QmsDocument[]> {
  if (!sheets.isConfigured()) return DOCUMENTS
  try {
    return await sheets.listRows<QmsDocument>('Documents')
  } catch (err) {
    console.warn('Falling back to mock documents:', err)
    return DOCUMENTS
  }
}

export async function saveDocument(doc: QmsDocument): Promise<void> {
  if (!sheets.isConfigured()) return
  await sheets.createRow('Documents', doc)
}

const CHECK_SHEET_JSON_FIELDS = ['readings', 'machineReadings', 'corePinChecks', 'diePrep', 'signatures'] as const
const checkSheetResource = jsonFieldResource<CheckSheetRecord>('CheckSheets', CHECK_SHEETS, CHECK_SHEET_JSON_FIELDS)
export const loadCheckSheets = checkSheetResource.load
export const saveCheckSheet = checkSheetResource.save
export const updateCheckSheet = checkSheetResource.update

const purchaseOrderResource = jsonFieldResource<PurchaseOrderDoc>('PurchaseOrders', PURCHASE_ORDERS, ['items'] as const)
export const loadPurchaseOrders = purchaseOrderResource.load
export const savePurchaseOrder = purchaseOrderResource.save
export const updatePurchaseOrder = purchaseOrderResource.update

const materialRequisitionResource = simpleResource<MaterialRequisition>('MaterialRequisitions', MATERIAL_REQUISITIONS)
export const loadMaterialRequisitions = materialRequisitionResource.load
export const saveMaterialRequisition = materialRequisitionResource.save
export const updateMaterialRequisition = materialRequisitionResource.update

const storeItemResource = simpleResource<StoreItem>('StoreItems', STORE_ITEMS)
export const loadStoreItems = storeItemResource.load
export const saveStoreItem = storeItemResource.save
export const updateStoreItem = storeItemResource.update

const stockInResource = simpleResource<StockInEntry>('StockInEntries', STOCK_IN_ENTRIES)
export const loadStockInEntries = stockInResource.load
export const saveStockInEntry = stockInResource.save

const stockOutResource = simpleResource<StockOutEntry>('StockOutEntries', STOCK_OUT_ENTRIES)
export const loadStockOutEntries = stockOutResource.load
export const saveStockOutEntry = stockOutResource.save

const stockTransferResource = simpleResource<StockTransferEntry>('StockTransferEntries', STOCK_TRANSFER_ENTRIES)
export const loadStockTransferEntries = stockTransferResource.load
export const saveStockTransferEntry = stockTransferResource.save

const accountVoucherResource = simpleResource<AccountVoucher>('AccountVouchers', ACCOUNT_VOUCHERS)
export const loadAccountVouchers = accountVoucherResource.load
export const saveAccountVoucher = accountVoucherResource.save
export const updateAccountVoucher = accountVoucherResource.update

const ledgerAccountResource = simpleResource<LedgerAccount>('LedgerAccounts', LEDGER_ACCOUNTS)
export const loadLedgerAccounts = ledgerAccountResource.load
export const saveLedgerAccount = ledgerAccountResource.save
export const updateLedgerAccount = ledgerAccountResource.update
