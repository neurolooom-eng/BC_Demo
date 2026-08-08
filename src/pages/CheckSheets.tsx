import { ClipboardList, Plus } from 'lucide-react'
import { useState } from 'react'
import { CheckSheetForm } from '../components/checksheet/CheckSheetForm'
import { emptyCheckSheet } from '../components/checksheet/emptyCheckSheet'
import { Button } from '../components/ui/Button'
import { DataTable, type DataColumn } from '../components/ui/DataTable'
import { Drawer } from '../components/ui/Drawer'
import { StatusChip } from '../components/ui/StatusChip'
import { useAccess } from '../context/AccessContext'
import { CHECK_SHEETS } from '../data/checkSheets'
import { loadCheckSheets, saveCheckSheet, updateCheckSheet } from '../data/repository'
import { checkSheetStatusTone } from '../lib/tones'
import { useAsyncData } from '../lib/useAsyncData'
import type { CheckSheetRecord } from '../types/domain'

const columns: DataColumn<CheckSheetRecord>[] = [
  { key: 'date', header: 'Date', width: 110, nowrap: true },
  { key: 'line', header: 'Line', width: 100, nowrap: true },
  { key: 'shift', header: 'Shift', width: 80 },
  { key: 'furnaceNo', header: 'Furnace', width: 90 },
  { key: 'status', header: 'Status', width: 110, render: (r) => <StatusChip value={r.status} tone={checkSheetStatusTone[r.status]} /> },
  { key: 'operator', header: 'Operator', width: 140, accessor: (r) => r.signatures.operatorSign },
  { key: 'supervisor', header: 'Shift Supervisor', width: 140, accessor: (r) => r.signatures.shiftSupervisorSign },
  { key: 'inCharge', header: 'In-Charge', width: 120, accessor: (r) => r.signatures.inChargeSign },
]

export function CheckSheets() {
  const { hasPermission } = useAccess()
  const canCreate = hasPermission('checksheets:create')
  const { data: records, setData: setRecords, loading } = useAsyncData(loadCheckSheets, CHECK_SHEETS)
  const [active, setActive] = useState<CheckSheetRecord | null>(null)
  const [isNew, setIsNew] = useState(false)

  /** draft -> editable by the creator; submitted -> editable only by the line supervisor; approved -> locked forever. */
  function canEditRecord(record: CheckSheetRecord) {
    if (record.status === 'approved') return false
    if (record.status === 'draft') return hasPermission('checksheets:create')
    return hasPermission('checksheets:edit')
  }

  function openNew() {
    setActive(emptyCheckSheet())
    setIsNew(true)
  }

  function openRow(record: CheckSheetRecord) {
    setActive(record)
    setIsNew(false)
  }

  function close() {
    setActive(null)
    setIsNew(false)
  }

  function saveDraft() {
    if (!active) return
    setRecords((prev) => [active, ...prev])
    saveCheckSheet(active).catch((err) => console.warn('Could not persist check sheet to Google Sheets:', err))
    close()
  }

  function saveChanges() {
    if (!active) return
    setRecords((prev) => prev.map((r) => (r.id === active.id ? active : r)))
    updateCheckSheet(active).catch((err) => console.warn('Could not persist check sheet changes to Google Sheets:', err))
    close()
  }

  function sendForReview() {
    if (!active) return
    const updated: CheckSheetRecord = { ...active, status: 'submitted' }
    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
    updateCheckSheet(updated).catch((err) => console.warn('Could not persist status change to Google Sheets:', err))
    close()
  }

  function approve() {
    if (!active) return
    const updated: CheckSheetRecord = { ...active, status: 'approved' }
    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
    updateCheckSheet(updated).catch((err) => console.warn('Could not persist status change to Google Sheets:', err))
    close()
  }

  const editable = !!active && (isNew || canEditRecord(active))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text">Process Check Sheets</h1>
            <p className="text-sm text-muted">
              Production line records (QC FMT 038) - one entry per shift, per line. Click a row to open it. Every
              sheet starts as a <strong className="text-text">Draft</strong>, moves to{' '}
              <strong className="text-text">Submitted</strong> via Send for Review (editable by the line
              supervisor), then <strong className="text-text">Approved</strong> - locked for good.
            </p>
          </div>
        </div>
        {canCreate && (
          <Button icon={<Plus className="h-4 w-4" />} onClick={openNew}>
            New Check Sheet
          </Button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading check sheets…</p>
      ) : (
        <DataTable tableKey="check-sheets" columns={columns} data={records} onRowClick={openRow} />
      )}

      <Drawer
        open={!!active}
        onClose={close}
        wide
        title={isNew ? 'New Process Check Sheet' : `Check Sheet - ${active?.line} · ${active?.date} · ${active?.shift} Shift`}
        subtitle="QC FMT 038 · Rev.10"
        footer={
          <>
            <Button variant="outline" onClick={close}>
              {isNew ? 'Cancel' : 'Close'}
            </Button>
            {isNew && <Button onClick={saveDraft}>Save Draft</Button>}
            {!isNew && active && editable && <Button variant="outline" onClick={saveChanges}>Save Changes</Button>}
            {!isNew && active && active.status === 'draft' && editable && (
              <Button onClick={sendForReview}>Send for Review</Button>
            )}
            {!isNew && active && active.status === 'submitted' && hasPermission('checksheets:approve') && (
              <Button onClick={approve}>Approve</Button>
            )}
          </>
        }
      >
        {active && <CheckSheetForm record={active} onChange={setActive} readOnly={!editable} />}
      </Drawer>
    </div>
  )
}
