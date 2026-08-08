import { nextId } from '../lib/id'
import type { StockInEntry, StockOutEntry, StockTransferEntry } from '../types/business'

export const STOCK_IN_ENTRIES: StockInEntry[] = [
  {
    id: nextId('stockin'),
    transactionNo: 'SIN-2026-0301',
    itemCode: 'RM-001',
    itemName: 'AC2A Aluminium Ingot',
    quantity: 5000,
    source: 'PO-2026-001',
    receivedBy: 'Ganesh',
    date: '2026-07-06',
    remarks: 'Received in full, quality checked OK.',
  },
  {
    id: nextId('stockin'),
    transactionNo: 'SIN-2026-0302',
    itemCode: 'CON-010',
    itemName: 'Die Coating Spray - FORACE',
    quantity: 100,
    source: 'PO-2026-002',
    receivedBy: 'Ganesh',
    date: '2026-07-02',
    remarks: 'Partial delivery - balance pending.',
  },
  {
    id: nextId('stockin'),
    transactionNo: 'SIN-2026-0303',
    itemCode: 'SP-004',
    itemName: 'Degassing Rotor - 190mm',
    quantity: 4,
    source: 'PO-2026-004',
    receivedBy: 'Ganesh',
    date: '2026-07-04',
    remarks: '',
  },
]

export const STOCK_OUT_ENTRIES: StockOutEntry[] = [
  {
    id: nextId('stockout'),
    transactionNo: 'SOUT-2026-0210',
    itemCode: 'RM-001',
    itemName: 'AC2A Aluminium Ingot',
    quantity: 2500,
    purpose: 'Production Issue - Melting Line 01',
    issuedTo: 'Vimal',
    issuedBy: 'Ganesh',
    date: '2026-07-05',
    remarks: 'Shift 1 melt charge',
  },
  {
    id: nextId('stockout'),
    transactionNo: 'SOUT-2026-0211',
    itemCode: 'CON-010',
    itemName: 'Die Coating Spray - FORACE',
    quantity: 55,
    purpose: 'Production Issue - Die Casting Line 01',
    issuedTo: 'Bharathi',
    issuedBy: 'Ganesh',
    date: '2026-07-05',
    remarks: '',
  },
  {
    id: nextId('stockout'),
    transactionNo: 'SOUT-2026-0212',
    itemCode: 'SP-005',
    itemName: 'Core Pin Set - 10 Cavity',
    quantity: 1,
    purpose: 'Tool Change - Line 02',
    issuedTo: 'Naveen',
    issuedBy: 'Ganesh',
    date: '2026-07-03',
    remarks: 'Worn set replaced',
  },
]

export const STOCK_TRANSFER_ENTRIES: StockTransferEntry[] = [
  {
    id: nextId('stocktransfer'),
    transactionNo: 'STR-2026-0050',
    itemCode: 'SP-004',
    itemName: 'Degassing Rotor - 190mm',
    quantity: 2,
    fromLocation: 'Spares Cage - Line 01',
    toLocation: 'Spares Cage - Line 02',
    transferredBy: 'Ganesh',
    date: '2026-07-04',
    remarks: 'Balancing spares across lines',
  },
]
