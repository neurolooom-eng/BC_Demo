import { Ruler } from 'lucide-react'
import { DataTable, type DataColumn } from '../components/ui/DataTable'
import { StatusChip } from '../components/ui/StatusChip'
import { SPECIFICATIONS } from '../data/specifications'
import { loadSpecifications } from '../data/repository'
import { useAsyncData } from '../lib/useAsyncData'
import type { Specification } from '../types/domain'

const columns: DataColumn<Specification>[] = [
  { key: 'category', header: 'Category', width: 160, render: (r) => <StatusChip value={r.category} tone="primary" /> },
  { key: 'parameter', header: 'Parameter', width: 280 },
  { key: 'allowedValues', header: 'Allowed Values / Tolerance', width: 320 },
  { key: 'range', header: 'Range', width: 130, accessor: (r) => (r.min !== undefined ? `${r.min} - ${r.max}` : ''), render: (r) => (r.min !== undefined ? `${r.min} - ${r.max}` : <span className="text-muted">—</span>) },
  { key: 'unit', header: 'Unit', width: 90, render: (r) => r.unit ?? <span className="text-muted">—</span> },
]

export function Specifications() {
  const { data, loading } = useAsyncData(loadSpecifications, SPECIFICATIONS)

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Ruler className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text">Specifications & Tolerances</h1>
          <p className="text-sm text-muted">
            Master process parameters for the Mando Model Line, digitised from the quality process check sheet
            specification. Used to validate values entered on Process Check Sheets.
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading specifications…</p>
      ) : (
        <DataTable tableKey="specifications" columns={columns} data={data} />
      )}
    </div>
  )
}
