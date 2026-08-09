import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { DEMO_DAY_SHEET } from '../data/pcs'
import type { DaySheet, PcsSlotEntry } from '../types/pcs'

/**
 * Holds the working day sheet for the demo. Hourly readings are child records
 * (PcsSlotEntry) added from the standalone Hourly Reading form and assembled
 * into the day print. Slot entries persist per browser; adding one for an
 * existing shift+slot replaces it (re-entry corrects a slot).
 */

const KEY = 'bestcast.pcs.slotEntries.v1'

interface PcsDayValue {
  sheet: DaySheet
  addSlotEntry: (entry: PcsSlotEntry) => void
  removeSlotEntry: (id: string) => void
  resetToDemo: () => void
}

const PcsDayContext = createContext<PcsDayValue | null>(null)

function readInitialEntries(): PcsSlotEntry[] {
  if (typeof window === 'undefined') return DEMO_DAY_SHEET.slotEntries
  try {
    const stored = window.localStorage.getItem(KEY)
    if (stored) return JSON.parse(stored) as PcsSlotEntry[]
  } catch {
    /* fall through */
  }
  return DEMO_DAY_SHEET.slotEntries
}

export function PcsDayProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<PcsSlotEntry[]>(readInitialEntries)

  const persist = useCallback((next: PcsSlotEntry[]) => {
    setEntries(next)
    window.localStorage.setItem(KEY, JSON.stringify(next))
  }, [])

  const addSlotEntry = useCallback(
    (entry: PcsSlotEntry) => {
      setEntries((prev) => {
        const next = [...prev.filter((e) => !(e.shiftCode === entry.shiftCode && e.slot === entry.slot)), entry].sort(
          (a, b) => a.shiftCode.localeCompare(b.shiftCode) || a.slot.localeCompare(b.slot),
        )
        window.localStorage.setItem(KEY, JSON.stringify(next))
        return next
      })
    },
    [],
  )

  const removeSlotEntry = useCallback((id: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id)
      window.localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const resetToDemo = useCallback(() => persist(DEMO_DAY_SHEET.slotEntries), [persist])

  const value = useMemo<PcsDayValue>(
    () => ({ sheet: { ...DEMO_DAY_SHEET, slotEntries: entries }, addSlotEntry, removeSlotEntry, resetToDemo }),
    [entries, addSlotEntry, removeSlotEntry, resetToDemo],
  )

  return <PcsDayContext.Provider value={value}>{children}</PcsDayContext.Provider>
}

export function usePcsDay() {
  const ctx = useContext(PcsDayContext)
  if (!ctx) throw new Error('usePcsDay must be used within PcsDayProvider')
  return ctx
}
