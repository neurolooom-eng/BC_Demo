import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { DEMO_DAY_SHEET } from '../data/pcs'
import type { DaySheet, PcsMachineSetup, PcsShiftSignoff, PcsSlotEntry } from '../types/pcs'

/**
 * The working Process Check Sheet for the day and its lifecycle:
 *   Draft  → operator fills MC + shift details, logs hourly readings
 *   Signed off → in-charge signs off once all shifts are done; only then can it print.
 * Everything persists per browser so the sheet survives reloads across shifts.
 */

const SHEET_KEY = 'bestcast.pcs.sheet.v1'
const SIGN_KEY = 'bestcast.pcs.signedoff.v1'

type HeaderPatch = Partial<
  Pick<DaySheet, 'line' | 'date' | 'metalGrade' | 'degassingGas' | 'furnaceNos' | 'bestCastAlloy' | 'otherAlloy' | 'inChargeSign'>
>

interface PcsDayValue {
  sheet: DaySheet
  signedOff: boolean
  updateHeader: (patch: HeaderPatch) => void
  addMachine: (machine: PcsMachineSetup) => void
  updateMachine: (machineCode: string, patch: Partial<PcsMachineSetup>) => void
  stopMachine: (machineCode: string, shift: string, slot: string) => void
  reactivateMachine: (machineCode: string) => void
  addSlotEntry: (entry: PcsSlotEntry) => void
  removeSlotEntry: (id: string) => void
  updateSignoff: (shiftCode: string, patch: Partial<PcsShiftSignoff>) => void
  updateStartup: (patch: Partial<DaySheet['startup']>) => void
  /** In-charge sign-off; locks the sheet and enables printing. */
  signOff: () => void
  /** Reopen a signed-off sheet for corrections. */
  reopen: () => void
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
  const [sheet, setSheet] = useState<DaySheet>(() => readStored(SHEET_KEY, DEMO_DAY_SHEET))
  const [signedOff, setSignedOff] = useState<boolean>(() => readStored(SIGN_KEY, false))

  const patch = useCallback((mutate: (s: DaySheet) => DaySheet) => {
    setSheet((prev) => {
      const next = mutate(prev)
      window.localStorage.setItem(SHEET_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const setSigned = useCallback((v: boolean) => {
    setSignedOff(v)
    window.localStorage.setItem(SIGN_KEY, JSON.stringify(v))
  }, [])

  const updateHeader = useCallback((p: HeaderPatch) => patch((s) => ({ ...s, ...p })), [patch])

  const addMachine = useCallback(
    (machine: PcsMachineSetup) =>
      patch((s) => (s.machines.some((m) => m.machineCode === machine.machineCode) ? s : { ...s, machines: [...s.machines, machine] })),
    [patch],
  )

  const updateMachine = useCallback(
    (code: string, p: Partial<PcsMachineSetup>) =>
      patch((s) => ({ ...s, machines: s.machines.map((m) => (m.machineCode === code ? { ...m, ...p } : m)) })),
    [patch],
  )

  const stopMachine = useCallback(
    (code: string, shift: string, slot: string) =>
      patch((s) => ({
        ...s,
        machines: s.machines.map((m) => (m.machineCode === code ? { ...m, stoppedFromShift: shift, stoppedFromSlot: slot } : m)),
      })),
    [patch],
  )

  const reactivateMachine = useCallback(
    (code: string) =>
      patch((s) => ({
        ...s,
        machines: s.machines.map((m) => (m.machineCode === code ? { ...m, stoppedFromShift: undefined, stoppedFromSlot: undefined } : m)),
      })),
    [patch],
  )

  const addSlotEntry = useCallback(
    (entry: PcsSlotEntry) =>
      patch((s) => ({
        ...s,
        slotEntries: [...s.slotEntries.filter((e) => !(e.shiftCode === entry.shiftCode && e.slot === entry.slot)), entry].sort(
          (a, b) => a.shiftCode.localeCompare(b.shiftCode) || a.slot.localeCompare(b.slot),
        ),
      })),
    [patch],
  )

  const removeSlotEntry = useCallback((id: string) => patch((s) => ({ ...s, slotEntries: s.slotEntries.filter((e) => e.id !== id) })), [patch])

  const updateSignoff = useCallback(
    (shiftCode: string, p: Partial<PcsShiftSignoff>) =>
      patch((s) => ({ ...s, signoffs: s.signoffs.map((so) => (so.shiftCode === shiftCode ? { ...so, ...p } : so)) })),
    [patch],
  )

  const updateStartup = useCallback((p: Partial<DaySheet['startup']>) => patch((s) => ({ ...s, startup: { ...s.startup, ...p } })), [patch])

  const signOff = useCallback(() => setSigned(true), [setSigned])
  const reopen = useCallback(() => setSigned(false), [setSigned])

  const resetToDemo = useCallback(() => {
    patch(() => DEMO_DAY_SHEET)
    setSigned(false)
  }, [patch, setSigned])

  const value = useMemo<PcsDayValue>(
    () => ({
      sheet,
      signedOff,
      updateHeader,
      addMachine,
      updateMachine,
      stopMachine,
      reactivateMachine,
      addSlotEntry,
      removeSlotEntry,
      updateSignoff,
      updateStartup,
      signOff,
      reopen,
      resetToDemo,
    }),
    [sheet, signedOff, updateHeader, addMachine, updateMachine, stopMachine, reactivateMachine, addSlotEntry, removeSlotEntry, updateSignoff, updateStartup, signOff, reopen, resetToDemo],
  )

  return <PcsDayContext.Provider value={value}>{children}</PcsDayContext.Provider>
}

export function usePcsDay() {
  const ctx = useContext(PcsDayContext)
  if (!ctx) throw new Error('usePcsDay must be used within PcsDayProvider')
  return ctx
}
