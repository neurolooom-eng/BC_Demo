import { ClipboardCheck, FileText, ShieldCheck, Timer } from 'lucide-react'
import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard, PALETTE } from '../components/ui/ChartCard'
import { KpiCard } from '../components/ui/KpiCard'
import { CHECK_SHEETS } from '../data/checkSheets'
import { DOCUMENTS } from '../data/documents'

const TODAY = '2026-07-05'

export function Dashboard() {
  const todaySheets = useMemo(() => CHECK_SHEETS.filter((s) => s.date === TODAY), [])
  const approvedCount = useMemo(() => CHECK_SHEETS.filter((s) => s.status === 'approved').length, [])
  const approvalRate = Math.round((approvedCount / CHECK_SHEETS.length) * 100)
  const pendingReview = CHECK_SHEETS.filter((s) => s.status === 'submitted' || s.status === 'draft').length
  const activeDocuments = DOCUMENTS.filter((d) => d.status === 'approved').length

  const byLine = useMemo(() => {
    const map = new Map<string, number>()
    CHECK_SHEETS.forEach((s) => map.set(s.line, (map.get(s.line) ?? 0) + 1))
    return Array.from(map, ([line, count]) => ({ line, count }))
  }, [])

  const byStatus = useMemo(() => {
    const map = new Map<string, number>()
    CHECK_SHEETS.forEach((s) => map.set(s.status, (map.get(s.status) ?? 0) + 1))
    return Array.from(map, ([status, count]) => ({ status, count }))
  }, [])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-text">Executive Dashboard</h1>
        <p className="text-sm text-muted">Best Cast IT Limited - Quality Management System overview</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Check Sheets Today" value={todaySheets.length} target={12} icon={ClipboardCheck} />
        <KpiCard label="Approval Rate" value={approvalRate} format="percent" target={90} icon={ShieldCheck} />
        <KpiCard label="Pending Review" value={pendingReview} target={0} goal="lower" icon={Timer} />
        <KpiCard label="Active Documents" value={activeDocuments} icon={FileText} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Check Sheets by Production Line">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byLine}>
              <CartesianGrid stroke="rgb(var(--c-border))" vertical={false} />
              <XAxis dataKey="line" tick={{ fontSize: 11, fill: 'rgb(var(--c-muted))' }} angle={-15} textAnchor="end" height={40} />
              <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--c-muted))' }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {byLine.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Check Sheet Status Distribution">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={byStatus} dataKey="count" nameKey="status" innerRadius={45} outerRadius={80} paddingAngle={2}>
                {byStatus.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}
