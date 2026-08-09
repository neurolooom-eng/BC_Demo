import { Plus } from 'lucide-react'
import { useState } from 'react'
import { usePcsDay } from '../../context/PcsDayContext'
import { MACHINE_CODES, MAX_MACHINES_PER_DAY, PCS_SHIFTS } from '../../data/pcs'
import type { PcsMachineSetup } from '../../types/pcs'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { FormField } from '../ui/FormField'
import { StatusChip } from '../ui/StatusChip'

/** Step 1 of the sheet: shift/day header + machine (die) details. */
export function SheetDetailsPanel() {
  const { sheet, signedOff, updateHeader, addMachine, updateMachine, stopMachine, reactivateMachine } = usePcsDay()
  const ro = signedOff

  const [newMc, setNewMc] = useState('')
  const [newShift, setNewShift] = useState(PCS_SHIFTS[0].code)
  const [newSlot, setNewSlot] = useState(PCS_SHIFTS[0].slots[0])

  const available = MACHINE_CODES.filter((c) => !sheet.machines.some((m) => m.machineCode === c))
  const atLimit = sheet.machines.length >= MAX_MACHINES_PER_DAY
  const shiftForNew = PCS_SHIFTS.find((s) => s.code === newShift) ?? PCS_SHIFTS[0]

  function numPatch(code: string, key: keyof PcsMachineSetup, raw: string) {
    const n = raw === '' ? undefined : Number(raw)
    updateMachine(code, { [key]: Number.isNaN(n as number) ? undefined : n } as Partial<PcsMachineSetup>)
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h2 className="mb-3 text-sm font-semibold text-text">Shift / day details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Line" value={sheet.line} readOnly={ro} onChange={(v) => updateHeader({ line: String(v) })} />
          <FormField label="Date" type="date" value={sheet.date} readOnly={ro} onChange={(v) => updateHeader({ date: String(v) })} />
          <FormField label="Metal Grade" value={sheet.metalGrade} readOnly={ro} onChange={(v) => updateHeader({ metalGrade: String(v) })} />
          <FormField label="Degassing Gas" value={sheet.degassingGas} readOnly={ro} onChange={(v) => updateHeader({ degassingGas: String(v) })} />
          <FormField label="Furnace No." value={sheet.furnaceNos} readOnly={ro} onChange={(v) => updateHeader({ furnaceNos: String(v) })} />
          <FormField label="Best Cast Alloy" type="boolean" placeholder="Yes" value={sheet.bestCastAlloy} readOnly={ro} onChange={(v) => updateHeader({ bestCastAlloy: Boolean(v) })} />
          <FormField label="Other Alloy" type="boolean" placeholder="Yes" value={sheet.otherAlloy} readOnly={ro} onChange={(v) => updateHeader({ otherAlloy: Boolean(v) })} />
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="mb-1 text-sm font-semibold text-text">Machine (die) details</h2>
        <p className="mb-3 text-xs text-muted">Machines running this day. Add a machine as it starts; stop it if it goes down — the print shows N/A outside its window.</p>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-surface-2">
              <tr>
                {['M/C', 'BC No.', 'Die coat thk', 'Die preheat', 'Cooling', 'Pouring', 'Tilting', 'Degas kill', 'Window', ''].map((h) => (
                  <th key={h} className="border-b border-border px-2 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sheet.machines.map((m) => {
                const stopped = Boolean(m.stoppedFromSlot)
                const mini = (key: keyof PcsMachineSetup) => (
                  <input
                    className="input h-7 w-16 px-1 py-0"
                    value={(m[key] as number | undefined) ?? ''}
                    disabled={ro}
                    onChange={(e) => (key === 'bcNo' ? updateMachine(m.machineCode, { bcNo: e.target.value }) : numPatch(m.machineCode, key, e.target.value))}
                  />
                )
                return (
                  <tr key={m.machineCode} className="hover:bg-surface-2">
                    <td className="border-b border-border px-2 py-1.5 font-semibold text-text">{m.machineCode}</td>
                    <td className="border-b border-border px-2 py-1.5">
                      <input className="input h-7 w-16 px-1 py-0" value={m.bcNo} disabled={ro} onChange={(e) => updateMachine(m.machineCode, { bcNo: e.target.value })} />
                    </td>
                    <td className="border-b border-border px-2 py-1.5">{mini('dieCoatThickness')}</td>
                    <td className="border-b border-border px-2 py-1.5">{mini('diePreheatTemp')}</td>
                    <td className="border-b border-border px-2 py-1.5">{mini('coolingTime')}</td>
                    <td className="border-b border-border px-2 py-1.5">{mini('pouringTime')}</td>
                    <td className="border-b border-border px-2 py-1.5">{mini('tiltingTime')}</td>
                    <td className="border-b border-border px-2 py-1.5">{mini('degasKillingTime')}</td>
                    <td className="border-b border-border px-2 py-1.5 text-xs text-muted">
                      {m.activeFromSlot}
                      {stopped ? ` → ${m.stoppedFromSlot}` : ''}
                      <br />
                      {stopped ? <StatusChip value="stopped" tone="danger" /> : <StatusChip value="running" tone="success" />}
                    </td>
                    <td className="border-b border-border px-2 py-1.5">
                      {!ro &&
                        (stopped ? (
                          <button type="button" className="text-xs font-medium text-primary hover:underline" onClick={() => reactivateMachine(m.machineCode)}>
                            Reactivate
                          </button>
                        ) : (
                          <button type="button" className="text-xs font-medium text-danger hover:underline" onClick={() => stopMachine(m.machineCode, m.activeFromShift, m.activeFromSlot)}>
                            Stop
                          </button>
                        ))}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {!ro && (
          <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-border pt-3">
            <div>
              <label className="label">Add M/C</label>
              <select className="select w-24" value={newMc} onChange={(e) => setNewMc(e.target.value)} disabled={atLimit}>
                <option value="">M/C…</option>
                {available.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">From shift</label>
              <select
                className="select w-28"
                value={newShift}
                onChange={(e) => {
                  const s = PCS_SHIFTS.find((x) => x.code === e.target.value)!
                  setNewShift(s.code)
                  setNewSlot(s.slots[0])
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
              <label className="label">From slot</label>
              <select className="select w-24" value={newSlot} onChange={(e) => setNewSlot(e.target.value)}>
                {shiftForNew.slots.map((sl) => (
                  <option key={sl} value={sl}>
                    {sl}
                  </option>
                ))}
              </select>
            </div>
            <Button
              variant="outline"
              icon={<Plus className="h-4 w-4" />}
              disabled={!newMc || atLimit}
              onClick={() => {
                if (!newMc) return
                addMachine({ machineCode: newMc, bcNo: '', activeFromShift: newShift, activeFromSlot: newSlot })
                setNewMc('')
              }}
            >
              Add machine
            </Button>
            <span className="text-xs text-muted">
              {sheet.machines.length}/{MAX_MACHINES_PER_DAY}
              {atLimit ? ' — limit reached' : ''}
            </span>
          </div>
        )}
      </Card>
    </div>
  )
}
