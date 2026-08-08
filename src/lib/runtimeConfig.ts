/**
 * Developer-only runtime overrides for the Google Sheets backend, editable
 * from the Config page (/config) without a rebuild/redeploy. Persisted to
 * localStorage; falls back to build-time env defaults when unset.
 */

const STORAGE_KEY = 'bestcast.devconfig'

export const DEFAULT_TAB_NAMES = {
  Specifications: 'Specifications',
  Documents: 'Documents',
  CheckSheets: 'CheckSheets',
  MaterialRequisitions: 'MaterialRequisitions',
  PurchaseOrders: 'PurchaseOrders',
  StoreItems: 'StoreItems',
  StockInEntries: 'StockInEntries',
  StockOutEntries: 'StockOutEntries',
  StockTransferEntries: 'StockTransferEntries',
  AccountVouchers: 'AccountVouchers',
  LedgerAccounts: 'LedgerAccounts',
} as const

export interface RuntimeConfig {
  /** Google Apps Script Web App URL. Empty string = use VITE_SHEETS_API_URL. */
  execUrl: string
  /** Optional - lets one Apps Script deployment serve multiple spreadsheets. */
  spreadsheetId: string
  tabNames: typeof DEFAULT_TAB_NAMES
}

const DEFAULTS: RuntimeConfig = {
  execUrl: '',
  spreadsheetId: '',
  tabNames: DEFAULT_TAB_NAMES,
}

export function getRuntimeConfig(): RuntimeConfig {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return DEFAULTS
    const parsed = JSON.parse(stored)
    return { ...DEFAULTS, ...parsed, tabNames: { ...DEFAULT_TAB_NAMES, ...parsed.tabNames } }
  } catch {
    return DEFAULTS
  }
}

export function setRuntimeConfig(config: RuntimeConfig): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

export function getEffectiveExecUrl(): string | undefined {
  const override = getRuntimeConfig().execUrl
  if (override) return override
  return import.meta.env.VITE_SHEETS_API_URL
}
