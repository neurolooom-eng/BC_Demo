import type { ReactNode } from 'react'
import { Card } from './Card'

export const PALETTE = ['#0d9488', '#0284c7', '#7c3aed', '#d97706', '#dc2626', '#059669', '#db2777', '#0891b2']

export function ChartCard({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text">{title}</h3>
        {action}
      </div>
      <div className="h-64">{children}</div>
    </Card>
  )
}
