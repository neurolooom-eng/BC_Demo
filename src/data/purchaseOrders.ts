import { nextId } from '../lib/id'
import type { PurchaseOrderDoc, PurchaseOrderItem } from '../types/business'
import { MATERIAL_REQUISITIONS } from './materialRequisitions'

function mrIdFor(mrNo: string): string | undefined {
  return MATERIAL_REQUISITIONS.find((mr) => mr.mrNo === mrNo)?.id
}

function item(
  partial: Partial<Omit<PurchaseOrderItem, 'mrId'>> &
    Pick<PurchaseOrderItem, 'partNo' | 'description' | 'quantity' | 'unit' | 'rate' | 'taxPercent'> & { fromMrNo?: string },
): PurchaseOrderItem {
  const { fromMrNo, ...rest } = partial
  return { id: nextId('poitem'), mrId: fromMrNo ? mrIdFor(fromMrNo) : undefined, ...rest }
}

export const PURCHASE_ORDERS: PurchaseOrderDoc[] = [
  {
    id: nextId('po'),
    poNumber: 'PO-2026-001',
    poDate: '2026-06-20',
    vendorName: 'Hindalco Industries Ltd.',
    vendorAddress: 'Century Bhavan, Dr. Annie Besant Road, Worli, Mumbai, Maharashtra - 400030',
    vendorGstin: '27AABCH1234K1Z5',
    quoteRefNo: 'HIL/QT/2026/0442',
    billingAddress: 'Best Cast IT Limited, Ambattur Industrial Estate, Chennai, Tamil Nadu - 600058',
    shippingAddress: 'Best Cast IT Limited - Unit 1, Ambattur Industrial Estate, Chennai, Tamil Nadu - 600058',
    items: [
      item({ fromMrNo: 'MR-2026-101', partNo: 'RM-001', description: 'AC2A Aluminium Ingot', quantity: 5000, unit: 'kg', rate: 245, taxPercent: 18 }),
    ],
    additionalCharges: 8500,
    authorizedSignatory: 'Vikensh R',
    status: 'ordered',
    requestedBy: 'Vikensh R',
  },
  {
    id: nextId('po'),
    poNumber: 'PO-2026-002',
    poDate: '2026-06-25',
    vendorName: 'National Abrasives & Chemicals',
    vendorAddress: '14 Industrial Estate Road, Guindy, Chennai, Tamil Nadu - 600032',
    vendorGstin: '33AACFN5678L1Z2',
    quoteRefNo: 'NAC/2026/119',
    billingAddress: 'Best Cast IT Limited, Ambattur Industrial Estate, Chennai, Tamil Nadu - 600058',
    shippingAddress: 'Best Cast IT Limited - Unit 1, Ambattur Industrial Estate, Chennai, Tamil Nadu - 600058',
    items: [
      item({ fromMrNo: 'MR-2026-102', partNo: 'CON-010', description: 'Die Coating Spray - FORACE', quantity: 200, unit: 'ltr', rate: 480, taxPercent: 18 }),
    ],
    additionalCharges: 1200,
    authorizedSignatory: 'Vimal',
    status: 'approved',
    requestedBy: 'Vimal',
  },
  {
    id: nextId('po'),
    poNumber: 'PO-2026-003',
    poDate: '2026-06-15',
    vendorName: 'Precision Tool Works',
    vendorAddress: '22 Tool Makers Colony, Ambattur, Chennai, Tamil Nadu - 600053',
    vendorGstin: '33AAJCP9012M1Z8',
    quoteRefNo: 'PTW/QT/0087',
    billingAddress: 'Best Cast IT Limited, Ambattur Industrial Estate, Chennai, Tamil Nadu - 600058',
    shippingAddress: 'Best Cast IT Limited - Unit 2, Ambattur Industrial Estate, Chennai, Tamil Nadu - 600058',
    items: [
      item({ fromMrNo: 'MR-2026-104', partNo: 'SP-006', description: 'Die Insert Set - Mando Model Line 02', quantity: 1, unit: 'set', rate: 385000, taxPercent: 18 }),
    ],
    additionalCharges: 0,
    authorizedSignatory: 'Quality Head',
    status: 'ordered',
    requestedBy: 'Quality Head',
  },
  {
    id: nextId('po'),
    poNumber: 'PO-2026-004',
    poDate: '2026-06-28',
    vendorName: 'Chennai Rotor Components',
    vendorAddress: '5 Rotor Street, Ekkatuthangal, Chennai, Tamil Nadu - 600032',
    vendorGstin: '33AADFC3456N1Z6',
    quoteRefNo: 'CRC/2026/033',
    billingAddress: 'Best Cast IT Limited, Ambattur Industrial Estate, Chennai, Tamil Nadu - 600058',
    shippingAddress: 'Best Cast IT Limited - Unit 1, Ambattur Industrial Estate, Chennai, Tamil Nadu - 600058',
    items: [
      item({ fromMrNo: 'MR-2026-103', partNo: 'SP-004', description: 'Degassing Rotor - 190mm', quantity: 6, unit: 'nos', rate: 12500, taxPercent: 18 }),
    ],
    additionalCharges: 750,
    authorizedSignatory: 'Mohan',
    status: 'received',
    requestedBy: 'Mohan',
  },
  {
    id: nextId('po'),
    poNumber: 'PO-2026-005',
    poDate: '2026-07-01',
    vendorName: 'Best Cast Alloy Division',
    vendorAddress: 'Ambattur Industrial Estate, Chennai, Tamil Nadu - 600058',
    vendorGstin: '33AABCB7890P1Z1',
    quoteRefNo: 'BCAD/IC/2026/205',
    billingAddress: 'Best Cast IT Limited, Ambattur Industrial Estate, Chennai, Tamil Nadu - 600058',
    shippingAddress: 'Best Cast IT Limited - Unit 1, Ambattur Industrial Estate, Chennai, Tamil Nadu - 600058',
    items: [
      item({ fromMrNo: 'MR-2026-107', partNo: 'RM-002', description: 'AC2A Foundry Return Ingots', quantity: 3000, unit: 'kg', rate: 220, taxPercent: 18 }),
    ],
    additionalCharges: 0,
    authorizedSignatory: '',
    status: 'draft',
    requestedBy: 'Vikensh R',
  },
]
