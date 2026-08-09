import { AlertTriangle, ClipboardList, Printer } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ProcessCheckSheetPrint } from '../components/pcs/ProcessCheckSheetPrint'
import { DEMO_DAY_SHEET, isOutOfSpec, paramByCode } from '../data/pcs'

export function DayCheckSheet() {
  const sheet = DEMO_DAY_SHEET
  const breaches = sheet.readings.filter((r) => isOutOfSpec(r.parameterCode, r.value))

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text">Process Check Sheet — Day Print</h1>
            <p className="text-sm text-muted">
              QC FMT 038 Rev 10 · one sheet per day, all three shifts · {sheet.date} · {sheet.line}
            </p>
          </div>
        </div>
        <Button icon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>
          Print
        </Button>
      </div>

      {breaches.length > 0 && (
        <Card className="flex items-center gap-2 border-danger/30 bg-danger/5 p-3 text-sm text-danger">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            <b>{breaches.length}</b> out-of-spec reading{breaches.length === 1 ? '' : 's'} on this sheet (shown in red). In
            a live setup these also trigger an email alert to the configured recipients.
          </span>
        </Card>
      )}

      <Card className="overflow-x-auto p-2">
        <ProcessCheckSheetPrint sheet={sheet} />
      </Card>

      <Card className="p-4">
        <h2 className="mb-2 text-sm font-semibold text-text">Out-of-spec readings</h2>
        {breaches.length === 0 ? (
          <p className="text-sm text-muted">None — all readings within spec.</p>
        ) : (
          <ul className="space-y-1 text-sm text-muted">
            {breaches.slice(0, 12).map((r, i) => {
              const p = paramByCode(r.parameterCode)
              return (
                <li key={i}>
                  <span className="font-medium text-text">{p?.name}</span>
                  {r.machineCode ? ` (M/C ${r.machineCode})` : ''} · Shift {r.shiftCode} @ {r.slot} ·{' '}
                  <span className="font-semibold text-danger">{String(r.value)}{p?.unit ? ` ${p.unit}` : ''}</span>{' '}
                  <span className="text-muted">
                    (spec {p?.min ?? '—'}–{p?.max ?? '—'})
                  </span>
                </li>
              )
            })}
            {breaches.length > 12 && <li className="text-muted">…and {breaches.length - 12} more.</li>}
          </ul>
        )}
      </Card>
    </div>
  )
}
