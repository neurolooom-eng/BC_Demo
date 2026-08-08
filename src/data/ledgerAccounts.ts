import { nextId } from '../lib/id'
import type { LedgerAccount } from '../types/business'

export const LEDGER_ACCOUNTS: LedgerAccount[] = [
  { id: nextId('ledger'), accountCode: '1001', accountName: 'Cash in Hand', group: 'Assets', openingBalance: 250000, debit: 180000, credit: 210000, asOfDate: '2026-07-05' },
  { id: nextId('ledger'), accountCode: '1002', accountName: 'Bank - HDFC Current A/c', group: 'Assets', openingBalance: 8400000, debit: 3200000, credit: 2450000, asOfDate: '2026-07-05' },
  { id: nextId('ledger'), accountCode: '1101', accountName: 'Sundry Debtors', group: 'Assets', openingBalance: 5600000, debit: 4980000, credit: 3220000, asOfDate: '2026-07-05' },
  { id: nextId('ledger'), accountCode: '1201', accountName: 'Raw Material Inventory', group: 'Assets', openingBalance: 3060000, debit: 1225000, credit: 940000, asOfDate: '2026-07-05' },
  { id: nextId('ledger'), accountCode: '1301', accountName: 'Plant & Machinery', group: 'Assets', openingBalance: 42000000, debit: 385000, credit: 0, asOfDate: '2026-07-05' },
  { id: nextId('ledger'), accountCode: '2001', accountName: 'Sundry Creditors', group: 'Liabilities', openingBalance: 3850000, debit: 1610000, credit: 2260000, asOfDate: '2026-07-05' },
  { id: nextId('ledger'), accountCode: '2101', accountName: 'GST Payable', group: 'Liabilities', openingBalance: 620000, debit: 480000, credit: 590000, asOfDate: '2026-07-05' },
  { id: nextId('ledger'), accountCode: '2201', accountName: 'Term Loan - SBI', group: 'Liabilities', openingBalance: 12500000, debit: 250000, credit: 0, asOfDate: '2026-07-05' },
  { id: nextId('ledger'), accountCode: '3001', accountName: "Capital Account - S. R. Kabirdass", group: 'Equity', openingBalance: 25000000, debit: 0, credit: 0, asOfDate: '2026-07-05' },
  { id: nextId('ledger'), accountCode: '3101', accountName: 'Retained Earnings', group: 'Equity', openingBalance: 18400000, debit: 0, credit: 2100000, asOfDate: '2026-07-05' },
  { id: nextId('ledger'), accountCode: '4001', accountName: 'Sales Account - Domestic', group: 'Income', openingBalance: 0, debit: 0, credit: 3980000, asOfDate: '2026-07-05' },
  { id: nextId('ledger'), accountCode: '4002', accountName: 'Sales Account - Export', group: 'Income', openingBalance: 0, debit: 0, credit: 1120000, asOfDate: '2026-07-05' },
  { id: nextId('ledger'), accountCode: '5001', accountName: 'Purchase Account', group: 'Expenses', openingBalance: 0, debit: 1610000, credit: 0, asOfDate: '2026-07-05' },
  { id: nextId('ledger'), accountCode: '5002', accountName: 'Raw Material Consumption', group: 'Expenses', openingBalance: 0, debit: 940000, credit: 0, asOfDate: '2026-07-05' },
  { id: nextId('ledger'), accountCode: '5101', accountName: 'Power & Fuel', group: 'Expenses', openingBalance: 0, debit: 385000, credit: 0, asOfDate: '2026-07-05' },
  { id: nextId('ledger'), accountCode: '5201', accountName: 'Salaries & Wages', group: 'Expenses', openingBalance: 0, debit: 1240000, credit: 0, asOfDate: '2026-07-05' },
]
