import { AlertTriangle, ClipboardList, PencilLine, Printer } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ProcessCheckSheetPrint } from '../components/pcs/ProcessCheckSheetPrint'
import { usePcsDay } from '../context/PcsDayContext'
import { isOutOfSpec, MAX_MACHINES_PER_DAY, paramByCode, TEST_ALERT_RECIPIENTS } from '../data/pcs'

interface Breach {
  code: string
  shiftCode: string
  slot: string
  machineCode?: string
  value: string | number
}

export function DayCheckSheet() {
  const { sheet } = usePcsDay()

  const breaches: Breach[] = []
  for (const e of sheet.slotEntries) {
    for (const [code, value] of Object.entries(e.line)) {
      if (isOutOfSpec(code, value)) breaches.push({ code, shiftCode: e.shiftCode, slot: e.slot, value })
    }
    for (const [mc, vals] of Object.entries(e.machines)) {
      for (const [code, value] of Object.entries(vals)) {
        if (isOutOfSpec(code, value)) breaches.push({ code, shiftCode: e.shiftCode, slot: e.slot, machineCode: mc, value })
      }
    }
  }

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
              QC FMT 038 Rev 10 · assembled from {sheet.slotEntries.length} hourly reading records · up to{' '}
              {MAX_MACHINES_PER_DAY} machines · {sheet.date} · {sheet.line}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/hourly-reading">
            <Button variant="outline" icon={<PencilLine className="h-4 w-4" />}>
              Hourly readings
            </Button>
          </Link>
          <Button icon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>
            Print
          </Button>
        </div>
      </div>

      {breaches.length > 0 && (
        <Card className="flex items-center gap-2 border-danger/30 bg-danger/5 p-3 text-sm text-danger">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            <b>{breaches.length}</b> out-of-spec reading{breaches.length === 1 ? '' : 's'} on this sheet (highlighted). In
            a live setup these trigger an email alert (test recipient: <b>{TEST_ALERT_RECIPIENTS.join(', ')}</b> until the
            User Master is ready).
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
            {breaches.slice(0, 12).map((b, i) => {
              const p = paramByCode(b.code)
              return (
                <li key={i}>
                  <span className="font-medium text-text">{p?.name}</span>
                  {b.machineCode ? ` (M/C ${b.machineCode})` : ''} · Shift {b.shiftCode} @ {b.slot} ·{' '}
                  <span className="font-semibold text-danger">
                    {String(b.value)}
                    {p?.unit ? ` ${p.unit}` : ''}
                  </span>{' '}
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
