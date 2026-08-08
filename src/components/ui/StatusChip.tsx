export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'primary'

const toneClass: Record<Tone, string> = {
  neutral: 'bg-muted/15 text-muted',
  info: 'bg-info/15 text-info',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/20 text-warning',
  danger: 'bg-danger/15 text-danger',
  primary: 'bg-primary/15 text-primary',
}

export function StatusChip({ value, tone = 'neutral', dot = true }: { value?: string; tone?: Tone; dot?: boolean }) {
  if (!value) return <span className="text-muted">—</span>
  return (
    <span className={`chip ${toneClass[tone]}`}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />}
      {value}
    </span>
  )
}
