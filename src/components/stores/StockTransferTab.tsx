import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/Button'
import { DataTable, type DataColumn } from '../ui/DataTable'
import { Drawer } from '../ui/Drawer'
import { FormField } from '../ui/FormField'
import { loadStockTransferEntries, saveStockTransferEntry } from '../../data/repository'
import { STOCK_TRANSFER_ENTRIES } from '../../data/stockTransactions'
import { nextId } from '../../lib/id'
import { useAsyncData } from '../../lib/useAsyncData'
import type { StockTransferEntry, StoreItem } from '../../types/business'

function emptyEntry(items: StoreItem[]): StockTransferEntry {
  const first = items[0]
  return {
    id: nextId('stocktransfer'),
    transactionNo: '',
    itemCode: first?.itemCode ?? '',
    itemName: first?.itemName ?? '',
    quantity: 0,
    fromLocation: first?.location ?? '',
    toLocation: '',
    transferredBy: '',
    date: new Date().toISOString().slice(0, 10),
    remarks: '',
  }
}

const columns: DataColumn<StockTransferEntry>[] = [
  { key: 'transactionNo', header: 'Txn No.', width: 140, nowrap: true },
  { key: 'itemCode', header: 'Item Code', width: 100, nowrap: true },
  { key: 'itemName', header: 'Item Name', width: 200 },
  { key: 'quantity', header: 'Qty', width: 90 },
  { key: 'fromLocation', header: 'From', width: 170 },
  { key: 'toLocation', header: 'To', width: 170 },
  { key: 'transferredBy', header: 'Transferred By', width: 140 },
  { key: 'date', header: 'Date', width: 110, nowrap: true },
]

interface Props {
  storeItems: StoreItem[]
  setStoreItems: React.Dispatch<React.SetStateAction<StoreItem[]>>
  canCreate: boolean
}

export function StockTransferTab({ storeItems, setStoreItems, canCreate }: Props) {
  const { data: entries, setData: setEntries, loading } = useAsyncData(loadStockTransferEntries, STOCK_TRANSFER_ENTRIES)
  const [active, setActive] = useState<StockTransferEntry | null>(null)

  function openNew() {
    setActive(emptyEntry(storeItems))
  }

  function close() {
    setActive(null)
  }

  function save() {
    if (!active || !active.itemCode || active.quantity <= 0 || !active.toLocation) return
    setEntries((prev) => [active, ...prev])
    saveStockTransferEntry(active).catch((err) => console.warn('Could not persist stock transfer:', err))
    // Single-location-per-item model: a transfer moves the item's master
    // location record. Multi-location split stock isn't tracked in this POC.
    setStoreItems((prev) => prev.map((i) => (i.itemCode === active.itemCode ? { ...i, location: active.toLocation, lastUpdated: active.date } : i)))
    close()
  }

  const itemOptions = storeItems.map((i) => ({ value: i.itemCode, label: `${i.itemCode} - ${i.itemName} (currently: ${i.location})` }))

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        {canCreate && (
          <Button icon={<Plus className="h-4 w-4" />} onClick={openNew}>
            New Stock Transfer
          </Button>
        )}
      </div>

      {loading ? <p className="text-sm text-muted">Loading stock transfers…</p> : <DataTable tableKey="stock-transfer" columns={columns} data={entries} />}

      <Drawer
        open={!!active}
        onClose={close}
        title="New Stock Transfer"
        subtitle="Move material between locations"
        footer={
          <>
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button onClick={save}>Save</Button>
          </>
        }
      >
        {active && (
          <fieldset className="card grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
            <legend className="mb-2 px-1 text-sm font-semibold text-primary">Transfer Details</legend>
            <FormField label="Transaction No." required value={active.transactionNo} onChange={(v) => setActive({ ...active, transactionNo: String(v) })} placeholder="STR-2026-0XXX" />
            <FormField label="Date" type="date" required value={active.date} onChange={(v) => setActive({ ...active, date: String(v) })} />
            <FormField
              label="Item"
              type="select"
              required
              span={2}
              value={active.itemCode}
              options={itemOptions}
              onChange={(v) => {
                const item = storeItems.find((i) => i.itemCode === v)
                setActive({ ...active, itemCode: String(v), itemName: item?.itemName ?? '', fromLocation: item?.location ?? '' })
              }}
            />
            <FormField label="Quantity" type="number" required value={active.quantity} onChange={(v) => setActive({ ...active, quantity: Number(v) })} />
            <FormField label="From Location" required readOnly value={active.fromLocation} onChange={() => {}} />
            <FormField label="To Location" required value={active.toLocation} onChange={(v) => setActive({ ...active, toLocation: String(v) })} />
            <FormField label="Transferred By" required value={active.transferredBy} onChange={(v) => setActive({ ...active, transferredBy: String(v) })} />
            <FormField label="Remarks" type="textarea" span={2} value={active.remarks} onChange={(v) => setActive({ ...active, remarks: String(v) })} />
          </fieldset>
        )}
      </Drawer>
    </div>
  )
}
