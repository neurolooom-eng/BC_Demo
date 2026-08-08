import { nextId } from '../lib/id'
import type {
  CheckSheetRecord,
  CheckSheetStatus,
  MachineReading,
  ProductionLine,
  Shift,
  ShiftReading,
} from '../types/domain'

/**
 * Sample production-line records digitised from the uploaded
 * "Master_Cpy_Process_Check_sheet.xlsx" (QC FMT 038, Rev.10 - Mando Model
 * Line process check sheet). Each record represents one shift's sheet.
 */

function reading(partial: Partial<ShiftReading> & Pick<ShiftReading, 'time'>): ShiftReading {
  return {
    id: nextId('reading'),
    ingotKg: 150,
    dross: '20min',
    meltingTempC: 740,
    coverallGrams: 200,
    degassingMin: 15,
    pressureBar: 2,
    flowRateLpm: 9,
    rotorRpm: 603,
    gasChecking: '0.00 / 2.74',
    roomTempC: 34,
    humidityPct: 62,
    holdingFurnaceTempC: 745,
    ...partial,
  }
}

function machine(partial: Partial<MachineReading> & Pick<MachineReading, 'mcNo' | 'bcNo'>): MachineReading {
  return {
    id: nextId('machine'),
    dieCoatThicknessMicrons: 141,
    diePreheatTempC: 248,
    coolingTimeSec: 180,
    pouringTimeSec: 9,
    tiltingTimeSec: 16,
    degasKillingMin: 10,
    dieTempC: 300,
    ...partial,
  }
}

function corePins(status: 'OK' | 'NOT OK' = 'OK') {
  return Array.from({ length: 10 }, (_, i) => ({ cavityNo: i + 1, status }))
}

interface Seed {
  line: ProductionLine
  date: string
  shift: Shift
  furnaceNo: string
  status: CheckSheetStatus
  operatorSign: string
  shiftSupervisorSign: string
  bcNo: string
  mcNo: string
}

const SEEDS: Seed[] = [
  { line: 'MANDO-01', date: '2026-07-05', shift: '1st', furnaceNo: 'HF1', status: 'approved', operatorSign: 'Ravi Kumar', shiftSupervisorSign: 'Vimal', bcNo: '716/697', mcNo: '5' },
  { line: 'MANDO-01', date: '2026-07-05', shift: '2nd', furnaceNo: 'HF1', status: 'submitted', operatorSign: 'Suresh M', shiftSupervisorSign: 'Bharathi', bcNo: '702/689', mcNo: '5' },
  { line: 'MANDO-01', date: '2026-07-05', shift: '3rd', furnaceNo: 'HF2', status: 'submitted', operatorSign: 'Ganesan P', shiftSupervisorSign: 'Mohan', bcNo: '710/695', mcNo: '5' },
  { line: 'MANDO-02', date: '2026-07-04', shift: '1st', furnaceNo: 'HF3', status: 'approved', operatorSign: 'Karthik S', shiftSupervisorSign: 'Naveen', bcNo: '655/640', mcNo: '9' },
  { line: 'MANDO-02', date: '2026-07-04', shift: '2nd', furnaceNo: 'HF3', status: 'approved', operatorSign: 'Manoj R', shiftSupervisorSign: 'Ashok', bcNo: '661/648', mcNo: '9' },
  { line: 'MANDO-03', date: '2026-07-04', shift: '1st', furnaceNo: 'HF5', status: 'draft', operatorSign: 'Vignesh T', shiftSupervisorSign: 'Vimal', bcNo: '588/571', mcNo: '12' },
  { line: 'MANDO-06', date: '2026-07-03', shift: '3rd', furnaceNo: 'HF11', status: 'submitted', operatorSign: 'Arun D', shiftSupervisorSign: 'Bharathi', bcNo: '744/730', mcNo: '2' },
  { line: 'MANDO-01', date: '2026-07-02', shift: '1st', furnaceNo: 'HF1', status: 'approved', operatorSign: 'Ravi Kumar', shiftSupervisorSign: 'Mohan', bcNo: '699/682', mcNo: '5' },
]

const SHIFT_START_TIMES: Record<Shift, string[]> = {
  '1st': ['06:30', '07:00', '07:30'],
  '2nd': ['14:30', '15:00', '15:30'],
  '3rd': ['22:30', '23:00', '23:30'],
}

export const CHECK_SHEETS: CheckSheetRecord[] = SEEDS.map((seed) => ({
  id: nextId('checksheet'),
  line: seed.line,
  date: seed.date,
  shift: seed.shift,
  furnaceNo: seed.furnaceNo,
  metalGrade: 'AC2A',
  degassingGas: 'N2',
  bestCastAlloy: 'YES',
  otherAlloy: 'NO',
  status: seed.status,
  readings: SHIFT_START_TIMES[seed.shift].map((time, i) =>
    reading({ time, meltingTempC: 738 + i, roomTempC: 33 + i, humidityPct: 60 + i }),
  ),
  machineReadings: [machine({ mcNo: seed.mcNo, bcNo: seed.bcNo })],
  corePinChecks: corePins(seed.status === 'draft' ? 'OK' : 'OK'),
  corePinComment: 'Verified - no blockage observed.',
  diePrep: {
    diePreHeatingPerSop: 'OK',
    dieRunnerRaiserCleaning: 'OK',
    dpt: 'OK',
    coreVerification: 'OK',
    dieSprayCoatingApply: 'OK',
    rejectedSetsComment: '3 ~ 5 sets rejected while starting the die.',
  },
  signatures: {
    operatorSign: seed.operatorSign,
    shiftSupervisorSign: seed.shiftSupervisorSign,
    inChargeSign: 'Vikensh',
  },
}))
