import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/Button'
import { DataTable, type DataColumn } from '../ui/DataTable'
import { Drawer } from '../ui/Drawer'
import { FormField } from '../ui/FormField'
import { loadStockInEntries, saveStockInEntry } from '../../data/repository'
import { STOCK_IN_ENTRIES } from '../../data/stockTransactions'
import { nextId } from '../../lib/id'
import { useAsyncData } from '../../lib/useAsyncData'
import type { StockInEntry, StoreItem } from '../../types/business'

function emptyEntry(items: StoreItem[]): StockInEntry {
  const first = items[0]
  return {
    id: nextId('stockin'),
    transactionNo: '',
    itemCode: first?.itemCode ?? '',
    itemName: first?.itemName ?? '',
    quantity: 0,
    source: '',
    receivedBy: '',
    date: new Date().toISOString().slice(0, 10),
    remarks: '',
  }
}

const columns: DataColumn<StockInEntry>[] = [
  { key: 'transactionNo', header: 'Txn No.', width: 140, nowrap: true },
  { key: 'itemCode', header: 'Item Code', width: 100, nowrap: true },
  { key: 'itemName', header: 'Item Name', width: 220 },
  { key: 'quantity', header: 'Qty', width: 90 },
  { key: 'source', header: 'Source', width: 150 },
  { key: 'receivedBy', header: 'Received By', width: 130 },
  { key: 'date', header: 'Date', width: 110, nowrap: true },
  { key: 'remarks', header: 'Remarks', width: 200 },
]

interface Props {
  storeItems: StoreItem[]
  setStoreItems: React.Dispatch<React.SetStateAction<StoreItem[]>>
  canCreate: boolean
}

export function StockInTab({ storeItems, setStoreItems, canCreate }: Props) {
  const { data: entries, setData: setEntries, loading } = useAsyncData(loadStockInEntries, STOCK_IN_ENTRIES)
  const [active, setActive] = useState<StockInEntry | null>(null)

  function openNew() {
    setActive(emptyEntry(storeItems))
  }

  function close() {
    setActive(null)
  }

  function save() {
    if (!active || !active.itemCode || active.quantity <= 0) return
    setEntries((prev) => [active, ...prev])
    saveStockInEntry(active).catch((err) => console.warn('Could not persist stock-in entry:', err))
    setStoreItems((prev) =>
      prev.map((i) => (i.itemCode === active.itemCode ? { ...i, quantityInStock: i.quantityInStock + active.quantity, lastUpdated: active.date } : i)),
    )
    close()
  }

  const itemOptions = storeItems.map((i) => ({ value: i.itemCode, label: `${i.itemCode} - ${i.itemName}` }))

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        {canCreate && (
          <Button icon={<Plus className="h-4 w-4" />} onClick={openNew}>
            New Stock In
          </Button>
        )}
      </div>

      {loading ? <p className="text-sm text-muted">Loading stock-in entries…</p> : <DataTable tableKey="stock-in" columns={columns} data={entries} />}

      <Drawer
        open={!!active}
        onClose={close}
        title="New Stock In"
        subtitle="Record material received into stores"
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
            <legend className="mb-2 px-1 text-sm font-semibold text-primary">Stock In Details</legend>
            <FormField label="Transaction No." required value={active.transactionNo} onChange={(v) => setActive({ ...active, transactionNo: String(v) })} placeholder="SIN-2026-0XXX" />
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
                setActive({ ...active, itemCode: String(v), itemName: item?.itemName ?? '' })
              }}
            />
            <FormField label="Quantity" type="number" required value={active.quantity} onChange={(v) => setActive({ ...active, quantity: Number(v) })} />
            <FormField label="Source" required value={active.source} onChange={(v) => setActive({ ...active, source: String(v) })} placeholder="PO number / Production Return" />
            <FormField label="Received By" required value={active.receivedBy} onChange={(v) => setActive({ ...active, receivedBy: String(v) })} />
            <FormField label="Remarks" type="textarea" span={2} value={active.remarks} onChange={(v) => setActive({ ...active, remarks: String(v) })} />
          </fieldset>
        )}
      </Drawer>
    </div>
  )
}
