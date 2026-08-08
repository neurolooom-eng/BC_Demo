import { ChevronsLeft, ChevronsRight, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAccess } from '../../context/AccessContext'
import { cn } from '../../lib/cn'
import { Logo } from './Logo'
import { NAV } from './nav'

interface SidebarProps {
  collapsed: boolean
  onToggleCollapsed: () => void
  mobileOpen: boolean
  onCloseMobile: () => void
}

function SidebarContent({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const { hasPermission } = useAccess()
  const visibleGroups = NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.permission || hasPermission(item.permission)),
  })).filter((group) => group.items.length > 0)

  return (
    <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-4">
      {visibleGroups.map((group) => (
        <div key={group.label}>
          {!collapsed && (
            <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted">{group.label}</p>
          )}
          <div className="space-y-0.5">
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
                    isActive ? 'bg-primary/12 text-primary' : 'text-text hover:bg-surface-2',
                  )
                }
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-4.5 w-4.5 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  )
}

export function Sidebar({ collapsed, onToggleCollapsed, mobileOpen, onCloseMobile }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden shrink-0 flex-col border-r border-border bg-surface transition-all duration-200 md:flex',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-3">
          <Logo collapsed={collapsed} />
        </div>
        <SidebarContent collapsed={collapsed} />
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="flex items-center justify-center gap-2 border-t border-border py-2.5 text-muted hover:bg-surface-2 hover:text-text"
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </button>
      </aside>

      {/* Mobile off-canvas sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onCloseMobile} />
          <aside className="relative flex h-full w-72 max-w-[80vw] flex-col bg-surface shadow-card">
            <div className="flex h-14 items-center justify-between border-b border-border px-3">
              <Logo />
              <button type="button" onClick={onCloseMobile} className="rounded-md p-1.5 text-muted hover:bg-surface-2">
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent collapsed={false} onNavigate={onCloseMobile} />
          </aside>
        </div>
      )}
    </>
  )
}
