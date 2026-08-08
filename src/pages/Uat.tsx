import { ClipboardCheck } from 'lucide-react'
import { useState } from 'react'
import { Card } from '../components/ui/Card'
import { StatusChip } from '../components/ui/StatusChip'
import { UAT_META, UAT_SUITES } from '../data/uat'
import { cn } from '../lib/cn'

type Result = 'pass' | 'fail' | 'na'
type Results = Record<string, Result>

const STORAGE_KEY = 'bestcast.uatResults'

function readResults(): Results {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}') as Results
  } catch {
    return {}
  }
}

const OPTIONS: { value: Result; label: string; active: string }[] = [
  { value: 'pass', label: 'Pass', active: 'border-success bg-success/15 text-success' },
  { value: 'fail', label: 'Fail', active: 'border-danger bg-danger/15 text-danger' },
  { value: 'na', label: 'Not run', active: 'border-border bg-surface-2 text-muted' },
]

export function Uat() {
  const [results, setResults] = useState<Results>(readResults)

  function setResult(caseId: string, value: Result) {
    setResults((prev) => {
      const next = { ...prev, [caseId]: value }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const allCases = UAT_SUITES.flatMap((s) => s.cases)
  const passed = allCases.filter((c) => results[c.id] === 'pass').length
  const failed = allCases.filter((c) => results[c.id] === 'fail').length
  const remaining = allCases.length - passed - failed

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <ClipboardCheck className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text">{UAT_META.documentTitle}</h1>
          <p className="text-sm text-muted">
            {UAT_META.product} · v{UAT_META.version} · Updated {UAT_META.updated}
          </p>
        </div>
      </div>

      <Card className="flex flex-wrap items-center gap-4 p-4">
        <div className="flex items-center gap-2 text-sm">
          <StatusChip value={`${passed} passed`} tone="success" />
          <StatusChip value={`${failed} failed`} tone="danger" />
          <StatusChip value={`${remaining} remaining`} tone="neutral" />
        </div>
        <p className="text-xs text-muted">Results are saved in this browser. Developer-only document.</p>
      </Card>

      {UAT_SUITES.map((suite) => (
        <Card key={suite.id} className="p-5">
          <h2 className="text-lg font-bold text-text">{suite.feature}</h2>
          <div className="mt-3 space-y-3">
            {suite.cases.map((c) => (
              <div key={c.id} className="rounded-lg border border-border p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-primary">{c.id}</span>
                      <span className="text-sm font-semibold text-text">{c.title}</span>
                      <span className="font-mono text-[10px] text-muted">↳ {c.requirement}</span>
                    </div>
                    {c.preconditions && (
                      <p className="mt-1 text-xs text-muted">
                        <span className="font-semibold">Preconditions:</span> {c.preconditions}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 overflow-hidden rounded-md border border-border">
                    {OPTIONS.map((opt) => {
                      const isActive = results[c.id] === opt.value || (!results[c.id] && opt.value === 'na')
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setResult(c.id, opt.value)}
                          className={cn('border-l border-border px-2.5 py-1 text-xs first:border-l-0', isActive ? opt.active : 'bg-surface text-muted hover:bg-surface-2')}
                        >
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-muted">Steps</p>
                <ol className="ml-5 list-decimal space-y-0.5 text-sm text-muted marker:text-primary">
                  {c.steps.map((s, i) => (
                    <li key={i} className="pl-1">
                      {s}
                    </li>
                  ))}
                </ol>
                <p className="mt-2 text-sm text-text">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">Expected: </span>
                  {c.expected}
                </p>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}
