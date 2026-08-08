import { Plus, Trash2 } from 'lucide-react'
import { FURNACE_OPTIONS, LINE_OPTIONS, OK_NOT_OK_OPTIONS, SHIFT_OPTIONS, SUPERVISOR_OPTIONS, YES_NO_OPTIONS } from '../../data/options'
import { cn } from '../../lib/cn'
import { checkSheetStatusTone } from '../../lib/tones'
import type { CheckSheetRecord, MachineReading, OkNotOk, ShiftReading } from '../../types/domain'
import { Button } from '../ui/Button'
import { FormField } from '../ui/FormField'
import { StatusChip } from '../ui/StatusChip'
import { emptyMachineReading, emptyReading } from './emptyCheckSheet'

interface Props {
  record: CheckSheetRecord
  onChange: (record: CheckSheetRecord) => void
  readOnly?: boolean
}

const readingFields: { key: keyof ShiftReading; label: string; type?: 'text' | 'number' }[] = [
  { key: 'time', label: 'Time', type: 'text' },
  { key: 'ingotKg', label: 'Ingot (kg)', type: 'number' },
  { key: 'meltingTempC', label: 'Melting Temp (°C)', type: 'number' },
  { key: 'coverallGrams', label: 'Coverall (g)', type: 'number' },
  { key: 'degassingMin', label: 'Degassing (min)', type: 'number' },
  { key: 'pressureBar', label: 'Pressure (bar)', type: 'number' },
  { key: 'flowRateLpm', label: 'Flow Rate (LPM)', type: 'number' },
  { key: 'rotorRpm', label: 'Rotor (RPM)', type: 'number' },
  { key: 'gasChecking', label: 'Gas Checking', type: 'text' },
  { key: 'roomTempC', label: 'Room Temp (°C)', type: 'number' },
  { key: 'humidityPct', label: 'Humidity (%)', type: 'number' },
  { key: 'holdingFurnaceTempC', label: 'Holding Furnace (°C)', type: 'number' },
]

const machineFields: { key: keyof MachineReading; label: string; type?: 'text' | 'number' }[] = [
  { key: 'mcNo', label: 'M/C No.', type: 'text' },
  { key: 'bcNo', label: 'BC No.', type: 'text' },
  { key: 'dieCoatThicknessMicrons', label: 'Die Coat (µm)', type: 'number' },
  { key: 'diePreheatTempC', label: 'Die Preheat (°C)', type: 'number' },
  { key: 'coolingTimeSec', label: 'Cooling Time (s)', type: 'number' },
  { key: 'pouringTimeSec', label: 'Pouring Time (s)', type: 'number' },
  { key: 'tiltingTimeSec', label: 'Tilting Time (s)', type: 'number' },
  { key: 'degasKillingMin', label: 'Degas Killing (min)', type: 'number' },
  { key: 'dieTempC', label: 'Die Temp (°C)', type: 'number' },
]

function MiniTable<T extends { id: string }>({
  rows,
  fields,
  onChange,
  onAdd,
  onRemove,
  readOnly,
}: {
  rows: T[]
  fields: { key: keyof T; label: string; type?: 'text' | 'number' }[]
  onChange: (rows: T[]) => void
  onAdd: () => void
  onRemove: (id: string) => void
  readOnly?: boolean
}) {
  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface-2">
            <tr>
              {fields.map((f) => (
                <th key={String(f.key)} className="whitespace-nowrap px-2 py-1.5 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  {f.label}
                </th>
              ))}
              {!readOnly && <th className="w-8" />}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-border">
                {fields.map((f) => (
                  <td key={String(f.key)} className="px-2 py-1">
                    <input
                      className="input py-1"
                      type={f.type === 'number' ? 'number' : 'text'}
                      value={row[f.key] as string | number}
                      disabled={readOnly}
                      onChange={(e) =>
                        onChange(
                          rows.map((r) =>
                            r.id === row.id
                              ? { ...r, [f.key]: f.type === 'number' ? e.target.valueAsNumber || 0 : e.target.value }
                              : r,
                          ),
                        )
                      }
                    />
                  </td>
                ))}
                {!readOnly && (
                  <td className="px-2 py-1">
                    <button type="button" onClick={() => onRemove(row.id)} className="rounded p-1 text-muted hover:bg-danger/10 hover:text-danger">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!readOnly && (
        <Button variant="outline" icon={<Plus className="h-3.5 w-3.5" />} onClick={onAdd} className="text-xs">
          Add Row
        </Button>
      )}
    </div>
  )
}

export function CheckSheetForm({ record, onChange, readOnly }: Props) {
  return (
    <div className="space-y-4">
      <fieldset className="card grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
        <legend className="mb-2 px-1 text-sm font-semibold text-primary">Line Setup</legend>
        <FormField label="Production Line" type="select" required value={record.line} options={LINE_OPTIONS} readOnly={readOnly} onChange={(v) => onChange({ ...record, line: v as CheckSheetRecord['line'] })} />
        <FormField label="Date" type="date" required value={record.date} readOnly={readOnly} onChange={(v) => onChange({ ...record, date: String(v) })} />
        <FormField label="Shift" type="select" required value={record.shift} options={SHIFT_OPTIONS} readOnly={readOnly} onChange={(v) => onChange({ ...record, shift: v as CheckSheetRecord['shift'] })} />
        <FormField label="Furnace No." type="select" required value={record.furnaceNo} options={FURNACE_OPTIONS} readOnly={readOnly} onChange={(v) => onChange({ ...record, furnaceNo: String(v) })} />
        <FormField label="Metal Grade" value={record.metalGrade} readOnly={readOnly} onChange={(v) => onChange({ ...record, metalGrade: String(v) })} />
        <FormField label="Degassing Gas" value={record.degassingGas} readOnly={readOnly} onChange={(v) => onChange({ ...record, degassingGas: String(v) })} />
        <FormField label="Best Cast Alloy" type="select" value={record.bestCastAlloy} options={YES_NO_OPTIONS} readOnly={readOnly} onChange={(v) => onChange({ ...record, bestCastAlloy: v as CheckSheetRecord['bestCastAlloy'] })} />
        <FormField label="Other Alloy" type="select" value={record.otherAlloy} options={YES_NO_OPTIONS} readOnly={readOnly} onChange={(v) => onChange({ ...record, otherAlloy: v as CheckSheetRecord['otherAlloy'] })} />
        <div>
          <p className="label">Record Status</p>
          <StatusChip value={record.status} tone={checkSheetStatusTone[record.status]} />
          <p className="mt-0.5 text-[11px] text-muted">Changes only via the Send for Review / Approve actions below.</p>
        </div>
      </fieldset>

      <fieldset className="card p-4">
        <legend className="mb-2 px-1 text-sm font-semibold text-primary">Shift Readings</legend>
        <MiniTable
          rows={record.readings}
          fields={readingFields}
          readOnly={readOnly}
          onChange={(readings) => onChange({ ...record, readings })}
          onAdd={() => onChange({ ...record, readings: [...record.readings, emptyReading()] })}
          onRemove={(id) => onChange({ ...record, readings: record.readings.filter((r) => r.id !== id) })}
        />
      </fieldset>

      <fieldset className="card p-4">
        <legend className="mb-2 px-1 text-sm font-semibold text-primary">Machine Readings</legend>
        <MiniTable
          rows={record.machineReadings}
          fields={machineFields}
          readOnly={readOnly}
          onChange={(machineReadings) => onChange({ ...record, machineReadings })}
          onAdd={() => onChange({ ...record, machineReadings: [...record.machineReadings, emptyMachineReading()] })}
          onRemove={(id) => onChange({ ...record, machineReadings: record.machineReadings.filter((r) => r.id !== id) })}
        />
      </fieldset>

      <fieldset className="card p-4">
        <legend className="mb-2 px-1 text-sm font-semibold text-primary">Core Pin Verification (per cavity)</legend>
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
          {record.corePinChecks.map((c) => (
            <button
              key={c.cavityNo}
              type="button"
              disabled={readOnly}
              onClick={() =>
                onChange({
                  ...record,
                  corePinChecks: record.corePinChecks.map((x) =>
                    x.cavityNo === c.cavityNo ? { ...x, status: (x.status === 'OK' ? 'NOT OK' : 'OK') as OkNotOk } : x,
                  ),
                })
              }
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-md border p-2 text-xs font-medium',
                c.status === 'OK' ? 'border-success/30 bg-success/10 text-success' : 'border-danger/30 bg-danger/10 text-danger',
              )}
            >
              <span className="text-[10px] uppercase text-muted">Cavity {c.cavityNo}</span>
              {c.status}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <FormField label="Comment" type="textarea" value={record.corePinComment} readOnly={readOnly} onChange={(v) => onChange({ ...record, corePinComment: String(v) })} placeholder="Core pin replacement / blockage comments" />
        </div>
      </fieldset>

      <fieldset className="card grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
        <legend className="mb-2 px-1 text-sm font-semibold text-primary">Die Preparation Start-up Checks</legend>
        <FormField label="Die Pre-heating as per SOP" type="select" value={record.diePrep.diePreHeatingPerSop} options={OK_NOT_OK_OPTIONS} readOnly={readOnly} onChange={(v) => onChange({ ...record, diePrep: { ...record.diePrep, diePreHeatingPerSop: v as OkNotOk } })} />
        <FormField label="Die Runner / Raiser Cleaning" type="select" value={record.diePrep.dieRunnerRaiserCleaning} options={OK_NOT_OK_OPTIONS} readOnly={readOnly} onChange={(v) => onChange({ ...record, diePrep: { ...record.diePrep, dieRunnerRaiserCleaning: v as OkNotOk } })} />
        <FormField label="DPT" type="select" value={record.diePrep.dpt} options={OK_NOT_OK_OPTIONS} readOnly={readOnly} onChange={(v) => onChange({ ...record, diePrep: { ...record.diePrep, dpt: v as OkNotOk } })} />
        <FormField label="Core Pin Verification" type="select" value={record.diePrep.coreVerification} options={OK_NOT_OK_OPTIONS} readOnly={readOnly} onChange={(v) => onChange({ ...record, diePrep: { ...record.diePrep, coreVerification: v as OkNotOk } })} />
        <FormField label="Die Spray Coating Apply" type="select" value={record.diePrep.dieSprayCoatingApply} options={OK_NOT_OK_OPTIONS} readOnly={readOnly} onChange={(v) => onChange({ ...record, diePrep: { ...record.diePrep, dieSprayCoatingApply: v as OkNotOk } })} />
        <FormField label="Rejected Sets Comment" type="textarea" value={record.diePrep.rejectedSetsComment} readOnly={readOnly} onChange={(v) => onChange({ ...record, diePrep: { ...record.diePrep, rejectedSetsComment: String(v) } })} />
      </fieldset>

      <fieldset className="card grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
        <legend className="mb-2 px-1 text-sm font-semibold text-primary">Sign-off</legend>
        <FormField label="Operator Sign" type="signature" value={record.signatures.operatorSign} readOnly={readOnly} onChange={(v) => onChange({ ...record, signatures: { ...record.signatures, operatorSign: String(v) } })} />
        <FormField label="Shift Supervisor Sign" type="select" value={record.signatures.shiftSupervisorSign} options={SUPERVISOR_OPTIONS} readOnly={readOnly} onChange={(v) => onChange({ ...record, signatures: { ...record.signatures, shiftSupervisorSign: String(v) } })} />
        <FormField label="In-Charge Sign" type="signature" value={record.signatures.inChargeSign} readOnly={readOnly} onChange={(v) => onChange({ ...record, signatures: { ...record.signatures, inChargeSign: String(v) } })} />
      </fieldset>
    </div>
  )
}
