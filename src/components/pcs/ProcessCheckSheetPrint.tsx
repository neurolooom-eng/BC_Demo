import { assetUrl } from '../../lib/assetUrl'
import { DIE_TEMP_PARAM, isOutOfSpec, machineActiveAt, PCS_SHIFTS, readingValue, slotIndex, SLOT_LINE_PARAMS, slotEntryMap } from '../../data/pcs'
import type { DaySheet } from '../../types/pcs'

/**
 * Reproduction of the master template QC FMT 038 Rev 10 — one landscape sheet
 * per day, all three shifts side by side in 30-minute columns (1st: 16, 2nd:
 * 15, 3rd: 16 exactly as the template). The grid is assembled from the day's
 * hourly reading child records (slotEntries), aligned by slot. Machines outside
 * their active window print N/A. Out-of-spec readings use the theme-aware `.oos`
 * highlight. Wrapped in #print-area so the app's print CSS isolates it.
 */

const SLOT_W = 15 // px per 30-min column
const DESC_W = 155 // px for the description column

const cell = 'border border-black/60 text-center align-middle whitespace-nowrap'
const hcell = `${cell} bg-black/5 font-semibold`
const labelCell = `${cell} px-1 text-left`

export function ProcessCheckSheetPrint({ sheet }: { sheet: DaySheet }) {
  const entries = slotEntryMap(sheet.slotEntries)
  const flatSlots = PCS_SHIFTS.flatMap((s) => s.slots.map((slot) => ({ shift: s.code, slot })))
  const machines = [...sheet.machines].sort(
    (a, b) => slotIndex(a.activeFromShift, a.activeFromSlot) - slotIndex(b.activeFromShift, b.activeFromSlot) || a.machineCode.localeCompare(b.machineCode),
  )

  function ValueCell({ code, shift, slot, mc }: { code: string; shift: string; slot: string; mc?: string }) {
    const v = readingValue(entries, shift, slot, code, mc)
    const bad = v != null && isOutOfSpec(code, v)
    return (
      <td className={`${cell}${bad ? ' oos font-bold' : ''}`} style={{ width: SLOT_W, minWidth: SLOT_W }}>
        {v ?? ''}
      </td>
    )
  }

  return (
    <div id="print-area" className="bg-white p-3 text-black" style={{ fontSize: 7 }}>
      <style>{`@media print { @page { size: A3 landscape; margin: 6mm } }`}</style>

      {/* Title */}
      <div className="flex items-start justify-between border-b border-black pb-1">
        <div className="flex items-center gap-2">
          <img src={assetUrl('/logo-mark.svg')} alt="Best Cast" className="h-7 w-auto" />
          <div className="leading-tight">
            <p className="text-[11px] font-bold">BEST CAST IT LTD.,</p>
            <p className="text-[8px]">Chennai - 600 007</p>
          </div>
        </div>
        <p className="text-[15px] font-extrabold tracking-wide">PROCESS CHECKSHEET</p>
        <div className="text-right text-[8px] leading-tight">
          <p>QC FMT 038</p>
          <p>Rev.10 - 01-09-2025</p>
        </div>
      </div>

      {/* Header meta */}
      <table className="mt-1 w-full border-collapse" style={{ fontSize: 8 }}>
        <tbody>
          <tr>
            <td className={`${labelCell} font-semibold`}>LINE - MANDO MODEL LINE</td>
            <td className={labelCell}>FURNACE No. :- <b>{sheet.furnaceNos}</b></td>
            <td className={labelCell}>Best Cast Alloy: <b>{sheet.bestCastAlloy ? 'Yes' : 'No'}</b></td>
            <td className={labelCell}>Date : <b>{sheet.date}</b></td>
          </tr>
          <tr>
            <td className={labelCell}>Metal Grade - <b>{sheet.metalGrade}</b></td>
            <td className={labelCell}>Degassing Gas - <b>{sheet.degassingGas}</b></td>
            <td className={labelCell}>Other Alloy: <b>{sheet.otherAlloy ? 'Yes' : 'No'}</b></td>
            <td className={labelCell}>In - Charge : <b>{sheet.inChargeSign}</b></td>
          </tr>
        </tbody>
      </table>

      {/* Readings grid */}
      <div className="mt-1 overflow-x-auto">
        <table className="border-collapse" style={{ tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th className={hcell} style={{ width: DESC_W, minWidth: DESC_W }} rowSpan={2}>
                DESCRIPTION
              </th>
              {PCS_SHIFTS.map((s) => (
                <th key={s.code} className={hcell} colSpan={s.slots.length}>
                  {s.name}
                </th>
              ))}
            </tr>
            <tr>
              {flatSlots.map((c, i) => (
                <th key={i} className={`${cell} bg-black/5`} style={{ width: SLOT_W, minWidth: SLOT_W, fontSize: 5.5 }}>
                  {c.slot}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SLOT_LINE_PARAMS.map((p) => (
              <tr key={p.code}>
                <td className={labelCell} style={{ width: DESC_W, fontSize: 6 }}>
                  {p.label}
                </td>
                {flatSlots.map((c, i) => (
                  <ValueCell key={i} code={p.code} shift={c.shift} slot={c.slot} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Machine block: setup + per-slot Die Temp */}
      <div className="mt-1 overflow-x-auto">
        <table className="border-collapse" style={{ tableLayout: 'fixed' }}>
          <thead>
            <tr>
              {['M/C. No.', 'BC No.', 'Die coat thickness', 'Die Preheat Temp.', 'Cooling Time', 'Pouring Time', 'Tilting Time', 'Degas. Killing time 10 ~ 15 Mins'].map((h) => (
                <th key={h} className={hcell} style={{ width: 36, minWidth: 36, fontSize: 5.5 }}>
                  {h}
                </th>
              ))}
              <th className={hcell} colSpan={flatSlots.length} style={{ fontSize: 6.5 }}>
                {DIE_TEMP_PARAM.label}
              </th>
            </tr>
          </thead>
          <tbody>
            {machines.map((mc) => (
              <tr key={mc.machineCode}>
                <td className={`${cell} font-semibold`}>{mc.machineCode}</td>
                <td className={cell}>{mc.bcNo}</td>
                <td className={cell}>{mc.dieCoatThickness}</td>
                <td className={cell}>{mc.diePreheatTemp}</td>
                <td className={cell}>{mc.coolingTime}</td>
                <td className={cell}>{mc.pouringTime}</td>
                <td className={cell}>{mc.tiltingTime}</td>
                <td className={cell}>{mc.degasKillingTime}</td>
                {flatSlots.map((c, i) =>
                  machineActiveAt(mc, c.shift, c.slot) ? (
                    <ValueCell key={i} code="DIE_TEMP" shift={c.shift} slot={c.slot} mc={mc.machineCode} />
                  ) : (
                    <td key={i} className={`${cell} text-black/30`} style={{ width: SLOT_W, minWidth: SLOT_W, fontSize: 6 }}>
                      N/A
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Core Pin Verification — per shift, cavity 1..10, OK / NOT OK */}
      <div className="mt-1">
        <p className={`${hcell} px-1 py-0.5 text-left`} style={{ fontSize: 7 }}>
          Core Pin Verification to ensure no blockage
        </p>
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-3">
          {PCS_SHIFTS.map((s) => {
            const cp = sheet.corePins.find((c) => c.shiftCode === s.code)
            return (
              <table key={s.code} className="w-full border-collapse" style={{ fontSize: 6.5 }}>
                <tbody>
                  <tr>
                    <td className={`${hcell}`} style={{ width: 40 }}>
                      Cavity no
                    </td>
                    {Array.from({ length: 10 }, (_, i) => (
                      <td key={i} className={hcell}>
                        {i + 1}
                      </td>
                    ))}
                    <td className={`${hcell}`}>Comment</td>
                  </tr>
                  <tr>
                    <td className={cell}>OK / NOT OK</td>
                    {Array.from({ length: 10 }, (_, i) => {
                      const ok = cp?.cavities[i]
                      return (
                        <td key={i} className={cell}>
                          <span className={ok === false ? 'font-bold text-red-600' : ''}>{ok == null ? '' : ok ? '✓' : '✗'}</span>
                        </td>
                      )
                    })}
                    <td className={`${cell} px-1 text-left`}>{cp?.comment}</td>
                  </tr>
                </tbody>
              </table>
            )
          })}
        </div>
      </div>

      {/* Error Proofs */}
      <table className="mt-1 w-full border-collapse" style={{ fontSize: 6.5 }}>
        <tbody>
          <tr>
            <td className={`${labelCell}`} style={{ width: DESC_W }}>
              Error Proofs : - 2 Bar pressure &amp; (6~9) LPM alarm, Die Temp. interlink with GDC, Melting Temp. Cut off, Auto Top door closing, Degassing Timer &amp; Alarm - (Working Condition) - Robot Furnace change alarm condition. Pouring spoon Damper &amp; 3 stage of air cleaning. Comment Here --&gt;
            </td>
            <td className={`${cell} px-1 text-left`}>
              <b>{sheet.startup.errorProofsOk ? 'OK' : 'CHECK'}</b> — {sheet.startup.errorProofsComment}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Die Preparation Startup checking */}
      <table className="mt-1 w-full border-collapse" style={{ fontSize: 6.5 }}>
        <tbody>
          <tr>
            <td className={`${hcell} px-1 text-left`} rowSpan={2} style={{ width: DESC_W }}>
              Die Preparation Startup checking
            </td>
            <td className={labelCell}>Die Pre Heating as per SOP: <b>{sheet.startup.diePreheatSOP}</b></td>
            <td className={labelCell}>
              Die Spray Coating Apply. (Visual) - FORACE / Asbestos (Raiser) / DYCOTE 11 / DYCOAT 140 (Die insert): <b>{sheet.startup.dieSprayCoating}</b>
            </td>
            <td className={labelCell}>3 ~ 5 Sets Rejected While Starting the Die - <b>{sheet.startup.rejectedAtStart}</b></td>
          </tr>
          <tr>
            <td className={labelCell}>Die Runner Raiser Cleaning / Coating: <b>{sheet.startup.dieRunnerRaiserCoating}</b></td>
            <td className={labelCell}>DPT: <b>{sheet.startup.dpt}</b></td>
            <td className={labelCell} />
          </tr>
        </tbody>
      </table>

      {/* Instruction to Operator */}
      <div className="mt-1 border border-black/60 p-1" style={{ fontSize: 6 }}>
        <p>
          Instruction to Operator : ** No Slag/Dross at holding furnance at any time ** Work place should be clean always ** Dross removing Spoon to be cleaned &amp; Re-Coated for every Shift ** Raiser profile for M/Cyl. to be maintained at 60 X 54 mm ** Operator need to tick the coating applied
        </p>
        <p>
          ** Remove dross every pouring by moving the spoon before taking the metal. ** Record the Dross Cleaning Every 20 mins once ** First and second shot to be rejected for every Touch up coat &amp; after 5 mins of machine idleness *** Voice alarm provided for coating verification.
        </p>
      </div>

      {/* Signatures */}
      <table className="mt-1 w-full border-collapse" style={{ fontSize: 7 }}>
        <tbody>
          <tr>
            <td className={`${hcell} px-1 text-left`} style={{ width: DESC_W }}>
              In - Charge Signature: <b>{sheet.inChargeSign}</b>
            </td>
            {sheet.signoffs.map((s, i) => (
              <td key={s.shiftCode} className={`${cell} px-1 text-left`}>
                <b>{['First', 'Second', 'Third'][i] ?? s.shiftCode} Shift</b> — Operator sign: {s.operator} · Shift Supervisor Sign: {s.supervisor}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
