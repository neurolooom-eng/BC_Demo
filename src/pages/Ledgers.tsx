import { BookText, Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { DataTable, type DataColumn } from '../components/ui/DataTable'
import { Drawer } from '../components/ui/Drawer'
import { FormField } from '../components/ui/FormField'
import { StatusChip } from '../components/ui/StatusChip'
import { useAccess } from '../context/AccessContext'
import { LEDGER_GROUP_OPTIONS } from '../data/options'
import { LEDGER_ACCOUNTS } from '../data/ledgerAccounts'
import { loadLedgerAccounts, saveLedgerAccount, updateLedgerAccount } from '../data/repository'
import type { Tone } from '../components/ui/StatusChip'
import { nextId } from '../lib/id'
import { useAsyncData } from '../lib/useAsyncData'
import type { LedgerAccount, LedgerGroup } from '../types/business'

function emptyAccount(): LedgerAccount {
  return {
    id: nextId('ledger'),
    accountCode: '',
    accountName: '',
    group: 'Assets',
    openingBalance: 0,
    debit: 0,
    credit: 0,
    asOfDate: new Date().toISOString().slice(0, 10),
  }
}

const CREDIT_NORMAL_GROUPS: LedgerGroup[] = ['Liabilities', 'Equity', 'Income']

/** Liabilities/Equity/Income carry a credit-normal balance; Assets/Expenses are debit-normal. */
function closingBalance(a: LedgerAccount) {
  return CREDIT_NORMAL_GROUPS.includes(a.group) ? a.openingBalance + a.credit - a.debit : a.openingBalance + a.debit - a.credit
}

const groupTone: Record<LedgerGroup, Tone> = {
  Assets: 'primary',
  Liabilities: 'warning',
  Equity: 'info',
  Income: 'success',
  Expenses: 'danger',
}

const columns: DataColumn<LedgerAccount>[] = [
  { key: 'accountCode', header: 'Code', width: 90, nowrap: true },
  { key: 'accountName', header: 'Account Name', width: 260 },
  { key: 'group', header: 'Group', width: 120, render: (r) => <StatusChip value={r.group} tone={groupTone[r.group]} /> },
  { key: 'openingBalance', header: 'Opening Balance', width: 140, render: (r) => `₹${r.openingBalance.toLocaleString()}` },
  { key: 'debit', header: 'Debit', width: 120, render: (r) => `₹${r.debit.toLocaleString()}` },
  { key: 'credit', header: 'Credit', width: 120, render: (r) => `₹${r.credit.toLocaleString()}` },
  { key: 'closingBalance', header: 'Closing Balance', width: 150, accessor: closingBalance, render: (r) => `₹${closingBalance(r).toLocaleString()}` },
  { key: 'asOfDate', header: 'As Of', width: 110, nowrap: true },
]

export function Ledgers() {
  const { hasPermission } = useAccess()
  const canCreate = hasPermission('ledgers:create')
  const canEdit = hasPermission('ledgers:edit')
  const { data: accounts, setData: setAccounts, loading } = useAsyncData(loadLedgerAccounts, LEDGER_ACCOUNTS)
  const [active, setActive] = useState<LedgerAccount | null>(null)
  const [isNew, setIsNew] = useState(false)

  function openNew() {
    setActive(emptyAccount())
    setIsNew(true)
  }

  function openRow(account: LedgerAccount) {
    setActive(account)
    setIsNew(false)
  }

  function close() {
    setActive(null)
    setIsNew(false)
  }

  function save() {
    if (!active) return
    if (isNew) {
      setAccounts((prev) => [active, ...prev])
      saveLedgerAccount(active).catch((err) => console.warn('Could not persist ledger account:', err))
    } else {
      setAccounts((prev) => prev.map((a) => (a.id === active.id ? active : a)))
      updateLedgerAccount(active).catch((err) => console.warn('Could not persist ledger account changes:', err))
    }
    close()
  }

  const editable = isNew || canEdit

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <BookText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text">Ledgers</h1>
            <p className="text-sm text-muted">Chart of accounts with running balances. Click a row to open it.</p>
          </div>
        </div>
        {canCreate && (
          <Button icon={<Plus className="h-4 w-4" />} onClick={openNew}>
            New Ledger Account
          </Button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading ledger accounts…</p>
      ) : (
        <DataTable tableKey="ledger-accounts" columns={columns} data={accounts} onRowClick={openRow} />
      )}

      <Drawer
        open={!!active}
        onClose={close}
        title={isNew ? 'New Ledger Account' : `Ledger - ${active?.accountName}`}
        footer={
          <>
            <Button variant="outline" onClick={close}>
              {isNew ? 'Cancel' : 'Close'}
            </Button>
            {editable && <Button onClick={save}>{isNew ? 'Save' : 'Save Changes'}</Button>}
          </>
        }
      >
        {active && (
          <fieldset className="card grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
            <legend className="mb-2 px-1 text-sm font-semibold text-primary">Ledger Details</legend>
            <FormField label="Account Code" required value={active.accountCode} readOnly={!editable} onChange={(v) => setActive({ ...active, accountCode: String(v) })} />
            <FormField label="Account Name" required value={active.accountName} readOnly={!editable} onChange={(v) => setActive({ ...active, accountName: String(v) })} />
            <FormField label="Group" type="select" required value={active.group} options={LEDGER_GROUP_OPTIONS} readOnly={!editable} onChange={(v) => setActive({ ...active, group: v as LedgerGroup })} />
            <FormField label="As Of Date" type="date" required value={active.asOfDate} readOnly={!editable} onChange={(v) => setActive({ ...active, asOfDate: String(v) })} />
            <FormField label="Opening Balance (₹)" type="number" required value={active.openingBalance} readOnly={!editable} onChange={(v) => setActive({ ...active, openingBalance: Number(v) })} />
            <FormField label="Closing Balance (₹)" value={closingBalance(active)} readOnly disabled onChange={() => {}} />
            <FormField label="Debit (₹)" type="number" value={active.debit} readOnly={!editable} onChange={(v) => setActive({ ...active, debit: Number(v) })} />
            <FormField label="Credit (₹)" type="number" value={active.credit} readOnly={!editable} onChange={(v) => setActive({ ...active, credit: Number(v) })} />
          </fieldset>
        )}
      </Drawer>
    </div>
  )
}
