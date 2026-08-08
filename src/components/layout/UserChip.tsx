import { ChevronDown, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useAccess } from '../../context/AccessContext'

function initialsOf(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

/** Account menu for the signed-in user: identity + sign out. */
export function UserChip() {
  const { currentUser, currentGroup, signOut } = useAccess()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex items-center gap-2">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
          {initialsOf(currentUser.name)}
        </div>
        <div className="hidden leading-tight sm:block">
          <p className="truncate text-sm font-medium text-text">{currentUser.name}</p>
          <p className="truncate text-[11px] text-muted">{currentGroup.name}</p>
        </div>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-64 rounded-lg border border-border bg-surface p-2 shadow-card">
            <div className="border-b border-border px-2 pb-2">
              <p className="truncate text-sm font-medium text-text">{currentUser.name}</p>
              <p className="truncate text-[11px] text-muted">{currentUser.email}</p>
              <p className="mt-1 text-[11px] text-muted">
                Role: <span className="text-text">{currentGroup.name}</span>
              </p>
              <p className="truncate text-[11px] text-muted">
                User ID: <span className="text-text">{currentUser.userId}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                signOut()
              }}
              className="mt-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-text hover:bg-surface-2"
            >
              <LogOut className="h-4 w-4 shrink-0 text-muted" />
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  )
}
