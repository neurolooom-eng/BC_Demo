/**
 * Thin client for the Google Sheets backend (a Google Apps Script Web App
 * bound to the QMS spreadsheet - see /google-apps-script/Code.gs).
 *
 * When no exec URL is configured (build-time VITE_SHEETS_API_URL, or a
 * runtime override set on the developer-only Config page), `isConfigured()`
 * is false and every caller in src/data/repository.ts falls back to the
 * bundled mock arrays, so the app runs standalone until a sheet is wired up.
 */

import { getEffectiveExecUrl, getRuntimeConfig } from './runtimeConfig'

export type SheetName =
  | 'Specifications'
  | 'Documents'
  | 'CheckSheets'
  | 'MaterialRequisitions'
  | 'PurchaseOrders'
  | 'StoreItems'
  | 'StockInEntries'
  | 'StockOutEntries'
  | 'StockTransferEntries'
  | 'AccountVouchers'
  | 'LedgerAccounts'

export function isConfigured() {
  return Boolean(getEffectiveExecUrl())
}

/** Logical sheet key -> the tab name actually configured on the Config page. */
function tabNameFor(sheet: SheetName) {
  return getRuntimeConfig().tabNames[sheet]
}

export async function listRows<T>(sheet: SheetName): Promise<T[]> {
  const apiUrl = getEffectiveExecUrl()
  if (!apiUrl) throw new Error('No Google Sheets backend is configured')
  const { spreadsheetId } = getRuntimeConfig()
  const params = new URLSearchParams({ sheet: tabNameFor(sheet) })
  if (spreadsheetId) params.set('spreadsheetId', spreadsheetId)
  const res = await fetch(`${apiUrl}?${params}`)
  if (!res.ok) throw new Error(`Sheets API GET ${sheet} failed: ${res.status}`)
  const body = await res.json()
  return body.rows as T[]
}

/**
 * Apps Script web apps don't handle CORS preflight, so POST bodies are sent
 * as text/plain (a "simple request" the browser won't preflight) - the
 * script parses the JSON itself regardless of declared content type.
 */
async function post(payload: Record<string, unknown>) {
  const apiUrl = getEffectiveExecUrl()
  if (!apiUrl) throw new Error('No Google Sheets backend is configured')
  const { spreadsheetId } = getRuntimeConfig()
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(spreadsheetId ? { ...payload, spreadsheetId } : payload),
  })
  if (!res.ok) throw new Error(`Sheets API POST failed: ${res.status}`)
  return res.json()
}

export function createRow<T>(sheet: SheetName, data: T) {
  return post({ sheet: tabNameFor(sheet), action: 'create', data })
}

export function updateRow<T>(sheet: SheetName, id: string, data: T) {
  return post({ sheet: tabNameFor(sheet), action: 'update', id, data })
}
