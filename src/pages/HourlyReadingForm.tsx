import { Check, PencilLine, Plus, Printer, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ProcessCheckSheetPrint } from '../components/pcs/ProcessCheckSheetPrint'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { usePcsDay } from '../context/PcsDayContext'
import { DIE_TEMP_PARAM, isOutOfSpec, machineActiveAt, MACHINE_CODES, MAX_MACHINES_PER_DAY, PCS_SHIFTS, SLOT_LINE_PARAMS } from '../data/pcs'
import { cn } from '../lib/cn'
import type { PcsSlotEntry } from '../types/pcs'

type Vals = Record<string, string>

/**
 * Standalone hourly reading capture. Each submission is a child record
 * (PcsSlotEntry) for one shift+slot — line readings plus each active machine's
 * hourly reading — assembled into the day print. Machines can be added mid-day;
 * only machines active at the selected slot are shown, and earlier slots print
 * N/A for a later-added machine. Includes an in-place print of the day sheet.
 */
export function HourlyReadingForm() {
  const { sheet, addSlotEntry, removeSlotEntry, addMachine } = usePcsDay()

  const [shiftCode, setShiftCode] = useState(PCS_SHIFTS[0].code)
  const [slot, setSlot] = useState(PCS_SHIFTS[0].slots[0])
  const [line, setLine] = useState<Vals>({})
  const [machineVals, setMachineVals] = useState<Vals>({})
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [newMc, setNewMc] = useState('')
  const [newBc, setNewBc] = useState('')
  const [showSheet, setShowSheet] = useState(false)

  const shift = PCS_SHIFTS.find((s) => s.code === shiftCode) ?? PCS_SHIFTS[0]
  const activeMachines = sheet.machines.filter((m) => machineActiveAt(m, shiftCode, slot))
  const availableToAdd = MACHINE_CODES.filter((c) => !sheet.machines.some((m) => m.machineCode === c))
  const atMachineLimit = sheet.machines.length >= MAX_MACHINES_PER_DAY

  // Load any existing entry for the selected shift+slot so re-entry edits it.
  useEffect(() => {
    const existing = sheet.slotEntries.find((e) => e.shiftCode === shiftCode && e.slot === slot)
    const nextLine: Vals = {}
    for (const p of SLOT_LINE_PARAMS) nextLine[p.code] = existing ? String(existing.line[p.code] ?? '') : ''
    const nextMc: Vals = {}
    for (const m of activeMachines) nextMc[m.machineCode] = existing ? String(existing.machines[m.machineCode]?.DIE_TEMP ?? '') : ''
    setLine(nextLine)
    setMachineVals(nextMc)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shiftCode, slot, sheet.slotEntries, sheet.machines])

  function num(raw: string): string | number {
    if (raw.trim() === '') return ''
    const n = Number(raw)
    return Number.isNaN(n) ? raw : n
  }

  function save() {
    const lineOut: Record<string, string | number> = {}
    for (const p of SLOT_LINE_PARAMS) {
      if (line[p.code] === '' || line[p.code] == null) continue
      lineOut[p.code] = p.dataType === 'Number' || p.dataType === 'Decimal' ? num(line[p.code]) : line[p.code]
    }
    const mcOut: Record<string, Record<string, string | number>> = {}
    for (const m of activeMachines) {
      const dt = machineVals[m.machineCode]
      if (dt != null && dt !== '') mcOut[m.machineCode] = { DIE_TEMP: num(dt) }
    }
    const entry: PcsSlotEntry = { id: `${shiftCode}-${slot}`, shiftCode, slot, line: lineOut, machines: mcOut }
    addSlotEntry(entry)
    setSavedAt(new Date().toLocaleTimeString())
  }

  function addNewMachine() {
    if (!newMc || atMachineLimit) return
    addMachine({ machineCode: newMc, bcNo: newBc, activeFromShift: shiftCode, activeFromSlot: slot })
    setNewMc('')
    setNewBc('')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <PencilLine className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text">Process Check Sheet — Hourly Entry</h1>
            <p className="text-sm text-muted">
              Capture one time slot at a time. Add machines as they start; earlier slots print N/A for a later-added
              machine. Print the day sheet right here.
            </p>
          </div>
        </div>
        <Button variant="outline" icon={<Printer className="h-4 w-4" />} onClick={() => setShowSheet((v) => !v)}>
          {showSheet ? 'Hide day sheet' : 'Day sheet & print'}
        </Button>
      </div>

      <Card className="p-4">
        <div className="mb-3 flex flex-wrap items-end gap-3">
          <div>
            <label className="label">Shift</label>
            <select
              className="select"
              value={shiftCode}
              onChange={(e) => {
                const s = PCS_SHIFTS.find((x) => x.code === e.target.value)!
                setShiftCode(s.code)
                setSlot(s.slots[0])
              }}
            >
              {PCS_SHIFTS.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Time slot</label>
            <select className="select" value={slot} onChange={(e) => setSlot(e.target.value)}>
              {shift.slots.map((sl) => (
                <option key={sl} value={sl}>
                  {sl}
                </option>
              ))}
            </select>
          </div>
          <Button icon={<Check className="h-4 w-4" />} onClick={save}>
            Save reading
          </Button>
          {savedAt && <span className="text-xs text-success">Saved at {savedAt}. Appears on the day sheet.</span>}
        </div>

        <fieldset className="mb-3">
          <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Line readings</legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SLOT_LINE_PARAMS.map((p) => {
              const raw = line[p.code] ?? ''
              const bad = raw !== '' && isOutOfSpec(p.code, raw)
              return (
                <div key={p.code}>
                  <label className="label">
                    {p.name}
                    {p.min != null || p.max != null ? (
                      <span className="text-muted">
                        {' '}
                        ({p.min ?? '—'}–{p.max ?? '—'}
                        {p.unit ? ` ${p.unit}` : ''})
                      </span>
                    ) : null}
                  </label>
                  <input
                    className={cn('input', bad && 'border-danger ring-2 ring-danger/40')}
                    value={raw}
                    onChange={(e) => setLine((v) => ({ ...v, [p.code]: e.target.value }))}
                  />
                </div>
              )
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
            Machine readings — {DIE_TEMP_PARAM.name} ({DIE_TEMP_PARAM.min}–{DIE_TEMP_PARAM.max} {DIE_TEMP_PARAM.unit}) · active at {shiftCode} {slot}
          </legend>
          {activeMachines.length === 0 ? (
            <p className="text-sm text-muted">No machines active at this slot yet — add one below.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {activeMachines.map((m) => {
                const raw = machineVals[m.machineCode] ?? ''
                const bad = raw !== '' && isOutOfSpec('DIE_TEMP', raw)
                return (
                  <div key={m.machineCode}>
                    <label className="label">
                      M/C {m.machineCode} <span className="text-muted">(from {m.activeFromSlot})</span>
                    </label>
                    <input
                      className={cn('input', bad && 'border-danger ring-2 ring-danger/40')}
                      value={raw}
                      onChange={(e) => setMachineVals((v) => ({ ...v, [m.machineCode]: e.target.value }))}
                    />
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-border pt-3">
            <div>
              <label className="label">Add machine (from {shiftCode} {slot})</label>
              <select className="select w-28" value={newMc} onChange={(e) => setNewMc(e.target.value)} disabled={atMachineLimit}>
                <option value="">M/C…</option>
                {availableToAdd.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">BC No (optional)</label>
              <input className="input w-28" value={newBc} onChange={(e) => setNewBc(e.target.value)} disabled={atMachineLimit} />
            </div>
            <Button variant="outline" icon={<Plus className="h-4 w-4" />} onClick={addNewMachine} disabled={!newMc || atMachineLimit}>
              Add machine
            </Button>
            <span className="text-xs text-muted">
              {sheet.machines.length}/{MAX_MACHINES_PER_DAY} machines{atMachineLimit ? ' — limit reached' : ''}
            </span>
          </div>
        </fieldset>
      </Card>

      <Card className="p-4">
        <h2 className="mb-2 text-sm font-semibold text-text">Captured slots ({sheet.slotEntries.length})</h2>
        {sheet.slotEntries.length === 0 ? (
          <p className="text-sm text-muted">No hourly readings captured yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {sheet.slotEntries.map((e) => (
              <span key={e.id} className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-2 px-2 py-1 text-xs text-text">
                Shift {e.shiftCode} · {e.slot}
                <button type="button" className="text-muted hover:text-danger" onClick={() => removeSlotEntry(e.id)} aria-label="Remove">
                  <Trash2 className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </Card>

      {showSheet && (
        <Card className="space-y-2 p-2">
          <div className="flex items-center justify-between px-2 pt-1">
            <h2 className="text-sm font-semibold text-text">Day sheet preview</h2>
            <Button icon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>
              Print
            </Button>
          </div>
          <div className="overflow-x-auto">
            <ProcessCheckSheetPrint sheet={sheet} />
          </div>
        </Card>
      )}
    </div>
  )
}
