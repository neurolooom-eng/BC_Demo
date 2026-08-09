/**
 * Process Check Sheet data: the Parameters master (spec limits), the shift/slot
 * structure, and a demo day sheet that mirrors the scanned QC FMT 038 Rev 10
 * form. In a live setup these come from the Google Sheet tabs in docs/MASTERS.md;
 * this bundled data lets the day print render standalone.
 */

import type { DaySheet, PcsMachineSetup, PcsParameter, PcsShift, PcsSlotEntry } from '../types/pcs'

/** Maximum machines captured on a single day sheet. */
export const MAX_MACHINES_PER_DAY = 10

/**
 * Test recipient for out-of-spec email alerts until the User Master is ready
 * (see BACKLOG.md). Once users exist, alert recipients come from the
 * AlertRecipients master keyed off the User Master.
 */
export const TEST_ALERT_RECIPIENTS = ['neurolooom@gmail.com']

// --- Parameters master (per-slot line readings + machine Die Temp) ----------

export const PCS_PARAMETERS: PcsParameter[] = [
  { code: 'HOLD_CHARGES', name: 'Holding furnace / No. of Charges', label: 'Holding furnace / No. of Charges', category: 'Furnace', cadence: 'Slot', appliesTo: 'Global', dataType: 'Text', sortOrder: 5 },
  { code: 'INGOT', name: 'Ingot 50% / Foundry returns 50%', label: 'Ingot 50%(Kgs) Foundry returns 50% Total = 300 Kgs/Charge', category: 'Charge', cadence: 'Slot', appliesTo: 'Global', dataType: 'Number', unit: 'Kgs', min: 145, max: 155, sortOrder: 10 },
  { code: 'DROSS', name: 'Dross Cleaning', label: 'Dross Cleaning in Holding furnace (20 mins once)', category: 'Furnace', cadence: 'Slot', appliesTo: 'Global', dataType: 'Number', unit: 'min', min: 18, max: 22, sortOrder: 20 },
  { code: 'MELT_TEMP', name: 'Melting Metal Temp', label: 'Melting Metal Temp. 720°C ~ 740°C', category: 'Melting', cadence: 'Slot', appliesTo: 'Global', dataType: 'Number', unit: '°C', min: 720, max: 740, sortOrder: 30 },
  { code: 'COVERALL', name: 'Coverall', label: 'Coverall 200 ~ 300 grams per charge', category: 'Charge', cadence: 'Slot', appliesTo: 'Global', dataType: 'Number', unit: 'g', min: 200, max: 300, sortOrder: 40 },
  { code: 'DEGAS', name: 'Degassing', label: 'Degasing 15 mins / charge', category: 'Degassing', cadence: 'Slot', appliesTo: 'Global', dataType: 'Number', unit: 'min', min: 10, max: 15, sortOrder: 50 },
  { code: 'PRESSURE', name: 'Pressure', label: 'Pressure 2 - 3 bar', category: 'Degassing', cadence: 'Slot', appliesTo: 'Global', dataType: 'Number', unit: 'bar', min: 2, max: 3, sortOrder: 60 },
  { code: 'FLOW', name: 'Flow rate', label: 'Flow rate 6 ~ 9 Lpm', category: 'Degassing', cadence: 'Slot', appliesTo: 'Global', dataType: 'Number', unit: 'LPM', min: 6, max: 9, sortOrder: 70 },
  { code: 'ROTOR', name: 'Rotor RPM', label: 'Rotor RPM - Min 550 (100mm) / Min 350 (190mm)', category: 'Degassing', cadence: 'Slot', appliesTo: 'Global', dataType: 'Number', unit: 'RPM', min: 550, sortOrder: 80 },
  { code: 'GAS_CHECK', name: 'Gas Checking', label: 'Gas Checking - K-Mould / vaccum sample', category: 'Quality', cadence: 'Slot', appliesTo: 'Global', dataType: 'Decimal', min: 0, max: 0.1, sortOrder: 90 },
  { code: 'ROOM_TEMP', name: 'Room Temp', label: 'Room Temp °C', category: 'Ambient', cadence: 'Slot', appliesTo: 'Global', dataType: 'Decimal', unit: '°C', sortOrder: 100 },
  { code: 'HUMIDITY', name: 'Humidity', label: 'Humidity %', category: 'Ambient', cadence: 'Slot', appliesTo: 'Global', dataType: 'Decimal', unit: '%', sortOrder: 110 },
  { code: 'POUR_TEMP', name: 'Metal Temp. When pouring', label: 'Metal Temp. When pouring 730°C ~ 750°C', category: 'Pouring', cadence: 'Slot', appliesTo: 'Global', dataType: 'Number', unit: '°C', min: 730, max: 750, sortOrder: 120 },
  { code: 'DIE_TEMP', name: 'Die Temp', label: 'Die Temp. 250°C - 350°C', category: 'Die', cadence: 'Slot', appliesTo: 'Machine', dataType: 'Number', unit: '°C', min: 250, max: 350, sortOrder: 130 },
]

/** Line-level per-slot rows, in print order. */
export const SLOT_LINE_PARAMS = PCS_PARAMETERS.filter((p) => p.cadence === 'Slot' && p.appliesTo === 'Global')
export const DIE_TEMP_PARAM = PCS_PARAMETERS.find((p) => p.code === 'DIE_TEMP')!

const PARAM_BY_CODE = new Map(PCS_PARAMETERS.map((p) => [p.code, p]))
export const paramByCode = (code: string) => PARAM_BY_CODE.get(code)

/** True when a numeric value breaches the parameter's spec limits. */
export function isOutOfSpec(code: string, value: string | number): boolean {
  const p = PARAM_BY_CODE.get(code)
  if (!p) return false
  const n = typeof value === 'number' ? value : parseFloat(String(value))
  if (Number.isNaN(n)) return false
  if (p.min != null && n < p.min) return true
  if (p.max != null && n > p.max) return true
  return false
}

// --- Shifts & slots ---------------------------------------------------------

function genSlots(start: string, count: number, stepMin = 30): string[] {
  const [h, m] = start.split(':').map(Number)
  let t = h * 60 + m
  const out: string[] = []
  for (let i = 0; i < count; i++) {
    const hh = Math.floor((t % 1440) / 60)
    const mm = t % 60
    out.push(`${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`)
    t += stepMin
  }
  return out
}

export const PCS_SHIFTS: PcsShift[] = [
  { code: 'I', name: '1st Shift', slots: genSlots('06:30', 16) },
  { code: 'II', name: '2nd Shift', slots: genSlots('14:30', 16) },
  { code: 'III', name: '3rd Shift', slots: genSlots('22:30', 16) },
]

/** Machine codes available to add to a day sheet (from the Machines master). */
export const MACHINE_CODES = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14']

/** All slots across the day in order, so machine "active from" can be compared. */
export const FLAT_SLOTS = PCS_SHIFTS.flatMap((s) => s.slots.map((slot) => ({ shift: s.code, slot })))

export function slotIndex(shift: string, slot: string): number {
  return FLAT_SLOTS.findIndex((f) => f.shift === shift && f.slot === slot)
}

/**
 * A machine is active at a slot within its window: from the slot it was added
 * up to (but not including) the slot it was stopped on. Slots before it started
 * or from its stop slot onward are N/A.
 */
export function machineActiveAt(
  m: { activeFromShift: string; activeFromSlot: string; stoppedFromShift?: string; stoppedFromSlot?: string },
  shift: string,
  slot: string,
): boolean {
  const i = slotIndex(shift, slot)
  if (i < slotIndex(m.activeFromShift, m.activeFromSlot)) return false
  if (m.stoppedFromShift && m.stoppedFromSlot && i >= slotIndex(m.stoppedFromShift, m.stoppedFromSlot)) return false
  return true
}

// --- Demo day sheet (mirrors the scanned form) ------------------------------

// Deterministic pseudo-random so the demo is stable across renders/builds.
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

const NOMINAL: Record<string, number> = {
  INGOT: 150, DROSS: 20, MELT_TEMP: 733, COVERALL: 250, DEGAS: 13, PRESSURE: 2,
  FLOW: 8, ROTOR: 590, GAS_CHECK: 0.05, ROOM_TEMP: 32, HUMIDITY: 82, POUR_TEMP: 742, DIE_TEMP: 310,
}
const JITTER: Record<string, number> = {
  INGOT: 3, DROSS: 1, MELT_TEMP: 5, COVERALL: 30, DEGAS: 2, PRESSURE: 0.4,
  FLOW: 1, ROTOR: 30, GAS_CHECK: 0.03, ROOM_TEMP: 2, HUMIDITY: 5, POUR_TEMP: 5, DIE_TEMP: 25,
}
const HOLD_TAGS = ['1W', '2W', '3W', '1B', '2B']

/**
 * Demo machines showing the full lifecycle:
 *  - M/C 06 runs all day from shift-open (06:30).
 *  - M/C 04 starts at 06:30 but is stopped at 13:00 (fault) — 13:00 onward N/A.
 *  - M/C 12 is added mid-morning at 10:00 — 06:30–09:30 print N/A for it.
 */
export const DEMO_MACHINES: PcsMachineSetup[] = [
  { machineCode: '06', bcNo: '674', dieCoatThickness: 130, diePreheatTemp: 249, coolingTime: 180, pouringTime: 9, tiltingTime: 14, degasKillingTime: 16, activeFromShift: 'I', activeFromSlot: '06:30' },
  { machineCode: '04', bcNo: '712', dieCoatThickness: 130, diePreheatTemp: 249, coolingTime: 180, pouringTime: 9, tiltingTime: 14, degasKillingTime: 16, activeFromShift: 'I', activeFromSlot: '06:30', stoppedFromShift: 'I', stoppedFromSlot: '13:00' },
  { machineCode: '12', bcNo: '674', dieCoatThickness: 132, diePreheatTemp: 247, coolingTime: 180, pouringTime: 9, tiltingTime: 15, degasKillingTime: 16, activeFromShift: 'I', activeFromSlot: '10:00' },
]

/** Build one hourly child record (PcsSlotEntry) per shift × slot. */
function buildDemoSlotEntries(): PcsSlotEntry[] {
  const rnd = seeded(42)
  const entries: PcsSlotEntry[] = []
  let n = 0
  for (const shift of PCS_SHIFTS) {
    for (const slot of shift.slots) {
      const line: Record<string, string | number> = {}
      for (const p of SLOT_LINE_PARAMS) {
        n++
        if (p.code === 'HOLD_CHARGES') {
          line[p.code] = HOLD_TAGS[n % HOLD_TAGS.length]
          continue
        }
        const base = NOMINAL[p.code] ?? 0
        const j = JITTER[p.code] ?? 1
        let v = base + (rnd() - 0.5) * 2 * j
        // A few deterministic out-of-spec values to show highlighting.
        if (n % 37 === 0 && p.code === 'MELT_TEMP') v = 745
        if (n % 41 === 0 && p.code === 'ROTOR') v = 538
        if (n % 53 === 0 && p.code === 'POUR_TEMP') v = 752
        line[p.code] = p.dataType === 'Decimal' ? Math.round(v * 100) / 100 : Math.round(v)
      }
      const machines: Record<string, Record<string, string | number>> = {}
      for (const mc of DEMO_MACHINES) {
        // Only machines active at this slot get a reading; earlier slots stay N/A.
        if (!machineActiveAt(mc, shift.code, slot)) continue
        const v = NOMINAL.DIE_TEMP + (rnd() - 0.5) * 2 * JITTER.DIE_TEMP
        machines[mc.machineCode] = { DIE_TEMP: Math.round(v) }
      }
      entries.push({ id: `${shift.code}-${slot}`, shiftCode: shift.code, slot, line, machines })
    }
  }
  return entries
}

/** Index slot-entry child records by shift+slot for the print to assemble. */
export function slotEntryMap(entries: PcsSlotEntry[]): Map<string, PcsSlotEntry> {
  return new Map(entries.map((e) => [`${e.shiftCode}|${e.slot}`, e]))
}

/** Read a value from the assembled slot entries (line-level or per-machine). */
export function readingValue(
  entries: Map<string, PcsSlotEntry>,
  shift: string,
  slot: string,
  code: string,
  machineCode?: string,
): string | number | undefined {
  const e = entries.get(`${shift}|${slot}`)
  if (!e) return undefined
  return machineCode ? e.machines[machineCode]?.[code] : e.line[code]
}

export const DEMO_DAY_SHEET: DaySheet = {
  id: 'DS-2026-03-10-L01',
  date: '2026-03-10',
  line: 'Mando Model Line',
  metalGrade: 'AC2A',
  degassingGas: 'N2',
  furnaceNos: 'HF1 + HF2',
  bestCastAlloy: true,
  otherAlloy: false,
  inChargeSign: 'Viknesh',
  machines: DEMO_MACHINES,
  slotEntries: buildDemoSlotEntries(),
  corePins: [
    { shiftCode: 'I', cavities: Array(10).fill(true), comment: 'Core pin verified' },
    { shiftCode: 'II', cavities: [true, true, true, true, true, true, false, true, true, true], comment: 'Core pin verified' },
    { shiftCode: 'III', cavities: Array(10).fill(true), comment: 'Verified' },
  ],
  signoffs: [
    { shiftCode: 'I', operator: 'Ravi Kumar', supervisor: 'Vimal' },
    { shiftCode: 'II', operator: 'Naveen', supervisor: 'Bharath' },
    { shiftCode: 'III', operator: 'Ashok', supervisor: 'Balaji' },
  ],
  startup: {
    diePreheatSOP: '247°C',
    dieRunnerRaiserCoating: 'Visually OK',
    dieSprayCoating: 'Lubrikote 140 — OK',
    dpt: 'OK',
    rejectedAtStart: '3 sets rejected',
    errorProofsOk: true,
    errorProofsComment: '2 Bar pressure alarm, Die Temp interlink, Melting Temp cut-off, Auto top door, Degassing timer & alarm, Robot furnace change — all working',
  },
}
