import buildInfo from '../../build-info.json'
import { COMPANY } from '../../data/company'

export function Footer() {
  const year = new Date().getFullYear()
  const builtAt = buildInfo.buildDate ? new Date(buildInfo.buildDate) : null

  return (
    <footer className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-border bg-surface px-4 py-2 text-[11px] text-muted md:px-6">
      <span>© {year} {COMPANY.legalName}. All rights reserved.</span>
      <span className="tabular-nums">
        Build #{buildInfo.buildId}
        {builtAt && ` · ${builtAt.toLocaleDateString()} ${builtAt.toLocaleTimeString()}`}
      </span>
    </footer>
  )
}
