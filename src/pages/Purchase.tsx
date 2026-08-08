import { Plus, Printer, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { PurchaseOrderForm } from '../components/purchase/PurchaseOrderForm'
import { PurchaseOrderPrint } from '../components/purchase/PurchaseOrderPrint'
import { emptyPurchaseOrder, emptyRequisition } from '../components/purchase/emptyPurchaseOrder'
import { poTotals } from '../components/purchase/poTotals'
import { Button } from '../components/ui/Button'
import { DataTable, type DataColumn } from '../components/ui/DataTable'
import { Drawer } from '../components/ui/Drawer'
import { FormField } from '../components/ui/FormField'
import { StatusChip } from '../components/ui/StatusChip'
import { useAccess } from '../context/AccessContext'
import { DEPARTMENT_OPTIONS, REQUISITION_STATUS_OPTIONS } from '../data/options'
import { MATERIAL_REQUISITIONS } from '../data/materialRequisitions'
import { PURCHASE_ORDERS } from '../data/purchaseOrders'
import { loadMaterialRequisitions, loadPurchaseOrders, saveMaterialRequisition, savePurchaseOrder, updateMaterialRequisition, updatePurchaseOrder } from '../data/repository'
import { cn } from '../lib/cn'
import { purchaseOrderStatusTone } from '../lib/tones'
import { useAsyncData } from '../lib/useAsyncData'
import type { MaterialRequisition, PurchaseOrderDoc, RequisitionStatus } from '../types/business'

const mrColumns: DataColumn<MaterialRequisition>[] = [
  { key: 'mrNo', header: 'MR No.', width: 120, nowrap: true },
  { key: 'partNo', header: 'Part No', width: 100, nowrap: true },
  { key: 'partDescription', header: 'Description', width: 240 },
  { key: 'quantity', header: 'Qty', width: 100, accessor: (r) => `${r.quantity} ${r.unit}` },
  { key: 'department', header: 'Department', width: 170 },
  { key: 'location', header: 'Location', width: 170 },
  { key: 'requestedBy', header: 'Requested By', width: 140 },
  { key: 'requestDate', header: 'Date', width: 110, nowrap: true },
  { key: 'status', header: 'Status', width: 140, render: (r) => <StatusChip value={r.status} tone={r.status === 'Rejected' ? 'danger' : r.status === 'Converted to PO' ? 'success' : r.status === 'Approved' ? 'info' : 'neutral'} /> },
]

function poColumns(): DataColumn<PurchaseOrderDoc>[] {
  return [
    { key: 'poNumber', header: 'PO Number', width: 130, nowrap: true },
    { key: 'poDate', header: 'Date', width: 110, nowrap: true },
    { key: 'vendorName', header: 'Vendor', width: 220 },
    { key: 'items', header: 'Items', width: 80, accessor: (r) => r.items.length },
    { key: 'netAmount', header: 'Net Amount', width: 140, accessor: (r) => poTotals(r).netAmount, render: (r) => `₹${poTotals(r).netAmount.toLocaleString()}` },
    { key: 'status', header: 'Status', width: 110, render: (r) => <StatusChip value={r.status} tone={purchaseOrderStatusTone[r.status]} /> },
    { key: 'requestedBy', header: 'Requested By', width: 140 },
  ]
}

export function Purchase() {
  const { hasPermission } = useAccess()
  const canCreate = hasPermission('purchase:create')
  const canEdit = hasPermission('purchase:edit')
  const editable = canCreate || canEdit

  const [tab, setTab] = useState<'requisitions' | 'orders'>('requisitions')

  const { data: requisitions, setData: setRequisitions, loading: loadingMr } = useAsyncData(loadMaterialRequisitions, MATERIAL_REQUISITIONS)
  const { data: orders, setData: setOrders, loading: loadingPo } = useAsyncData(loadPurchaseOrders, PURCHASE_ORDERS)

  const [activeMr, setActiveMr] = useState<MaterialRequisition | null>(null)
  const [mrIsNew, setMrIsNew] = useState(false)

  const [activePo, setActivePo] = useState<PurchaseOrderDoc | null>(null)
  const [poIsNew, setPoIsNew] = useState(false)
  const [printingPo, setPrintingPo] = useState<PurchaseOrderDoc | null>(null)

  function openNewMr() {
    setActiveMr(emptyRequisition())
    setMrIsNew(true)
  }

  function openMrRow(mr: MaterialRequisition) {
    setActiveMr(mr)
    setMrIsNew(false)
  }

  function closeMr() {
    setActiveMr(null)
    setMrIsNew(false)
  }

  function saveMr() {
    if (!activeMr) return
    if (mrIsNew) {
      setRequisitions((prev) => [activeMr, ...prev])
      saveMaterialRequisition(activeMr).catch((err) => console.warn('Could not persist requisition:', err))
    } else {
      setRequisitions((prev) => prev.map((m) => (m.id === activeMr.id ? activeMr : m)))
      updateMaterialRequisition(activeMr).catch((err) => console.warn('Could not persist requisition changes:', err))
    }
    closeMr()
  }

  function openNewPo() {
    setActivePo(emptyPurchaseOrder())
    setPoIsNew(true)
  }

  function openPoRow(po: PurchaseOrderDoc) {
    setActivePo(po)
    setPoIsNew(false)
  }

  function closePo() {
    setActivePo(null)
    setPoIsNew(false)
  }

  function savePo() {
    if (!activePo) return
    // Any requisition newly linked into this PO's items is now spoken for.
    const usedMrIds = new Set(activePo.items.map((i) => i.mrId).filter((v): v is string => !!v))
    if (usedMrIds.size > 0) {
      setRequisitions((prev) =>
        prev.map((mr) => {
          if (!usedMrIds.has(mr.id) || mr.status === 'Converted to PO') return mr
          const updated = { ...mr, status: 'Converted to PO' as RequisitionStatus }
          updateMaterialRequisition(updated).catch((err) => console.warn('Could not persist requisition status:', err))
          return updated
        }),
      )
    }

    if (poIsNew) {
      setOrders((prev) => [activePo, ...prev])
      savePurchaseOrder(activePo).catch((err) => console.warn('Could not persist purchase order:', err))
    } else {
      setOrders((prev) => prev.map((o) => (o.id === activePo.id ? activePo : o)))
      updatePurchaseOrder(activePo).catch((err) => console.warn('Could not persist purchase order changes:', err))
    }
    closePo()
  }

  const availableRequisitions = activePo
    ? requisitions.filter((mr) => mr.status === 'Approved' && !activePo.items.some((i) => i.mrId === mr.id))
    : []

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <ShoppingCart className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text">Purchase</h1>
          <p className="text-sm text-muted">Material requisitions and vendor purchase orders. Click a row to open it.</p>
        </div>
      </div>

      <div className="inline-flex rounded-md border border-border bg-surface p-1">
        <button
          type="button"
          onClick={() => setTab('requisitions')}
          className={cn('rounded px-3 py-1.5 text-sm font-medium', tab === 'requisitions' ? 'bg-primary/12 text-primary' : 'text-muted hover:text-text')}
        >
          Material Requisitions
        </button>
        <button
          type="button"
          onClick={() => setTab('orders')}
          className={cn('rounded px-3 py-1.5 text-sm font-medium', tab === 'orders' ? 'bg-primary/12 text-primary' : 'text-muted hover:text-text')}
        >
          Purchase Orders
        </button>
      </div>

      {tab === 'requisitions' ? (
        <div className="space-y-3">
          <div className="flex justify-end">
            {canCreate && (
              <Button icon={<Plus className="h-4 w-4" />} onClick={openNewMr}>
                New Requisition
              </Button>
            )}
          </div>
          {loadingMr ? <p className="text-sm text-muted">Loading requisitions…</p> : <DataTable key="material-requisitions" tableKey="material-requisitions" columns={mrColumns} data={requisitions} onRowClick={openMrRow} />}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-end">
            {canCreate && (
              <Button icon={<Plus className="h-4 w-4" />} onClick={openNewPo}>
                New Purchase Order
              </Button>
            )}
          </div>
          {loadingPo ? (
            <p className="text-sm text-muted">Loading purchase orders…</p>
          ) : (
            <DataTable key="purchase-orders" tableKey="purchase-orders" columns={poColumns()} data={orders} onRowClick={openPoRow} />
          )}
        </div>
      )}

      <Drawer
        open={!!activeMr}
        onClose={closeMr}
        title={mrIsNew ? 'New Material Requisition' : `Requisition - ${activeMr?.mrNo}`}
        footer={
          <>
            <Button variant="outline" onClick={closeMr}>
              {mrIsNew ? 'Cancel' : 'Close'}
            </Button>
            {editable && <Button onClick={saveMr}>{mrIsNew ? 'Save' : 'Save Changes'}</Button>}
          </>
        }
      >
        {activeMr && (
          <fieldset className="card grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
            <legend className="mb-2 px-1 text-sm font-semibold text-primary">Requisition Details</legend>
            <FormField label="MR No." required value={activeMr.mrNo} readOnly={!editable} onChange={(v) => setActiveMr({ ...activeMr, mrNo: String(v) })} placeholder="MR-2026-1XX" />
            <FormField label="Status" type="status" required value={activeMr.status} options={REQUISITION_STATUS_OPTIONS} readOnly={!editable} onChange={(v) => setActiveMr({ ...activeMr, status: v as RequisitionStatus })} />
            <FormField label="Part No" required value={activeMr.partNo} readOnly={!editable} onChange={(v) => setActiveMr({ ...activeMr, partNo: String(v) })} />
            <FormField label="Part Description" required value={activeMr.partDescription} readOnly={!editable} onChange={(v) => setActiveMr({ ...activeMr, partDescription: String(v) })} />
            <FormField label="Quantity" type="number" required value={activeMr.quantity} readOnly={!editable} onChange={(v) => setActiveMr({ ...activeMr, quantity: Number(v) })} />
            <FormField label="Unit" required value={activeMr.unit} readOnly={!editable} onChange={(v) => setActiveMr({ ...activeMr, unit: String(v) })} placeholder="kg / nos / ltr / set" />
            <FormField label="Department" type="select" required value={activeMr.department} options={DEPARTMENT_OPTIONS} readOnly={!editable} onChange={(v) => setActiveMr({ ...activeMr, department: String(v) })} />
            <FormField label="Location" required value={activeMr.location} readOnly={!editable} onChange={(v) => setActiveMr({ ...activeMr, location: String(v) })} />
            <FormField label="Requested By" required value={activeMr.requestedBy} readOnly={!editable} onChange={(v) => setActiveMr({ ...activeMr, requestedBy: String(v) })} />
            <FormField label="Request Date" type="date" required value={activeMr.requestDate} readOnly={!editable} onChange={(v) => setActiveMr({ ...activeMr, requestDate: String(v) })} />
          </fieldset>
        )}
      </Drawer>

      <Drawer
        open={!!activePo}
        onClose={closePo}
        wide
        title={poIsNew ? 'New Purchase Order' : `Purchase Order - ${activePo?.poNumber}`}
        footer={
          <>
            <Button variant="outline" onClick={closePo}>
              {poIsNew ? 'Cancel' : 'Close'}
            </Button>
            {!poIsNew && activePo && (
              <Button variant="outline" icon={<Printer className="h-4 w-4" />} onClick={() => setPrintingPo(activePo)}>
                Print Preview
              </Button>
            )}
            {editable && <Button onClick={savePo}>{poIsNew ? 'Save' : 'Save Changes'}</Button>}
          </>
        }
      >
        {activePo && <PurchaseOrderForm po={activePo} onChange={setActivePo} readOnly={!editable} availableRequisitions={availableRequisitions} />}
      </Drawer>

      <Drawer
        open={!!printingPo}
        onClose={() => setPrintingPo(null)}
        wide
        title={`Print Preview - ${printingPo?.poNumber}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setPrintingPo(null)}>
              Close
            </Button>
            <Button icon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>
              Print
            </Button>
          </>
        }
      >
        {printingPo && <PurchaseOrderPrint po={printingPo} />}
      </Drawer>
    </div>
  )
}
