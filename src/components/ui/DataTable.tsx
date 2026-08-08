import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown, Columns3, Download, GripVertical, Rows3, Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '../../lib/cn'

export interface DataColumn<T> {
  key: string
  header: string
  width?: number
  nowrap?: boolean
  accessor?: (row: T) => unknown
  render?: (row: T) => React.ReactNode
  toText?: (row: T) => string
}

interface DataTableProps<T> {
  tableKey: string
  columns: DataColumn<T>[]
  data: T[]
  rowsBeforeScroll?: number
  onRowClick?: (row: T) => void
}

const ROW_HEIGHT = { comfortable: 52, compact: 38 } as const

export function DataTable<T extends { id: string | number }>({
  tableKey,
  columns,
  data,
  rowsBeforeScroll = 12,
  onRowClick,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable')
  const [columnOrder, setColumnOrder] = useState<string[]>(columns.map((c) => c.key))
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const [widths, setWidths] = useState<Record<string, number>>(
    Object.fromEntries(columns.map((c) => [c.key, c.width ?? 160])),
  )
  const [showColumnMenu, setShowColumnMenu] = useState(false)
  const dragCol = useRef<string | null>(null)

  // If a caller reuses the same DataTable instance for a genuinely different
  // column set (e.g. swapping columns behind a tab switch without remounting),
  // resync the column-order/width/hidden state instead of keeping stale keys.
  const columnKeySignature = columns.map((c) => c.key).join('|')
  useEffect(() => {
    setColumnOrder(columns.map((c) => c.key))
    setHidden(new Set())
    setWidths(Object.fromEntries(columns.map((c) => [c.key, c.width ?? 160])))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnKeySignature])

  const colDefs = useMemo<ColumnDef<T>[]>(
    () =>
      columns.map((c) => ({
        id: c.key,
        header: c.header,
        accessorFn: (row) => (c.accessor ? c.accessor(row) : (row as Record<string, unknown>)[c.key]),
        cell: (ctx) => (c.render ? c.render(ctx.row.original) : String(ctx.getValue() ?? '—')),
      })),
    [columns],
  )

  const table = useReactTable({
    data,
    columns: colDefs,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const orderedColumns = columnOrder.map((key) => columns.find((c) => c.key === key)!).filter(Boolean)
  const visibleColumns = orderedColumns.filter((c) => !hidden.has(c.key))

  function toggleHidden(key: string) {
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function exportCsv() {
    const header = visibleColumns.map((c) => c.header).join(',')
    const rows = table.getSortedRowModel().rows.map((r) =>
      visibleColumns
        .map((c) => {
          const raw = c.toText ? c.toText(r.original) : String(c.accessor ? c.accessor(r.original) : (r.original as Record<string, unknown>)[c.key] ?? '')
          const escaped = raw.replace(/"/g, '""')
          return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped
        })
        .join(','),
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${tableKey}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function onDrop(targetKey: string) {
    const source = dragCol.current
    if (!source || source === targetKey) return
    setColumnOrder((prev) => {
      const next = prev.filter((k) => k !== source)
      const idx = next.indexOf(targetKey)
      next.splice(idx, 0, source)
      return next
    })
    dragCol.current = null
  }

  const rowHeight = ROW_HEIGHT[density]
  const maxHeight = rowHeight * rowsBeforeScroll + rowHeight

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            className="input pl-8"
            placeholder="Search..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
        <div className="relative">
          <button
            type="button"
            className="btn-outline"
            onClick={() => setShowColumnMenu((s) => !s)}
          >
            <Columns3 className="h-4 w-4" /> Columns
          </button>
          {showColumnMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowColumnMenu(false)} />
              <div className="absolute right-0 z-20 mt-1 w-48 rounded-lg border border-border bg-surface p-2 shadow-card">
                {columns.map((c) => (
                  <label key={c.key} className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-surface-2">
                    <input
                      type="checkbox"
                      checked={!hidden.has(c.key)}
                      onChange={() => toggleHidden(c.key)}
                      className="h-3.5 w-3.5 rounded border-border text-primary"
                    />
                    {c.header}
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
        <button
          type="button"
          className="btn-outline"
          onClick={() => setDensity((d) => (d === 'comfortable' ? 'compact' : 'comfortable'))}
          title="Toggle row density"
        >
          <Rows3 className="h-4 w-4" /> {density === 'comfortable' ? 'Comfortable' : 'Compact'}
        </button>
        <button type="button" className="btn-outline" onClick={exportCsv}>
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="overflow-auto" style={{ maxHeight }}>
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-surface-2">
            <tr>
              {table.getHeaderGroups()[0].headers.map((header) => {
                const col = orderedColumns.find((c) => c.key === header.id)
                if (!col || hidden.has(col.key)) return null
                const colKey = col.key
                const sorted = header.column.getIsSorted()
                return (
                  <th
                    key={header.id}
                    draggable
                    onDragStart={() => (dragCol.current = header.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => onDrop(header.id)}
                    style={{ width: widths[col.key], position: 'relative' }}
                    className="select-none border-b border-border px-3 py-2 text-left align-top text-xs font-semibold uppercase tracking-wide text-muted"
                  >
                    <div className="flex items-center gap-1">
                      <GripVertical className="h-3 w-3 shrink-0 cursor-grab text-muted/60" />
                      <button
                        type="button"
                        className="flex items-center gap-1 hover:text-text"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {sorted === 'asc' && <ArrowUp className="h-3 w-3" />}
                        {sorted === 'desc' && <ArrowDown className="h-3 w-3" />}
                        {!sorted && <ArrowUpDown className="h-3 w-3 opacity-40" />}
                      </button>
                    </div>
                    <div
                      onMouseDown={(e) => {
                        const startX = e.clientX
                        const startWidth = widths[colKey]
                        function onMove(ev: MouseEvent) {
                          setWidths((w) => ({ ...w, [colKey]: Math.max(80, startWidth + ev.clientX - startX) }))
                        }
                        function onUp() {
                          window.removeEventListener('mousemove', onMove)
                          window.removeEventListener('mouseup', onUp)
                        }
                        window.addEventListener('mousemove', onMove)
                        window.addEventListener('mouseup', onUp)
                      }}
                      className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/40"
                    />
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                className={cn('hover:bg-surface-2', onRowClick && 'cursor-pointer')}
                style={{ height: rowHeight }}
              >
                {row.getVisibleCells().map((cell) => {
                  const col = orderedColumns.find((c) => c.key === cell.column.id)
                  if (!col || hidden.has(col.key)) return null
                  return (
                    <td
                      key={cell.id}
                      style={{ width: widths[col.key] }}
                      className={cn('border-b border-border px-3 py-2 align-top text-text', col.nowrap && 'whitespace-nowrap')}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  )
                })}
              </tr>
            ))}
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={visibleColumns.length} className="px-3 py-8 text-center text-sm text-muted">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
