import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/Button'
import { DataTable, type DataColumn } from '../ui/DataTable'
import { Drawer } from '../ui/Drawer'
import { FormField } from '../ui/FormField'
import { loadStockOutEntries, saveStockOutEntry } from '../../data/repository'
import { STOCK_OUT_ENTRIES } from '../../data/stockTransactions'
import { nextId } from '../../lib/id'
import { useAsyncData } from '../../lib/useAsyncData'
import type { StockOutEntry, StoreItem } from '../../types/business'

function emptyEntry(items: StoreItem[]): StockOutEntry {
  const first = items[0]
  return {
    id: nextId('stockout'),
    transactionNo: '',
    itemCode: first?.itemCode ?? '',
    itemName: first?.itemName ?? '',
    quantity: 0,
    purpose: '',
    issuedTo: '',
    issuedBy: '',
    date: new Date().toISOString().slice(0, 10),
    remarks: '',
  }
}

const columns: DataColumn<StockOutEntry>[] = [
  { key: 'transactionNo', header: 'Txn No.', width: 140, nowrap: true },
  { key: 'itemCode', header: 'Item Code', width: 100, nowrap: true },
  { key: 'itemName', header: 'Item Name', width: 220 },
  { key: 'quantity', header: 'Qty', width: 90 },
  { key: 'purpose', header: 'Purpose', width: 220 },
  { key: 'issuedTo', header: 'Issued To', width: 120 },
  { key: 'issuedBy', header: 'Issued By', width: 120 },
  { key: 'date', header: 'Date', width: 110, nowrap: true },
]

interface Props {
  storeItems: StoreItem[]
  setStoreItems: React.Dispatch<React.SetStateAction<StoreItem[]>>
  canCreate: boolean
}

export function StockOutTab({ storeItems, setStoreItems, canCreate }: Props) {
  const { data: entries, setData: setEntries, loading } = useAsyncData(loadStockOutEntries, STOCK_OUT_ENTRIES)
  const [active, setActive] = useState<StockOutEntry | null>(null)
  const [error, setError] = useState('')

  function openNew() {
    setActive(emptyEntry(storeItems))
    setError('')
  }

  function close() {
    setActive(null)
    setError('')
  }

  function save() {
    if (!active || !active.itemCode || active.quantity <= 0) return
    const item = storeItems.find((i) => i.itemCode === active.itemCode)
    if (item && active.quantity > item.quantityInStock) {
      setError(`Only ${item.quantityInStock} ${item.unitOfMeasure} available in stock.`)
      return
    }
    setEntries((prev) => [active, ...prev])
    saveStockOutEntry(active).catch((err) => console.warn('Could not persist stock-out entry:', err))
    setStoreItems((prev) =>
      prev.map((i) => (i.itemCode === active.itemCode ? { ...i, quantityInStock: i.quantityInStock - active.quantity, lastUpdated: active.date } : i)),
    )
    close()
  }

  const itemOptions = storeItems.map((i) => ({ value: i.itemCode, label: `${i.itemCode} - ${i.itemName} (${i.quantityInStock} ${i.unitOfMeasure} avail.)` }))

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        {canCreate && (
          <Button icon={<Plus className="h-4 w-4" />} onClick={openNew}>
            New Stock Out
          </Button>
        )}
      </div>

      {loading ? <p className="text-sm text-muted">Loading stock-out entries…</p> : <DataTable tableKey="stock-out" columns={columns} data={entries} />}

      <Drawer
        open={!!active}
        onClose={close}
        title="New Stock Out"
        subtitle="Issue material out of stores"
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
          <div className="space-y-3">
            {error && <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
            <fieldset className="card grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
              <legend className="mb-2 px-1 text-sm font-semibold text-primary">Stock Out Details</legend>
              <FormField label="Transaction No." required value={active.transactionNo} onChange={(v) => setActive({ ...active, transactionNo: String(v) })} placeholder="SOUT-2026-0XXX" />
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
              <FormField label="Purpose" required value={active.purpose} onChange={(v) => setActive({ ...active, purpose: String(v) })} placeholder="Production Issue - Line 01" />
              <FormField label="Issued To" required value={active.issuedTo} onChange={(v) => setActive({ ...active, issuedTo: String(v) })} />
              <FormField label="Issued By" required value={active.issuedBy} onChange={(v) => setActive({ ...active, issuedBy: String(v) })} />
              <FormField label="Remarks" type="textarea" span={2} value={active.remarks} onChange={(v) => setActive({ ...active, remarks: String(v) })} />
            </fieldset>
          </div>
        )}
      </Drawer>
    </div>
  )
}
