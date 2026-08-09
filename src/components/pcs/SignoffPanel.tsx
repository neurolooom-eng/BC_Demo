import { CheckCircle2, Lock, Printer, Unlock } from 'lucide-react'
import { usePcsDay } from '../../context/PcsDayContext'
import { PCS_SHIFTS } from '../../data/pcs'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { StatusChip } from '../ui/StatusChip'
import { ProcessCheckSheetPrint } from './ProcessCheckSheetPrint'

/** Step 3: shift sign-offs, in-charge sign-off, then print (only once signed off). */
export function SignoffPanel() {
  const { sheet, signedOff, updateSignoff, updateHeader, signOff, reopen } = usePcsDay()
  const canSignOff = sheet.inChargeSign.trim().length > 0

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text">Shift sign-offs</h2>
          <StatusChip value={signedOff ? 'Signed off' : 'Draft'} tone={signedOff ? 'success' : 'warning'} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {PCS_SHIFTS.map((s, i) => {
            const so = sheet.signoffs.find((x) => x.shiftCode === s.code)
            return (
              <div key={s.code} className="rounded-lg border border-border p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{['First', 'Second', 'Third'][i]} Shift</p>
                <label className="label">Operator sign</label>
                <input className="input mb-2" value={so?.operator ?? ''} disabled={signedOff} onChange={(e) => updateSignoff(s.code, { operator: e.target.value })} />
                <label className="label">Shift Supervisor Sign</label>
                <input className="input" value={so?.supervisor ?? ''} disabled={signedOff} onChange={(e) => updateSignoff(s.code, { supervisor: e.target.value })} />
              </div>
            )
          })}
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="mb-3 text-sm font-semibold text-text">In-Charge sign-off</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px]">
            <label className="label">In-Charge Signature</label>
            <input className="input" value={sheet.inChargeSign} disabled={signedOff} onChange={(e) => updateHeader({ inChargeSign: e.target.value })} placeholder="In-charge name" />
          </div>
          {signedOff ? (
            <Button variant="outline" icon={<Unlock className="h-4 w-4" />} onClick={reopen}>
              Reopen sheet
            </Button>
          ) : (
            <Button icon={<Lock className="h-4 w-4" />} disabled={!canSignOff} onClick={signOff}>
              Sign off &amp; lock
            </Button>
          )}
          {signedOff && (
            <span className="flex items-center gap-1 text-sm text-success">
              <CheckCircle2 className="h-4 w-4" /> Signed off — ready to print.
            </span>
          )}
          {!signedOff && !canSignOff && <span className="text-xs text-muted">Enter the in-charge name to sign off.</span>}
        </div>
      </Card>

      <Card className="space-y-2 p-2">
        <div className="flex items-center justify-between px-2 pt-1">
          <h2 className="text-sm font-semibold text-text">Print</h2>
          <Button icon={<Printer className="h-4 w-4" />} disabled={!signedOff} onClick={() => window.print()}>
            {signedOff ? 'Print' : 'Print (sign off first)'}
          </Button>
        </div>
        {!signedOff && <p className="px-2 text-xs text-muted">Printing is available once the in-charge has signed off.</p>}
        <div className="overflow-x-auto">
          <ProcessCheckSheetPrint sheet={sheet} />
        </div>
      </Card>
    </div>
  )
}
