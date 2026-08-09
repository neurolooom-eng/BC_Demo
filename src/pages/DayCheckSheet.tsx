import { AlertTriangle, ClipboardList } from 'lucide-react'
import { useState } from 'react'
import { Card } from '../components/ui/Card'
import { HourlyEntryPanel } from '../components/pcs/HourlyEntryPanel'
import { SheetDetailsPanel } from '../components/pcs/SheetDetailsPanel'
import { SignoffPanel } from '../components/pcs/SignoffPanel'
import { usePcsDay } from '../context/PcsDayContext'
import { isOutOfSpec } from '../data/pcs'
import { cn } from '../lib/cn'

type Step = 'details' | 'hourly' | 'signoff'

const STEPS: { id: Step; label: string }[] = [
  { id: 'details', label: '1 · Sheet details (MC + shift)' },
  { id: 'hourly', label: '2 · Hourly readings' },
  { id: 'signoff', label: '3 · Sign-off & print' },
]

export function DayCheckSheet() {
  const { sheet, signedOff } = usePcsDay()
  const [step, setStep] = useState<Step>('details')

  let breaches = 0
  for (const e of sheet.slotEntries) {
    for (const [code, value] of Object.entries(e.line)) if (isOutOfSpec(code, value)) breaches++
    for (const vals of Object.values(e.machines)) for (const [code, value] of Object.entries(vals)) if (isOutOfSpec(code, value)) breaches++
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <ClipboardList className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text">Process Check Sheet (QC FMT 038)</h1>
          <p className="text-sm text-muted">
            {sheet.line} · {sheet.date} · {signedOff ? 'Signed off' : 'Draft'} — start the sheet, log hourly readings
            through all shifts, then the in-charge signs off and prints.
          </p>
        </div>
      </div>

      <div className="inline-flex flex-wrap rounded-md border border-border bg-surface p-1">
        {STEPS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStep(s.id)}
            className={cn('rounded px-3 py-1.5 text-sm font-medium', step === s.id ? 'bg-primary/12 text-primary' : 'text-muted hover:text-text')}
          >
            {s.label}
          </button>
        ))}
      </div>

      {breaches > 0 && (
        <Card className="flex items-center gap-2 border-danger/30 bg-danger/5 p-3 text-sm text-danger">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            <b>{breaches}</b> out-of-spec reading{breaches === 1 ? '' : 's'} captured (highlighted red on the print, alert
            to the configured recipients in a live setup).
          </span>
        </Card>
      )}

      {step === 'details' && <SheetDetailsPanel />}
      {step === 'hourly' && <HourlyEntryPanel />}
      {step === 'signoff' && <SignoffPanel />}
    </div>
  )
}
