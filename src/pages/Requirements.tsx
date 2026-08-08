import { FileCheck2 } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { StatusChip, type Tone } from '../components/ui/StatusChip'
import { REQUIREMENTS, REQUIREMENTS_META, type Priority } from '../data/requirements'

const PRIORITY_TONE: Record<Priority, Tone> = { Must: 'danger', Should: 'warning', Could: 'info' }

export function Requirements() {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <FileCheck2 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text">{REQUIREMENTS_META.documentTitle}</h1>
          <p className="text-sm text-muted">
            {REQUIREMENTS_META.product} · v{REQUIREMENTS_META.version} · {REQUIREMENTS_META.status} · Updated{' '}
            {REQUIREMENTS_META.updated}
          </p>
        </div>
      </div>

      <Card className="border-warning/30 bg-warning/5 p-3 text-xs text-muted">
        Developer-only document. Requirement IDs are stable and referenced by the UAT plan.
      </Card>

      {REQUIREMENTS.map((feature) => (
        <Card key={feature.id} className="p-5">
          <h2 className="text-lg font-bold text-text">{feature.feature}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">{feature.overview}</p>

          <div className="mt-4 space-y-3">
            {feature.requirements.map((req) => (
              <div key={req.id} className="rounded-lg border border-border p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-primary">{req.id}</span>
                  <span className="text-sm font-semibold text-text">{req.title}</span>
                  <StatusChip value={req.priority} tone={PRIORITY_TONE[req.priority]} />
                </div>
                <p className="mt-1 text-sm text-muted">{req.description}</p>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-muted">Acceptance criteria</p>
                <ul className="ml-5 list-disc space-y-1 text-sm text-muted marker:text-primary">
                  {req.acceptanceCriteria.map((c, i) => (
                    <li key={i} className="pl-1">
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}
