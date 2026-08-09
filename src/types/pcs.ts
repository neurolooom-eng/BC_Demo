/**
 * Process Check Sheet (QC FMT 038 Rev 10) domain types.
 *
 * Mirrors the Google Sheet structure documented in docs/MASTERS.md. A day
 * sheet covers one Line for one Date across all three shifts; readings are
 * captured per 30-minute slot, with some readings taken per machine (Die
 * Temp) and the rest line-level.
 */

export type Cadence = 'Day' | 'Slot' | 'MachineSetup' | 'Shift' | 'Startup'
export type PcsDataType = 'Number' | 'Decimal' | 'Text' | 'Enum' | 'YesNo'

/** A row of the Parameters master - the spec limits drive out-of-spec highlighting. */
export interface PcsParameter {
  code: string
  name: string
  /** Short label with the inline spec, as printed on the form. */
  label: string
  category: string
  cadence: Cadence
  appliesTo: 'Global' | 'Machine'
  dataType: PcsDataType
  unit?: string
  min?: number
  max?: number
  sortOrder: number
}

export interface PcsShift {
  code: string
  name: string
  /** 30-minute slot column headers, e.g. ['06:30','07:00',...]. */
  slots: string[]
}

export interface PcsMachineSetup {
  machineCode: string
  bcNo: string
  dieCoatThickness?: number
  diePreheatTemp?: number
  coolingTime?: number
  pouringTime?: number
  tiltingTime?: number
  degasKillingTime?: number
  /** Shift the machine was added/started on. */
  activeFromShift: string
  /** Time slot the machine started; earlier slots print N/A for this machine. */
  activeFromSlot: string
  /** Shift the machine was stopped on (fault/shutdown), if any. */
  stoppedFromShift?: string
  /** First slot the machine is no longer active; this slot onward prints N/A. */
  stoppedFromSlot?: string
}

/** One captured value: parameter × slot (× machine for machine-level rows). */
export interface PcsReading {
  parameterCode: string
  shiftCode: string
  slot: string
  machineCode?: string
  value: string | number
}

/**
 * Hourly reading child record — the unit captured by the standalone Hourly
 * Reading form: one time slot's readings, both line-level and per-machine.
 * The day print assembles these child records into the grid, aligned by slot.
 */
export interface PcsSlotEntry {
  id: string
  shiftCode: string
  /** HH:MM column this entry aligns to on the print. */
  slot: string
  /** Line-level readings: parameterCode -> value. */
  line: Record<string, string | number>
  /** Per-machine readings: machineCode -> (parameterCode -> value). */
  machines: Record<string, Record<string, string | number>>
}

export interface PcsCorePin {
  shiftCode: string
  /** cavity 1..10 pass/fail. */
  cavities: boolean[]
  comment?: string
}

export interface PcsShiftSignoff {
  shiftCode: string
  operator: string
  supervisor: string
}

export interface PcsStartup {
  diePreheatSOP: string
  dieRunnerRaiserCoating: 'OK' | 'NotOK' | string
  dieSprayCoating: string
  dpt: 'OK' | 'NotOK' | string
  rejectedAtStart: string
  errorProofsOk: boolean
  errorProofsComment?: string
}

export interface DaySheet {
  id: string
  date: string
  line: string
  metalGrade: string
  degassingGas: string
  furnaceNos: string
  bestCastAlloy: boolean
  otherAlloy: boolean
  inChargeSign: string
  machines: PcsMachineSetup[]
  /** Hourly reading child records, assembled into the print grid by slot. */
  slotEntries: PcsSlotEntry[]
  corePins: PcsCorePin[]
  signoffs: PcsShiftSignoff[]
  startup: PcsStartup
}
