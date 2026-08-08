import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { GROUPS } from '../data/groups'
import { loadUsers, saveUser as saveUserToSheet, updateUser as updateUserOnSheet } from '../data/repository'
import { USERS } from '../data/users'
import { isConfigured } from '../lib/sheetsClient'
import type { Group, Permission, User } from '../types/access'

/** Internal id of the signed-in user; survives reloads so sessions persist. */
const SESSION_KEY = 'bestcast.session'
/**
 * Demo-mode persistence of the user list (admin edits survive reloads).
 * Versioned: bump when the seeded user list changes so existing browsers
 * adopt the new seed instead of a stale persisted copy.
 */
const USERS_KEY = 'bestcast.users.v3'

interface AccessContextValue {
  users: User[]
  setUsers: React.Dispatch<React.SetStateAction<User[]>>
  groups: Group[]
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>
  /** The signed-in user (falls back to the first user only when signed out). */
  currentUser: User
  currentGroup: Group
  isAuthenticated: boolean
  signIn: (userInternalId: string) => void
  signOut: () => void
  /** Add a user (Admin "New User") - persists to the sheet when configured. */
  addUser: (user: User) => void
  /** Update a user (Admin edit, status changes) - persists when configured. */
  saveUser: (user: User) => void
  hasPermission: (permission: Permission) => boolean
}

const AccessContext = createContext<AccessContextValue | null>(null)

function readInitialUsers(): User[] {
  if (typeof window === 'undefined' || isConfigured()) return USERS
  try {
    const stored = window.localStorage.getItem(USERS_KEY)
    if (stored) return JSON.parse(stored) as User[]
  } catch {
    /* fall through to seed */
  }
  return USERS
}

function readInitialSession(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(SESSION_KEY)
}

export function AccessProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(readInitialUsers)
  const [groups, setGroups] = useState<Group[]>(GROUPS)
  const [authedId, setAuthedId] = useState<string | null>(readInitialSession)

  // When a Sheets backend is configured, the Users tab is the source of truth.
  useEffect(() => {
    if (!isConfigured()) return
    let cancelled = false
    loadUsers()
      .then((rows) => {
        if (!cancelled && rows.length) setUsers(rows)
      })
      .catch((err) => console.warn('Falling back to seed users:', err))
    return () => {
      cancelled = true
    }
  }, [])

  // Demo mode: persist the user list so admin changes outlive a reload.
  useEffect(() => {
    if (isConfigured()) return
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users))
  }, [users])

  const currentUser = users.find((u) => u.id === authedId) ?? users[0]
  const currentGroup = groups.find((g) => g.id === currentUser.groupId) ?? groups[groups.length - 1]
  const isAuthenticated = authedId != null && users.some((u) => u.id === authedId && u.status !== 'disabled')

  const signIn = useCallback((userInternalId: string) => {
    setAuthedId(userInternalId)
    window.localStorage.setItem(SESSION_KEY, userInternalId)
  }, [])

  const signOut = useCallback(() => {
    setAuthedId(null)
    window.localStorage.removeItem(SESSION_KEY)
  }, [])

  const addUser = useCallback((user: User) => {
    setUsers((prev) => [user, ...prev])
    if (isConfigured()) saveUserToSheet(user).catch((err) => console.warn('Failed to save user to sheet:', err))
  }, [])

  const saveUser = useCallback((user: User) => {
    setUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)))
    if (isConfigured()) updateUserOnSheet(user).catch((err) => console.warn('Failed to update user on sheet:', err))
  }, [])

  const value = useMemo<AccessContextValue>(
    () => ({
      users,
      setUsers,
      groups,
      setGroups,
      currentUser,
      currentGroup,
      isAuthenticated,
      signIn,
      signOut,
      addUser,
      saveUser,
      hasPermission: (permission) => {
        const fromGroup = currentGroup.permissions.includes(permission)
        const granted = currentUser.grants?.includes(permission) ?? false
        const revoked = currentUser.revokes?.includes(permission) ?? false
        return (fromGroup || granted) && !revoked
      },
    }),
    [users, groups, currentUser, currentGroup, isAuthenticated, signIn, signOut, addUser, saveUser],
  )

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>
}

export function useAccess() {
  const ctx = useContext(AccessContext)
  if (!ctx) throw new Error('useAccess must be used within AccessProvider')
  return ctx
}
