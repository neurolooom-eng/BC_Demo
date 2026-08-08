import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

/**
 * Which navigation groups are hidden from the sidebar. Developer-configurable
 * from the Developer Config page (/config). Persisted per browser; routes
 * still exist, so hiding a group only removes it from the sidebar (a
 * developer can always reach a page by URL, e.g. #/config).
 */

const STORAGE_KEY = 'bestcast.hiddenNavGroups.v1'

/** Hidden out of the box until a developer changes it. */
export const DEFAULT_HIDDEN_NAV_GROUPS = ['Supply Chain', 'Finance']

interface NavPrefsValue {
  hiddenGroups: string[]
  isHidden: (label: string) => boolean
  toggleGroup: (label: string) => void
  setHiddenGroups: (labels: string[]) => void
}

const NavPrefsContext = createContext<NavPrefsValue | null>(null)

function readInitial(): string[] {
  if (typeof window === 'undefined') return DEFAULT_HIDDEN_NAV_GROUPS
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored) as string[]
  } catch {
    /* fall through */
  }
  return DEFAULT_HIDDEN_NAV_GROUPS
}

export function NavPrefsProvider({ children }: { children: ReactNode }) {
  const [hiddenGroups, setHidden] = useState<string[]>(readInitial)

  const persist = useCallback((labels: string[]) => {
    setHidden(labels)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(labels))
  }, [])

  const toggleGroup = useCallback((label: string) => {
    setHidden((prev) => {
      const next = prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const value = useMemo<NavPrefsValue>(
    () => ({
      hiddenGroups,
      isHidden: (label) => hiddenGroups.includes(label),
      toggleGroup,
      setHiddenGroups: persist,
    }),
    [hiddenGroups, toggleGroup, persist],
  )

  return <NavPrefsContext.Provider value={value}>{children}</NavPrefsContext.Provider>
}

export function useNavPrefs() {
  const ctx = useContext(NavPrefsContext)
  if (!ctx) throw new Error('useNavPrefs must be used within NavPrefsProvider')
  return ctx
}
