import { Plus, Receipt } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { DataTable, type DataColumn } from '../components/ui/DataTable'
import { Drawer } from '../components/ui/Drawer'
import { FormField } from '../components/ui/FormField'
import { StatusChip } from '../components/ui/StatusChip'
import { useAccess } from '../context/AccessContext'
import { VOUCHER_STATUS_OPTIONS, VOUCHER_TYPE_OPTIONS } from '../data/options'
import { ACCOUNT_VOUCHERS } from '../data/accountVouchers'
import { loadAccountVouchers, saveAccountVoucher, updateAccountVoucher } from '../data/repository'
import { nextId } from '../lib/id'
import { voucherStatusTone } from '../lib/tones'
import { useAsyncData } from '../lib/useAsyncData'
import type { AccountVoucher, VoucherStatus, VoucherType } from '../types/business'

function emptyVoucher(): AccountVoucher {
  return {
    id: nextId('voucher'),
    voucherNo: '',
    type: 'Purchase Invoice',
    party: '',
    amount: 0,
    voucherDate: new Date().toISOString().slice(0, 10),
    dueDate: '',
    status: 'Pending',
    paymentMode: '',
    reference: '',
  }
}

const columns: DataColumn<AccountVoucher>[] = [
  { key: 'voucherNo', header: 'Voucher No.', width: 150, nowrap: true },
  { key: 'type', header: 'Type', width: 140 },
  { key: 'party', header: 'Party', width: 220 },
  { key: 'amount', header: 'Amount', width: 130, render: (r) => `₹${r.amount.toLocaleString()}` },
  { key: 'voucherDate', header: 'Date', width: 110, nowrap: true },
  { key: 'dueDate', header: 'Due Date', width: 110, nowrap: true },
  { key: 'status', header: 'Status', width: 110, render: (r) => <StatusChip value={r.status} tone={voucherStatusTone[r.status]} /> },
  { key: 'paymentMode', header: 'Payment Mode', width: 130 },
  { key: 'reference', header: 'Reference', width: 130 },
]

export function Accounts() {
  const { hasPermission } = useAccess()
  const canCreate = hasPermission('accounts:create')
  const canEdit = hasPermission('accounts:edit')
  const { data: vouchers, setData: setVouchers, loading } = useAsyncData(loadAccountVouchers, ACCOUNT_VOUCHERS)
  const [active, setActive] = useState<AccountVoucher | null>(null)
  const [isNew, setIsNew] = useState(false)

  function openNew() {
    setActive(emptyVoucher())
    setIsNew(true)
  }

  function openRow(voucher: AccountVoucher) {
    setActive(voucher)
    setIsNew(false)
  }

  function close() {
    setActive(null)
    setIsNew(false)
  }

  function save() {
    if (!active) return
    if (isNew) {
      setVouchers((prev) => [active, ...prev])
      saveAccountVoucher(active).catch((err) => console.warn('Could not persist voucher:', err))
    } else {
      setVouchers((prev) => prev.map((v) => (v.id === active.id ? active : v)))
      updateAccountVoucher(active).catch((err) => console.warn('Could not persist voucher changes:', err))
    }
    close()
  }

  const editable = isNew || canEdit

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text">Accounts</h1>
            <p className="text-sm text-muted">Purchase/sales invoices, payments and receipts. Click a row to open it.</p>
          </div>
        </div>
        {canCreate && (
          <Button icon={<Plus className="h-4 w-4" />} onClick={openNew}>
            New Voucher
          </Button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading vouchers…</p>
      ) : (
        <DataTable tableKey="account-vouchers" columns={columns} data={vouchers} onRowClick={openRow} />
      )}

      <Drawer
        open={!!active}
        onClose={close}
        title={isNew ? 'New Voucher' : `Voucher - ${active?.voucherNo}`}
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
            <legend className="mb-2 px-1 text-sm font-semibold text-primary">Voucher Details</legend>
            <FormField label="Voucher No." required value={active.voucherNo} readOnly={!editable} onChange={(v) => setActive({ ...active, voucherNo: String(v) })} />
            <FormField label="Type" type="select" required value={active.type} options={VOUCHER_TYPE_OPTIONS} readOnly={!editable} onChange={(v) => setActive({ ...active, type: v as VoucherType })} />
            <FormField label="Party" required span={2} value={active.party} readOnly={!editable} onChange={(v) => setActive({ ...active, party: String(v) })} placeholder="Vendor or customer name" />
            <FormField label="Amount (₹)" type="number" required value={active.amount} readOnly={!editable} onChange={(v) => setActive({ ...active, amount: Number(v) })} />
            <FormField label="Status" type="status" required value={active.status} options={VOUCHER_STATUS_OPTIONS} readOnly={!editable} onChange={(v) => setActive({ ...active, status: v as VoucherStatus })} />
            <FormField label="Voucher Date" type="date" required value={active.voucherDate} readOnly={!editable} onChange={(v) => setActive({ ...active, voucherDate: String(v) })} />
            <FormField label="Due Date" type="date" value={active.dueDate} readOnly={!editable} onChange={(v) => setActive({ ...active, dueDate: String(v) })} />
            <FormField label="Payment Mode" value={active.paymentMode} readOnly={!editable} onChange={(v) => setActive({ ...active, paymentMode: String(v) })} placeholder="Bank Transfer / NEFT / Cheque" />
            <FormField label="Reference" value={active.reference} readOnly={!editable} onChange={(v) => setActive({ ...active, reference: String(v) })} placeholder="PO / SO number" />
          </fieldset>
        )}
      </Drawer>
    </div>
  )
}
