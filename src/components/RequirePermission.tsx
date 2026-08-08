import { ShieldAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { useAccess } from '../context/AccessContext'
import type { Permission } from '../types/access'

export function RequirePermission({ permission, children }: { permission: Permission; children: ReactNode }) {
  const { hasPermission } = useAccess()

  if (!hasPermission(permission)) {
    return (
      <div className="card flex flex-col items-center gap-2 p-10 text-center">
        <ShieldAlert className="h-8 w-8 text-warning" />
        <h1 className="text-lg font-semibold text-text">Access restricted</h1>
        <p className="max-w-sm text-sm text-muted">
          Your current group doesn't have the <code className="text-xs">{permission}</code> permission. Switch to a
          user with access from the topbar, or ask an Administrator to grant it.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
