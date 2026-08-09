import {
  BookOpen,
  BookText,
  ClipboardCheck,
  ClipboardList,
  FileCheck2,
  FileText,
  LayoutDashboard,
  Package,
  Printer,
  Receipt,
  Ruler,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Wrench,
} from 'lucide-react'
import type { Permission } from '../../types/access'

export interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
  /** Omit to always show the item (e.g. Settings). */
  permission?: Permission
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const NAV: NavGroup[] = [
  {
    label: 'Overview',
    items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard:view' }],
  },
  {
    label: 'Quality Management',
    items: [
      { to: '/documents', label: 'QMS Documents', icon: FileText, permission: 'documents:view' },
      { to: '/specifications', label: 'Specifications', icon: Ruler, permission: 'specifications:view' },
    ],
  },
  {
    label: 'Production',
    items: [
      { to: '/check-sheets', label: 'Process Check Sheets', icon: ClipboardList, permission: 'checksheets:view' },
      { to: '/day-check-sheet', label: 'Day Check Sheet (Print)', icon: Printer, permission: 'checksheets:view' },
    ],
  },
  {
    label: 'Supply Chain',
    items: [
      { to: '/purchase', label: 'Purchase', icon: ShoppingCart, permission: 'purchase:view' },
      { to: '/stores', label: 'Stores', icon: Package, permission: 'stores:view' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { to: '/accounts', label: 'Accounts', icon: Receipt, permission: 'accounts:view' },
      { to: '/ledgers', label: 'Ledgers', icon: BookText, permission: 'ledgers:view' },
    ],
  },
  {
    label: 'Documentation',
    items: [
      { to: '/knowledge-base', label: 'Knowledge Base', icon: BookOpen },
      { to: '/requirements', label: 'Requirements', icon: FileCheck2, permission: 'dev:access' },
      { to: '/uat', label: 'UAT', icon: ClipboardCheck, permission: 'dev:access' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { to: '/settings', label: 'Settings', icon: Settings },
      { to: '/admin', label: 'Users & Access', icon: ShieldCheck, permission: 'admin:access' },
      { to: '/config', label: 'Developer Config', icon: Wrench, permission: 'config:access' },
    ],
  },
]
