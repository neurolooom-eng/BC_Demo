import { Package } from 'lucide-react'
import { useState } from 'react'
import { StockInTab } from '../components/stores/StockInTab'
import { StockLevelsTab } from '../components/stores/StockLevelsTab'
import { StockOutTab } from '../components/stores/StockOutTab'
import { StockTransferTab } from '../components/stores/StockTransferTab'
import { useAccess } from '../context/AccessContext'
import { loadStoreItems } from '../data/repository'
import { STORE_ITEMS } from '../data/storeItems'
import { cn } from '../lib/cn'
import { useAsyncData } from '../lib/useAsyncData'

const TABS = [
  { id: 'levels', label: 'Stock Levels' },
  { id: 'in', label: 'Stock In' },
  { id: 'out', label: 'Stock Out' },
  { id: 'transfer', label: 'Stock Transfer' },
] as const

type TabId = (typeof TABS)[number]['id']

export function Stores() {
  const { hasPermission } = useAccess()
  const canCreate = hasPermission('stores:create')
  const canEdit = hasPermission('stores:edit')

  const [tab, setTab] = useState<TabId>('levels')
  const { data: items, setData: setItems, loading } = useAsyncData(loadStoreItems, STORE_ITEMS)

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Package className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text">Stores & Inventory</h1>
          <p className="text-sm text-muted">Stock levels, receipts, issues and inter-location transfers.</p>
        </div>
      </div>

      <div className="inline-flex flex-wrap rounded-md border border-border bg-surface p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn('rounded px-3 py-1.5 text-sm font-medium', tab === t.id ? 'bg-primary/12 text-primary' : 'text-muted hover:text-text')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'levels' && <StockLevelsTab items={items} setItems={setItems} loading={loading} canCreate={canCreate} canEdit={canEdit} />}
      {tab === 'in' && <StockInTab storeItems={items} setStoreItems={setItems} canCreate={canCreate} />}
      {tab === 'out' && <StockOutTab storeItems={items} setStoreItems={setItems} canCreate={canCreate} />}
      {tab === 'transfer' && <StockTransferTab storeItems={items} setStoreItems={setItems} canCreate={canCreate} />}
    </div>
  )
}
