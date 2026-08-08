export type Shift = '1st' | '2nd' | '3rd'

export type ProductionLine = 'MANDO-01' | 'MANDO-02' | 'MANDO-03' | 'MANDO-06'

export type OkNotOk = 'OK' | 'NOT OK'

export type YesNo = 'YES' | 'NO'

/**
 * draft - editable by whoever created it (checksheets:create).
 * submitted - "sent for review"; editable only by the line supervisor
 * (checksheets:edit); moved here only via the explicit Send for Review action.
 * approved - locked for everyone, forever; only reachable via the explicit
 * Approve action (checksheets:approve).
 */
export type CheckSheetStatus = 'draft' | 'submitted' | 'approved'

export type DocumentStatus = 'draft' | 'in-review' | 'approved' | 'obsolete'

export type DocumentType = 'Quality Manual' | 'SOP' | 'Work Instruction' | 'Format / Checklist' | 'Policy'

/** Master specification / tolerance entry - sourced from Tolerances_updated_.xlsx */
export interface Specification {
  id: string
  category: 'Line Setup' | 'Melting & Degassing' | 'Environment' | 'Die Casting' | 'Verification' | 'Sign-off'
  parameter: string
  allowedValues: string
  min?: number
  max?: number
  unit?: string
}

export interface QmsDocument {
  id: string
  code: string
  title: string
  type: DocumentType
  status: DocumentStatus
  version: string
  owner: string
  revisionDate: string
  nextReviewDate: string
}

export interface ShiftReading {
  id: string
  time: string
  ingotKg: number
  dross: string
  meltingTempC: number
  coverallGrams: number
  degassingMin: number
  pressureBar: number
  flowRateLpm: number
  rotorRpm: number
  gasChecking: string
  roomTempC: number
  humidityPct: number
  holdingFurnaceTempC: number
}

export interface MachineReading {
  id: string
  mcNo: string
  bcNo: string
  dieCoatThicknessMicrons: number
  diePreheatTempC: number
  coolingTimeSec: number
  pouringTimeSec: number
  tiltingTimeSec: number
  degasKillingMin: number
  dieTempC: number
}

export interface CorePinCheck {
  cavityNo: number
  status: OkNotOk
}

export interface DiePrepCheck {
  diePreHeatingPerSop: OkNotOk
  dieRunnerRaiserCleaning: OkNotOk
  dpt: OkNotOk
  coreVerification: OkNotOk
  dieSprayCoatingApply: OkNotOk
  rejectedSetsComment: string
}

export interface CheckSheetSignatures {
  operatorSign: string
  shiftSupervisorSign: string
  inChargeSign: string
}

/** Production line record - one shift's Process Check Sheet, sourced from the Master Mando check sheet */
export interface CheckSheetRecord {
  id: string
  line: ProductionLine
  date: string
  shift: Shift
  furnaceNo: string
  metalGrade: string
  degassingGas: string
  bestCastAlloy: YesNo
  otherAlloy: YesNo
  status: CheckSheetStatus
  readings: ShiftReading[]
  machineReadings: MachineReading[]
  corePinChecks: CorePinCheck[]
  corePinComment: string
  diePrep: DiePrepCheck
  signatures: CheckSheetSignatures
}
