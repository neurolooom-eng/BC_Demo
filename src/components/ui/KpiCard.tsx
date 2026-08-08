import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/cn'

export interface KpiCardProps {
  label: string
  value: number
  format?: 'int' | 'percent' | 'currency'
  target?: number
  goal?: 'higher' | 'lower'
  icon?: LucideIcon
}

type Rag = 'green' | 'amber' | 'red'

function rag({ value, target, goal = 'higher' }: KpiCardProps): Rag | null {
  if (target === undefined) return null
  const good = goal === 'higher' ? value >= target : value <= target
  if (good) return 'green'
  const near = goal === 'higher' ? value >= target * 0.8 : value <= target * 1.25
  return near ? 'amber' : 'red'
}

const ragBar: Record<Rag, string> = { green: 'bg-success', amber: 'bg-warning', red: 'bg-danger' }
const ragText: Record<Rag, string> = { green: 'text-success', amber: 'text-warning', red: 'text-danger' }

function formatValue(value: number, format: KpiCardProps['format']) {
  if (format === 'percent') return `${value}%`
  if (format === 'currency') return `₹${value.toLocaleString()}`
  return value.toLocaleString()
}

export function KpiCard(props: KpiCardProps) {
  const { label, value, format = 'int', target, goal = 'higher', icon: Icon } = props
  const status = rag(props)

  return (
    <div className="card relative overflow-hidden p-4">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">{label}</span>
        {Icon && (
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className={cn('mt-2 text-3xl font-bold tabular-nums', status && ragText[status])}>
        {formatValue(value, format)}
      </div>
      {target !== undefined && (
        <p className="mt-1 text-xs text-muted">
          Target {goal === 'lower' ? '≤' : '≥'} {formatValue(target, format)}
        </p>
      )}
      {status && <div className={cn('absolute inset-x-0 bottom-0 h-1', ragBar[status])} />}
    </div>
  )
}
