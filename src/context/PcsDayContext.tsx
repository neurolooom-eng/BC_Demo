import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { DEMO_DAY_SHEET } from '../data/pcs'
import type { DaySheet, PcsMachineSetup, PcsSlotEntry } from '../types/pcs'

/**
 * Holds the working day sheet for the demo. Hourly readings are child records
 * (PcsSlotEntry) added from the standalone Hourly Reading form and assembled
 * into the day print. Machines can be added mid-day with an "active from" slot,
 * so earlier slots print N/A for them. Both persist per browser.
 */

const KEY = 'bestcast.pcs.slotEntries.v1'
const MC_KEY = 'bestcast.pcs.machines.v1'

interface PcsDayValue {
  sheet: DaySheet
  addSlotEntry: (entry: PcsSlotEntry) => void
  removeSlotEntry: (id: string) => void
  addMachine: (machine: PcsMachineSetup) => void
  resetToDemo: () => void
}

const PcsDayContext = createContext<PcsDayValue | null>(null)

function readStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const stored = window.localStorage.getItem(key)
    if (stored) return JSON.parse(stored) as T
  } catch {
    /* fall through */
  }
  return fallback
}

export function PcsDayProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<PcsSlotEntry[]>(() => readStored(KEY, DEMO_DAY_SHEET.slotEntries))
  const [machines, setMachines] = useState<PcsMachineSetup[]>(() => readStored(MC_KEY, DEMO_DAY_SHEET.machines))

  const addSlotEntry = useCallback((entry: PcsSlotEntry) => {
    setEntries((prev) => {
      const next = [...prev.filter((e) => !(e.shiftCode === entry.shiftCode && e.slot === entry.slot)), entry].sort(
        (a, b) => a.shiftCode.localeCompare(b.shiftCode) || a.slot.localeCompare(b.slot),
      )
      window.localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const removeSlotEntry = useCallback((id: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id)
      window.localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const addMachine = useCallback((machine: PcsMachineSetup) => {
    setMachines((prev) => {
      if (prev.some((m) => m.machineCode === machine.machineCode)) return prev
      const next = [...prev, machine]
      window.localStorage.setItem(MC_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const resetToDemo = useCallback(() => {
    setEntries(DEMO_DAY_SHEET.slotEntries)
    setMachines(DEMO_DAY_SHEET.machines)
    window.localStorage.setItem(KEY, JSON.stringify(DEMO_DAY_SHEET.slotEntries))
    window.localStorage.setItem(MC_KEY, JSON.stringify(DEMO_DAY_SHEET.machines))
  }, [])

  const value = useMemo<PcsDayValue>(
    () => ({
      sheet: { ...DEMO_DAY_SHEET, machines, slotEntries: entries },
      addSlotEntry,
      removeSlotEntry,
      addMachine,
      resetToDemo,
    }),
    [entries, machines, addSlotEntry, removeSlotEntry, addMachine, resetToDemo],
  )

  return <PcsDayContext.Provider value={value}>{children}</PcsDayContext.Provider>
}

export function usePcsDay() {
  const ctx = useContext(PcsDayContext)
  if (!ctx) throw new Error('usePcsDay must be used within PcsDayProvider')
  return ctx
}
