import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { GROUPS } from '../data/groups'
import { USERS } from '../data/users'
import type { Group, Permission, User } from '../types/access'

const STORAGE_KEY = 'bestcast.currentUserId'

interface AccessContextValue {
  users: User[]
  setUsers: React.Dispatch<React.SetStateAction<User[]>>
  groups: Group[]
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>
  currentUser: User
  setCurrentUserId: (id: string) => void
  currentGroup: Group
  hasPermission: (permission: Permission) => boolean
}

const AccessContext = createContext<AccessContextValue | null>(null)

function readInitialUserId(): string {
  if (typeof window === 'undefined') return USERS[0].id
  return window.localStorage.getItem(STORAGE_KEY) ?? USERS[0].id
}

export function AccessProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(USERS)
  const [groups, setGroups] = useState<Group[]>(GROUPS)
  const [currentUserId, setCurrentUserIdState] = useState(readInitialUserId)

  const currentUser = users.find((u) => u.id === currentUserId) ?? users[0]
  const currentGroup = groups.find((g) => g.id === currentUser.groupId) ?? groups[groups.length - 1]

  function setCurrentUserId(id: string) {
    setCurrentUserIdState(id)
    window.localStorage.setItem(STORAGE_KEY, id)
  }

  const value = useMemo<AccessContextValue>(
    () => ({
      users,
      setUsers,
      groups,
      setGroups,
      currentUser,
      setCurrentUserId,
      currentGroup,
      hasPermission: (permission) => currentGroup.permissions.includes(permission),
    }),
    [users, groups, currentUser, currentGroup],
  )

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>
}

export function useAccess() {
  const ctx = useContext(AccessContext)
  if (!ctx) throw new Error('useAccess must be used within AccessProvider')
  return ctx
}
