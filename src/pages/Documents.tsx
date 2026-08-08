import { FileText, Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { DataTable, type DataColumn } from '../components/ui/DataTable'
import { Drawer } from '../components/ui/Drawer'
import { FormField, type SelectOption } from '../components/ui/FormField'
import { StatusChip } from '../components/ui/StatusChip'
import { useAccess } from '../context/AccessContext'
import { DOCUMENTS } from '../data/documents'
import { loadDocuments, saveDocument } from '../data/repository'
import { nextId } from '../lib/id'
import { documentStatusTone } from '../lib/tones'
import { useAsyncData } from '../lib/useAsyncData'
import type { DocumentStatus, DocumentType, QmsDocument } from '../types/domain'

const TYPE_OPTIONS: SelectOption[] = (
  ['Quality Manual', 'SOP', 'Work Instruction', 'Format / Checklist', 'Policy'] satisfies DocumentType[]
).map((v) => ({ value: v, label: v }))

const STATUS_OPTIONS: SelectOption[] = (
  ['draft', 'in-review', 'approved', 'obsolete'] satisfies DocumentStatus[]
).map((v) => ({ value: v, label: v }))

function emptyDocument(): QmsDocument {
  return {
    id: nextId('doc'),
    code: '',
    title: '',
    type: 'SOP',
    status: 'draft',
    version: 'Rev.1 (draft)',
    owner: '',
    revisionDate: new Date().toISOString().slice(0, 10),
    nextReviewDate: '',
  }
}

const columns: DataColumn<QmsDocument>[] = [
  { key: 'code', header: 'Code', width: 120, nowrap: true },
  { key: 'title', header: 'Title', width: 320 },
  { key: 'type', header: 'Type', width: 160 },
  { key: 'status', header: 'Status', width: 120, render: (r) => <StatusChip value={r.status} tone={documentStatusTone[r.status]} /> },
  { key: 'version', header: 'Version', width: 130 },
  { key: 'owner', header: 'Owner', width: 140 },
  { key: 'revisionDate', header: 'Revision Date', width: 130, nowrap: true },
  { key: 'nextReviewDate', header: 'Next Review', width: 130, nowrap: true },
]

export function Documents() {
  const { hasPermission } = useAccess()
  const canCreate = hasPermission('documents:create')
  const { data: docs, setData: setDocs, loading } = useAsyncData(loadDocuments, DOCUMENTS)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<QmsDocument>(emptyDocument())

  function openNew() {
    setDraft(emptyDocument())
    setOpen(true)
  }

  function save() {
    setDocs((prev) => [draft, ...prev])
    setOpen(false)
    saveDocument(draft).catch((err) => console.warn('Could not persist document to Google Sheets:', err))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text">QMS Documents</h1>
            <p className="text-sm text-muted">Quality manual, SOPs, work instructions and formats under document control.</p>
          </div>
        </div>
        {canCreate && (
          <Button icon={<Plus className="h-4 w-4" />} onClick={openNew}>
            New Document
          </Button>
        )}
      </div>

      {loading ? <p className="text-sm text-muted">Loading documents…</p> : <DataTable tableKey="documents" columns={columns} data={docs} />}

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="New QMS Document"
        subtitle="Register a document under change control"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Save</Button>
          </>
        }
      >
        <fieldset className="card grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
          <legend className="mb-2 px-1 text-sm font-semibold text-primary">Document Details</legend>
          <FormField label="Code" value={draft.code} required onChange={(v) => setDraft({ ...draft, code: String(v) })} placeholder="e.g. SOP-MLT-02" />
          <FormField label="Title" value={draft.title} required onChange={(v) => setDraft({ ...draft, title: String(v) })} span={2} />
          <FormField label="Type" type="select" value={draft.type} options={TYPE_OPTIONS} required onChange={(v) => setDraft({ ...draft, type: v as DocumentType })} />
          <FormField label="Status" type="status" value={draft.status} options={STATUS_OPTIONS} required onChange={(v) => setDraft({ ...draft, status: v as DocumentStatus })} />
          <FormField label="Version" value={draft.version} onChange={(v) => setDraft({ ...draft, version: String(v) })} />
          <FormField label="Owner" type="user" value={draft.owner} options={[
            { value: 'Vikensh R', label: 'Vikensh R' },
            { value: 'Vimal', label: 'Vimal' },
            { value: 'Bharathi', label: 'Bharathi' },
            { value: 'Mohan', label: 'Mohan' },
            { value: 'Naveen', label: 'Naveen' },
            { value: 'Ashok', label: 'Ashok' },
          ]} onChange={(v) => setDraft({ ...draft, owner: String(v) })} />
          <FormField label="Revision Date" type="date" value={draft.revisionDate} onChange={(v) => setDraft({ ...draft, revisionDate: String(v) })} />
          <FormField label="Next Review Date" type="date" value={draft.nextReviewDate} onChange={(v) => setDraft({ ...draft, nextReviewDate: String(v) })} />
        </fieldset>
      </Drawer>
    </div>
  )
}
