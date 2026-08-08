import { Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { HardRefreshButton } from './HardRefreshButton'
import { NAV } from './nav'
import { ThemeMenu } from './ThemeMenu'
import { UserChip } from './UserChip'

function useBreadcrumb() {
  const { pathname } = useLocation()
  for (const group of NAV) {
    const item = group.items.find((i) => i.to === pathname)
    if (item) return { group: group.label, label: item.label }
  }
  return { group: 'Overview', label: 'Dashboard' }
}

export function Topbar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const crumb = useBreadcrumb()

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={onOpenMobileNav}
          className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-text md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="text-sm">
          <span className="text-muted">{crumb.group}</span>
          <span className="mx-1.5 text-muted">/</span>
          <span className="font-medium text-text">{crumb.label}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        <HardRefreshButton />
        <ThemeMenu />
        <div className="h-6 w-px bg-border" />
        <UserChip />
      </div>
    </header>
  )
}
