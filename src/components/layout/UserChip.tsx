import { Check, ChevronDown } from 'lucide-react'
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

/**
 * There's no real auth backend (see README) - this is a "switch user" menu
 * standing in for login, so every group's view/action gating can be
 * demoed live. Persists the chosen user to localStorage.
 */
export function UserChip() {
  const { users, groups, currentUser, currentGroup, setCurrentUserId } = useAccess()
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
            <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted">Switch user (demo)</p>
            {groups.map((group) => {
              const groupUsers = users.filter((u) => u.groupId === group.id)
              if (groupUsers.length === 0) return null
              return (
                <div key={group.id} className="mb-1">
                  <p className="px-2 py-1 text-[10px] uppercase text-muted">{group.name}</p>
                  {groupUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        setCurrentUserId(user.id)
                        setOpen(false)
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-surface-2"
                    >
                      <span className="flex-1 truncate text-text">{user.name}</span>
                      {currentUser.id === user.id && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
                    </button>
                  ))}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
