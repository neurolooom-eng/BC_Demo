import { nextId } from '../../lib/id'
import type { MaterialRequisition, PurchaseOrderDoc, PurchaseOrderItem } from '../../types/business'

export function emptyRequisition(): MaterialRequisition {
  return {
    id: nextId('mr'),
    mrNo: '',
    partNo: '',
    partDescription: '',
    quantity: 0,
    unit: '',
    department: '',
    location: '',
    requestedBy: '',
    requestDate: new Date().toISOString().slice(0, 10),
    status: 'Pending',
  }
}

export function itemFromRequisition(mr: MaterialRequisition): PurchaseOrderItem {
  return {
    id: nextId('poitem'),
    mrId: mr.id,
    partNo: mr.partNo,
    description: mr.partDescription,
    quantity: mr.quantity,
    unit: mr.unit,
    rate: 0,
    taxPercent: 18,
  }
}

export function blankPoItem(): PurchaseOrderItem {
  return {
    id: nextId('poitem'),
    partNo: '',
    description: '',
    quantity: 1,
    unit: '',
    rate: 0,
    taxPercent: 18,
  }
}

export function emptyPurchaseOrder(): PurchaseOrderDoc {
  return {
    id: nextId('po'),
    poNumber: '',
    poDate: new Date().toISOString().slice(0, 10),
    vendorName: '',
    vendorAddress: '',
    vendorGstin: '',
    quoteRefNo: '',
    billingAddress: 'Best Cast IT Limited, Ambattur Industrial Estate, Chennai, Tamil Nadu - 600058',
    shippingAddress: 'Best Cast IT Limited - Unit 1, Ambattur Industrial Estate, Chennai, Tamil Nadu - 600058',
    items: [],
    additionalCharges: 0,
    authorizedSignatory: '',
    status: 'draft',
    requestedBy: '',
  }
}
