import { Check, PencilLine, Printer, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { usePcsDay } from '../context/PcsDayContext'
import { DIE_TEMP_PARAM, isOutOfSpec, PCS_SHIFTS, SLOT_LINE_PARAMS } from '../data/pcs'
import { cn } from '../lib/cn'
import type { PcsSlotEntry } from '../types/pcs'

type Vals = Record<string, string>

/**
 * Standalone hourly reading capture. Each submission is a child record
 * (PcsSlotEntry) for one shift+slot — line readings plus each machine's
 * hourly readings — which the day print assembles into the grid at print time.
 */
export function HourlyReadingForm() {
  const { sheet, addSlotEntry, removeSlotEntry } = usePcsDay()
  const machines = sheet.machines.map((m) => m.machineCode)

  const [shiftCode, setShiftCode] = useState(PCS_SHIFTS[0].code)
  const [slot, setSlot] = useState(PCS_SHIFTS[0].slots[0])
  const [line, setLine] = useState<Vals>({})
  const [machineVals, setMachineVals] = useState<Record<string, Vals>>({})
  const [savedAt, setSavedAt] = useState<string | null>(null)

  const shift = PCS_SHIFTS.find((s) => s.code === shiftCode) ?? PCS_SHIFTS[0]

  // Load any existing entry for the selected shift+slot so re-entry edits it.
  useEffect(() => {
    const existing = sheet.slotEntries.find((e) => e.shiftCode === shiftCode && e.slot === slot)
    const nextLine: Vals = {}
    for (const p of SLOT_LINE_PARAMS) nextLine[p.code] = existing ? String(existing.line[p.code] ?? '') : ''
    const nextMc: Record<string, Vals> = {}
    for (const mc of machines) nextMc[mc] = { DIE_TEMP: existing ? String(existing.machines[mc]?.DIE_TEMP ?? '') : '' }
    setLine(nextLine)
    setMachineVals(nextMc)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shiftCode, slot, sheet.slotEntries])

  function toValue(code: string, raw: string): string | number {
    const p = SLOT_LINE_PARAMS.find((x) => x.code === code) ?? DIE_TEMP_PARAM
    if ((p.dataType === 'Number' || p.dataType === 'Decimal') && raw.trim() !== '') {
      const n = Number(raw)
      return Number.isNaN(n) ? raw : n
    }
    return raw
  }

  function save() {
    const lineOut: Record<string, string | number> = {}
    for (const p of SLOT_LINE_PARAMS) if (line[p.code] !== '') lineOut[p.code] = toValue(p.code, line[p.code])
    const mcOut: Record<string, Record<string, string | number>> = {}
    for (const mc of machines) {
      const dt = machineVals[mc]?.DIE_TEMP
      if (dt != null && dt !== '') mcOut[mc] = { DIE_TEMP: toValue('DIE_TEMP', dt) }
    }
    const entry: PcsSlotEntry = { id: `${shiftCode}-${slot}`, shiftCode, slot, line: lineOut, machines: mcOut }
    addSlotEntry(entry)
    setSavedAt(new Date().toLocaleTimeString())
  }

  const captured = sheet.slotEntries

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <PencilLine className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text">Hourly Readings</h1>
            <p className="text-sm text-muted">
              Capture one time slot at a time. Each entry is a child record appended to the day sheet and assembled into
              the print, aligned by slot.
            </p>
          </div>
        </div>
        <Link to="/day-check-sheet">
          <Button variant="outline" icon={<Printer className="h-4 w-4" />}>
            Day print
          </Button>
        </Link>
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
          {savedAt && <span className="text-xs text-success">Saved at {savedAt}. Appears on the day print.</span>}
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
            Machine readings — {DIE_TEMP_PARAM.name} ({DIE_TEMP_PARAM.min}–{DIE_TEMP_PARAM.max} {DIE_TEMP_PARAM.unit})
          </legend>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {machines.map((mc) => {
              const raw = machineVals[mc]?.DIE_TEMP ?? ''
              const bad = raw !== '' && isOutOfSpec('DIE_TEMP', raw)
              return (
                <div key={mc}>
                  <label className="label">M/C {mc}</label>
                  <input
                    className={cn('input', bad && 'border-danger ring-2 ring-danger/40')}
                    value={raw}
                    onChange={(e) => setMachineVals((v) => ({ ...v, [mc]: { DIE_TEMP: e.target.value } }))}
                  />
                </div>
              )
            })}
          </div>
        </fieldset>
      </Card>

      <Card className="p-4">
        <h2 className="mb-2 text-sm font-semibold text-text">Captured slots ({captured.length})</h2>
        {captured.length === 0 ? (
          <p className="text-sm text-muted">No hourly readings captured yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {captured.map((e) => (
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
    </div>
  )
}
