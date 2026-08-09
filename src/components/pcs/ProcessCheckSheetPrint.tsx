import { assetUrl } from '../../lib/assetUrl'
import { DIE_TEMP_PARAM, isOutOfSpec, PCS_SHIFTS, SLOT_LINE_PARAMS } from '../../data/pcs'
import type { DaySheet, PcsReading } from '../../types/pcs'

/**
 * Faithful reproduction of QC FMT 038 Rev 10 — one landscape sheet per day,
 * all three shifts side by side in 30-minute columns. Out-of-spec readings
 * render in red. Wrapped in #print-area so the app's print CSS isolates it.
 */

const SLOT_W = 15 // px per 30-min column
const DESC_W = 150 // px for the description column

function keyOf(code: string, shift: string, slot: string, mc?: string) {
  return `${code}|${shift}|${slot}|${mc ?? ''}`
}

function readingMap(readings: PcsReading[]) {
  const m = new Map<string, PcsReading>()
  for (const r of readings) m.set(keyOf(r.parameterCode, r.shiftCode, r.slot, r.machineCode), r)
  return m
}

const cell = 'border border-black/50 text-center align-middle whitespace-nowrap'
const hcell = `${cell} bg-black/5 font-semibold`

export function ProcessCheckSheetPrint({ sheet }: { sheet: DaySheet }) {
  const map = readingMap(sheet.readings)
  const flatSlots = PCS_SHIFTS.flatMap((s) => s.slots.map((slot) => ({ shift: s.code, slot })))

  function ValueCell({ code, shift, slot, mc }: { code: string; shift: string; slot: string; mc?: string }) {
    const r = map.get(keyOf(code, shift, slot, mc))
    const v = r?.value
    const bad = v != null && isOutOfSpec(code, v)
    return (
      <td className={cell} style={{ width: SLOT_W, minWidth: SLOT_W }}>
        <span className={bad ? 'font-bold text-red-600' : ''}>{v ?? ''}</span>
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
            <p className="text-[11px] font-bold">BEST CAST IT LTD</p>
            <p className="text-[8px]">Chennai</p>
          </div>
        </div>
        <p className="text-[15px] font-extrabold tracking-wide">PROCESS CHECK SHEET</p>
        <div className="text-right text-[8px] leading-tight">
          <p>QC FMT 038</p>
          <p>Rev. 10 : 01.09.2025</p>
        </div>
      </div>

      {/* Header meta */}
      <table className="mt-1 w-full border-collapse" style={{ fontSize: 8 }}>
        <tbody>
          <tr>
            <td className={`${cell} px-1 text-left font-semibold`}>LINE - {sheet.line}</td>
            <td className={`${cell} px-1 text-left`}>Furnace No.: <b>{sheet.furnaceNos}</b></td>
            <td className={`${cell} px-1 text-left`}>Best Cast Alloy: <b>{sheet.bestCastAlloy ? 'Yes' : 'No'}</b></td>
            <td className={`${cell} px-1 text-left`}>Other Alloy: <b>{sheet.otherAlloy ? 'Yes' : 'No'}</b></td>
            <td className={`${cell} px-1 text-left`}>Date: <b>{sheet.date}</b></td>
          </tr>
          <tr>
            <td className={`${cell} px-1 text-left`}>Metal Grade: <b>{sheet.metalGrade}</b></td>
            <td className={`${cell} px-1 text-left`}>Degassing Gas: <b>{sheet.degassingGas}</b></td>
            <td className={`${cell} px-1 text-left`} colSpan={3}>In-Charge: <b>{sheet.inChargeSign}</b></td>
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
                <th key={i} className={`${cell} bg-black/5`} style={{ width: SLOT_W, minWidth: SLOT_W, fontSize: 6 }}>
                  {c.slot}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SLOT_LINE_PARAMS.map((p) => (
              <tr key={p.code}>
                <td className={`${cell} px-1 text-left`} style={{ width: DESC_W, fontSize: 6.5 }}>
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
              {['M/C No', 'BC No', 'Die Coat Thk', 'Die Preheat', 'Cooling', 'Pouring', 'Tilting', 'Degas Kill'].map((h) => (
                <th key={h} className={hcell} style={{ width: 34, minWidth: 34, fontSize: 6 }}>
                  {h}
                </th>
              ))}
              <th className={hcell} colSpan={flatSlots.length} style={{ fontSize: 6.5 }}>
                {DIE_TEMP_PARAM.label}
              </th>
            </tr>
          </thead>
          <tbody>
            {sheet.machines.map((mc) => (
              <tr key={mc.machineCode}>
                <td className={`${cell} font-semibold`}>{mc.machineCode}</td>
                <td className={cell}>{mc.bcNo}</td>
                <td className={cell}>{mc.dieCoatThickness}</td>
                <td className={cell}>{mc.diePreheatTemp}</td>
                <td className={cell}>{mc.coolingTime}</td>
                <td className={cell}>{mc.pouringTime}</td>
                <td className={cell}>{mc.tiltingTime}</td>
                <td className={cell}>{mc.degasKillingTime}</td>
                {flatSlots.map((c, i) => (
                  <ValueCell key={i} code="DIE_TEMP" shift={c.shift} slot={c.slot} mc={mc.machineCode} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Core Pin Verification per shift */}
      <table className="mt-1 w-full border-collapse" style={{ fontSize: 7 }}>
        <tbody>
          <tr>
            <td className={`${hcell} px-1 text-left`} style={{ width: DESC_W }}>
              Core Pin Verification (no blockage)
            </td>
            {sheet.corePins.map((cp) => (
              <td key={cp.shiftCode} className={`${cell} px-1 text-left`}>
                <b>Shift {cp.shiftCode}:</b>{' '}
                {cp.cavities.map((ok, i) => (
                  <span key={i} className={ok ? '' : 'font-bold text-red-600'}>
                    {i + 1}
                    {ok ? '✓' : '✗'}{' '}
                  </span>
                ))}
                {cp.comment ? <i> — {cp.comment}</i> : null}
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      {/* Die prep startup + Error proofs */}
      <table className="mt-1 w-full border-collapse" style={{ fontSize: 7 }}>
        <tbody>
          <tr>
            <td className={`${hcell} px-1 text-left`} style={{ width: DESC_W }}>Die Preparation Startup</td>
            <td className={`${cell} px-1 text-left`}>Die Pre-Heating as per SOP: <b>{sheet.startup.diePreheatSOP}</b></td>
            <td className={`${cell} px-1 text-left`}>Die Runner Raiser Coating: <b>{sheet.startup.dieRunnerRaiserCoating}</b></td>
            <td className={`${cell} px-1 text-left`}>Die Spray Coating: <b>{sheet.startup.dieSprayCoating}</b></td>
            <td className={`${cell} px-1 text-left`}>DPT: <b>{sheet.startup.dpt}</b></td>
            <td className={`${cell} px-1 text-left`}>3~5 Rejected at start: <b>{sheet.startup.rejectedAtStart}</b></td>
          </tr>
          <tr>
            <td className={`${hcell} px-1 text-left`}>Error Proofs (working condition)</td>
            <td className={`${cell} px-1 text-left`} colSpan={5}>
              <b>{sheet.startup.errorProofsOk ? 'OK' : 'CHECK'}</b> — {sheet.startup.errorProofsComment}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Signatures */}
      <table className="mt-1 w-full border-collapse" style={{ fontSize: 7 }}>
        <tbody>
          <tr>
            <td className={`${hcell} px-1 text-left`} style={{ width: DESC_W }}>Signatures</td>
            {sheet.signoffs.map((s) => (
              <td key={s.shiftCode} className={`${cell} px-1 text-left`}>
                <b>Shift {s.shiftCode}</b> — Operator: {s.operator} · Supervisor: {s.supervisor}
              </td>
            ))}
            <td className={`${cell} px-1 text-left`}>In-Charge: <b>{sheet.inChargeSign}</b></td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
