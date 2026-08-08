import { nextId } from '../../lib/id'
import type { CheckSheetRecord, MachineReading, ShiftReading } from '../../types/domain'

export function emptyReading(): ShiftReading {
  return {
    id: nextId('reading'),
    time: '',
    ingotKg: 150,
    dross: '20min',
    meltingTempC: 740,
    coverallGrams: 200,
    degassingMin: 15,
    pressureBar: 2,
    flowRateLpm: 9,
    rotorRpm: 600,
    gasChecking: '',
    roomTempC: 30,
    humidityPct: 60,
    holdingFurnaceTempC: 745,
  }
}

export function emptyMachineReading(): MachineReading {
  return {
    id: nextId('machine'),
    mcNo: '',
    bcNo: '',
    dieCoatThicknessMicrons: 125,
    diePreheatTempC: 280,
    coolingTimeSec: 150,
    pouringTimeSec: 7,
    tiltingTimeSec: 15,
    degasKillingMin: 12,
    dieTempC: 300,
  }
}

export function emptyCheckSheet(): CheckSheetRecord {
  return {
    id: nextId('checksheet'),
    line: 'MANDO-01',
    date: new Date().toISOString().slice(0, 10),
    shift: '1st',
    furnaceNo: 'HF1',
    metalGrade: 'AC2A',
    degassingGas: 'N2',
    bestCastAlloy: 'YES',
    otherAlloy: 'NO',
    status: 'draft',
    readings: [emptyReading()],
    machineReadings: [emptyMachineReading()],
    corePinChecks: Array.from({ length: 10 }, (_, i) => ({ cavityNo: i + 1, status: 'OK' as const })),
    corePinComment: '',
    diePrep: {
      diePreHeatingPerSop: 'OK',
      dieRunnerRaiserCleaning: 'OK',
      dpt: 'OK',
      coreVerification: 'OK',
      dieSprayCoatingApply: 'OK',
      rejectedSetsComment: '',
    },
    signatures: {
      operatorSign: '',
      shiftSupervisorSign: '',
      inChargeSign: '',
    },
  }
}
