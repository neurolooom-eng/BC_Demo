import type { Specification } from '../types/domain'

/**
 * Master specification / tolerance list, digitised from the uploaded
 * "Tolerances_updated_.xlsx" quality process check sheet spec.
 */
export const SPECIFICATIONS: Specification[] = [
  { id: 'spec-01', category: 'Line Setup', parameter: 'Line - Mando Model Line', allowedValues: '01, 02, 03 & 06' },
  { id: 'spec-02', category: 'Line Setup', parameter: 'Metal Grade', allowedValues: 'AC2A' },
  { id: 'spec-03', category: 'Line Setup', parameter: 'Furnace', allowedValues: 'HF1, HF2, HF3, HF4, HF5, HF6, HF11 & HF12' },
  { id: 'spec-04', category: 'Line Setup', parameter: 'Best Cast Alloy', allowedValues: 'YES / NO' },
  { id: 'spec-05', category: 'Line Setup', parameter: 'Other Alloy', allowedValues: 'YES / NO' },
  { id: 'spec-06', category: 'Melting & Degassing', parameter: 'Degassing Gas', allowedValues: 'N2' },
  { id: 'spec-07', category: 'Melting & Degassing', parameter: 'Ingot (50% cut pieces / 50% returns)', allowedValues: 'Numeric - Kgs per charge', unit: 'kg' },
  { id: 'spec-08', category: 'Melting & Degassing', parameter: 'Dross Cleaning', allowedValues: 'Once every 20 min', min: 20, max: 20, unit: 'min' },
  { id: 'spec-09', category: 'Melting & Degassing', parameter: 'Melting Metal Temp', allowedValues: '700 - 800', min: 700, max: 800, unit: '°C' },
  { id: 'spec-10', category: 'Melting & Degassing', parameter: 'Coverall', allowedValues: '200 - 300 grams per charge', min: 200, max: 300, unit: 'g' },
  { id: 'spec-11', category: 'Melting & Degassing', parameter: 'Degassing', allowedValues: '15 min / charge', min: 15, max: 15, unit: 'min' },
  { id: 'spec-12', category: 'Melting & Degassing', parameter: 'Pressure', allowedValues: '2 - 3 bar', min: 2, max: 3, unit: 'bar' },
  { id: 'spec-13', category: 'Melting & Degassing', parameter: 'Flow Rate', allowedValues: '6 - 9 LPM', min: 6, max: 9, unit: 'LPM' },
  { id: 'spec-14', category: 'Melting & Degassing', parameter: 'Rotor RPM', allowedValues: '550 - 650 RPM (100mm rotor) / 350 - 400 RPM (190mm rotor)', min: 350, max: 650, unit: 'RPM' },
  { id: 'spec-15', category: 'Melting & Degassing', parameter: 'Gas Checking - K-Mould / Vacuum Sample', allowedValues: '0.00 - 0.10 / 2.68 - 2.75' },
  { id: 'spec-16', category: 'Environment', parameter: 'Room Temp', allowedValues: 'Numeric', unit: '°C' },
  { id: 'spec-17', category: 'Environment', parameter: 'Humidity', allowedValues: 'Numeric', unit: '%' },
  { id: 'spec-18', category: 'Melting & Degassing', parameter: 'Holding Furnace Metal Temp', allowedValues: '730 - 750', min: 730, max: 750, unit: '°C' },
  { id: 'spec-19', category: 'Die Casting', parameter: 'M/C No.', allowedValues: 'Numeric' },
  { id: 'spec-20', category: 'Die Casting', parameter: 'BC No.', allowedValues: 'Numeric' },
  { id: 'spec-21', category: 'Die Casting', parameter: 'Die Coating Thickness', allowedValues: '100 - 150 microns', min: 100, max: 150, unit: 'µm' },
  { id: 'spec-22', category: 'Die Casting', parameter: 'Die Preheat Temp', allowedValues: '225 - 350', min: 225, max: 350, unit: '°C' },
  { id: 'spec-23', category: 'Die Casting', parameter: 'Cooling Time', allowedValues: '120 - 180', min: 120, max: 180, unit: 'sec' },
  { id: 'spec-24', category: 'Die Casting', parameter: 'Pouring Time', allowedValues: '6 - 9 secs', min: 6, max: 9, unit: 'sec' },
  { id: 'spec-25', category: 'Die Casting', parameter: 'Tilting Time', allowedValues: 'Numeric', unit: 'sec' },
  { id: 'spec-26', category: 'Die Casting', parameter: 'Degassing Killing Time', allowedValues: '10 - 15 min', min: 10, max: 15, unit: 'min' },
  { id: 'spec-27', category: 'Verification', parameter: 'Die Runner / Raiser / Coating', allowedValues: 'Visually OK / Not OK' },
  { id: 'spec-28', category: 'Verification', parameter: 'DPT', allowedValues: 'OK / Not OK' },
  { id: 'spec-29', category: 'Verification', parameter: 'Core Pin Verification', allowedValues: 'OK / Not OK' },
  { id: 'spec-30', category: 'Verification', parameter: 'Die Spray Coating Apply', allowedValues: 'OK / Not OK' },
  { id: 'spec-31', category: 'Sign-off', parameter: 'Shift Supervisor Sign', allowedValues: 'Vimal, Bharathi, Mohan, Naveen, Ashok' },
  { id: 'spec-32', category: 'Sign-off', parameter: 'In-Charge Sign', allowedValues: 'Vikensh' },
]
