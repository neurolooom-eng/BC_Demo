import { Check, Inbox, Plus, ShieldCheck } from 'lucide-react'
import { Fragment, useEffect, useState } from 'react'
import { Button } from '../components/ui/Button'
import { DataTable, type DataColumn } from '../components/ui/DataTable'
import { Drawer } from '../components/ui/Drawer'
import { FormField, type SelectOption } from '../components/ui/FormField'
import { StatusChip, type Tone } from '../components/ui/StatusChip'
import { useAccess } from '../context/AccessContext'
import { listAccessRequests, updateAccessRequestStatus } from '../data/credentials'
import { cn } from '../lib/cn'
import { PERMISSION_CATALOG, PERMISSION_MODULES } from '../lib/permissions'
import type { AccessRequest, Group, Permission, User, UserStatus } from '../types/access'

function uniqueId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

function userIdFromEmail(email: string) {
  return email.split('@')[0]?.trim().toLowerCase() ?? ''
}

function emptyUser(defaultGroupId: string): User {
  return { id: uniqueId('user'), userId: '', name: '', email: '', groupId: defaultGroupId, status: 'invited', grants: [], revokes: [] }
}

function emptyGroup(): Group {
  return { id: uniqueId('group'), name: '', description: '', permissions: [] }
}

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'invited', label: 'Invited (must set password)' },
  { value: 'active', label: 'Active' },
  { value: 'disabled', label: 'Disabled' },
]

const STATUS_TONE: Record<UserStatus, Tone> = { active: 'success', invited: 'warning', disabled: 'danger' }

/** Effective allowed permissions for a user = group base + grants - revokes. */
function effectiveAllowed(group: Group | undefined, user: Pick<User, 'grants' | 'revokes'>): Permission[] {
  const base = new Set(group?.permissions ?? [])
  for (const p of user.grants ?? []) base.add(p)
  for (const p of user.revokes ?? []) base.delete(p)
  return Array.from(base)
}

export function Admin() {
  const [tab, setTab] = useState<'users' | 'groups' | 'requests'>('users')
  const { users, groups, setGroups, addUser, saveUser } = useAccess()
  const [requests, setRequests] = useState<AccessRequest[]>([])

  useEffect(() => {
    listAccessRequests().then(setRequests).catch(() => setRequests([]))
  }, [])

  const pendingCount = requests.filter((r) => r.status === 'pending').length

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text">Users & Access</h1>
          <p className="text-sm text-muted">
            Create users with a User ID, assign a Role, and fine-tune their specific access. Group permissions apply live across the app.
          </p>
        </div>
      </div>

      <div className="inline-flex rounded-md border border-border bg-surface p-1">
        <TabButton active={tab === 'users'} onClick={() => setTab('users')}>
          Users
        </TabButton>
        <TabButton active={tab === 'groups'} onClick={() => setTab('groups')}>
          Roles & Permissions
        </TabButton>
        <TabButton active={tab === 'requests'} onClick={() => setTab('requests')}>
          Requests{pendingCount > 0 && <span className="ml-1.5 rounded-full bg-warning/20 px-1.5 text-[10px] font-semibold text-warning">{pendingCount}</span>}
        </TabButton>
      </div>

      {tab === 'users' && <UsersTab users={users} groups={groups} addUser={addUser} saveUser={saveUser} />}
      {tab === 'groups' && <GroupsTab groups={groups} setGroups={setGroups} />}
      {tab === 'requests' && <RequestsTab requests={requests} setRequests={setRequests} groups={groups} addUser={addUser} />}
    </div>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('rounded px-3 py-1.5 text-sm font-medium', active ? 'bg-primary/12 text-primary' : 'text-muted hover:text-text')}
    >
      {children}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

function UsersTab({
  users,
  groups,
  addUser,
  saveUser,
}: {
  users: User[]
  groups: Group[]
  addUser: (user: User) => void
  saveUser: (user: User) => void
}) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<User>(emptyUser(groups[groups.length - 1]?.id ?? ''))
  const [allowed, setAllowed] = useState<Permission[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [userIdTouched, setUserIdTouched] = useState(false)

  const groupOptions: SelectOption[] = groups.map((g) => ({ value: g.id, label: g.name }))
  const draftGroup = groups.find((g) => g.id === draft.groupId)

  function openNew() {
    const fresh = emptyUser(groups[groups.length - 1]?.id ?? '')
    setDraft(fresh)
    setAllowed(effectiveAllowed(groups.find((g) => g.id === fresh.groupId), fresh))
    setEditingId(null)
    setUserIdTouched(false)
    setOpen(true)
  }

  function openEdit(user: User) {
    setDraft({ ...user, grants: user.grants ?? [], revokes: user.revokes ?? [] })
    setAllowed(effectiveAllowed(groups.find((g) => g.id === user.groupId), user))
    setEditingId(user.id)
    setUserIdTouched(true)
    setOpen(true)
  }

  function changeGroup(groupId: string) {
    const next = { ...draft, groupId }
    setDraft(next)
    // Reset overrides to the new role's baseline to avoid surprising leftovers.
    setAllowed(groups.find((g) => g.id === groupId)?.permissions ?? [])
  }

  function togglePermission(permission: Permission) {
    setAllowed((prev) => (prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission]))
  }

  function save() {
    const base = draftGroup?.permissions ?? []
    const grants = allowed.filter((p) => !base.includes(p))
    const revokes = base.filter((p) => !allowed.includes(p))
    const userId = draft.userId.trim() || userIdFromEmail(draft.email)
    const record: User = { ...draft, userId, grants, revokes }
    if (editingId) saveUser(record)
    else addUser(record)
    setOpen(false)
  }

  const overridesCount = (() => {
    const base = draftGroup?.permissions ?? []
    const grants = allowed.filter((p) => !base.includes(p)).length
    const revokes = base.filter((p) => !allowed.includes(p)).length
    return grants + revokes
  })()

  const columns: DataColumn<User>[] = [
    { key: 'name', header: 'Name', width: 160 },
    { key: 'userId', header: 'User ID', width: 130, render: (u) => <span className="font-mono text-xs text-text">{u.userId}</span> },
    { key: 'email', header: 'Email', width: 220 },
    {
      key: 'group',
      header: 'Role',
      width: 160,
      accessor: (u) => groups.find((g) => g.id === u.groupId)?.name ?? '—',
      render: (u) => <StatusChip value={groups.find((g) => g.id === u.groupId)?.name} tone="primary" />,
    },
    {
      key: 'status',
      header: 'Status',
      width: 110,
      accessor: (u) => u.status,
      render: (u) => <StatusChip value={u.status} tone={STATUS_TONE[u.status]} />,
    },
    {
      key: 'access',
      header: 'Overrides',
      width: 90,
      accessor: (u) => (u.grants?.length ?? 0) + (u.revokes?.length ?? 0),
      render: (u) => {
        const n = (u.grants?.length ?? 0) + (u.revokes?.length ?? 0)
        return n > 0 ? <StatusChip value={String(n)} tone="info" /> : <span className="text-muted">—</span>
      },
    },
    {
      key: 'edit',
      header: '',
      width: 70,
      render: (u) => (
        <button type="button" className="text-xs font-medium text-primary hover:underline" onClick={() => openEdit(u)}>
          Edit
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button icon={<Plus className="h-4 w-4" />} onClick={openNew}>
          New User
        </Button>
      </div>
      <DataTable tableKey="admin-users" columns={columns} data={users} />

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={editingId ? 'Edit User' : 'New User'}
        subtitle="Set the login handle and role, then optionally fine-tune specific access below."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={!draft.name.trim() || !draft.email.trim()}>
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <fieldset className="card grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
            <legend className="mb-2 px-1 text-sm font-semibold text-primary">User Details</legend>
            <FormField label="Name" required value={draft.name} onChange={(v) => setDraft({ ...draft, name: String(v) })} />
            <FormField
              label="Email"
              type="email"
              required
              value={draft.email}
              onChange={(v) => {
                const email = String(v)
                setDraft((d) => ({ ...d, email, userId: userIdTouched ? d.userId : userIdFromEmail(email) }))
              }}
            />
            <FormField
              label="User ID (login handle)"
              required
              value={draft.userId}
              help="What the user types on the Login page. Defaults from the email if left blank."
              onChange={(v) => {
                setUserIdTouched(true)
                setDraft({ ...draft, userId: String(v) })
              }}
            />
            <FormField label="Status" type="select" required value={draft.status} options={STATUS_OPTIONS} onChange={(v) => setDraft({ ...draft, status: v as UserStatus })} />
            <FormField label="Role" type="select" required span={2} value={draft.groupId} options={groupOptions} onChange={(v) => changeGroup(String(v))} />
          </fieldset>

          <fieldset className="card p-4">
            <legend className="mb-1 px-1 text-sm font-semibold text-primary">
              Specific Access {overridesCount > 0 && <span className="font-normal text-muted">({overridesCount} override{overridesCount === 1 ? '' : 's'} vs. role)</span>}
            </legend>
            <p className="mb-3 px-1 text-xs text-muted">
              Ticks default to the selected role. Tick to grant an extra permission, untick to revoke one the role would otherwise allow.
            </p>
            <div className="space-y-3">
              {PERMISSION_MODULES.map((module) => (
                <div key={module}>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">{module}</p>
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {PERMISSION_CATALOG.filter((p) => p.module === module).map((perm) => {
                      const checked = allowed.includes(perm.key)
                      const inRole = draftGroup?.permissions.includes(perm.key) ?? false
                      const isOverride = checked !== inRole
                      return (
                        <label key={perm.key} className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-sm hover:bg-surface-2">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
                            checked={checked}
                            onChange={() => togglePermission(perm.key)}
                          />
                          <span className="text-text">{perm.label}</span>
                          {isOverride && (
                            <span className={cn('text-[10px] font-semibold', checked ? 'text-success' : 'text-danger')}>{checked ? '+grant' : '−revoke'}</span>
                          )}
                        </label>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </fieldset>
        </div>
      </Drawer>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Roles & Permissions (unchanged behavior)
// ---------------------------------------------------------------------------

function GroupsTab({ groups, setGroups }: { groups: Group[]; setGroups: React.Dispatch<React.SetStateAction<Group[]>> }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Group>(emptyGroup())

  function toggle(groupId: string, permission: Permission) {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g
        const has = g.permissions.includes(permission)
        return { ...g, permissions: has ? g.permissions.filter((p) => p !== permission) : [...g.permissions, permission] }
      }),
    )
  }

  function openNew() {
    setDraft(emptyGroup())
    setOpen(true)
  }

  function save() {
    setGroups((prev) => [...prev, draft])
    setOpen(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button icon={<Plus className="h-4 w-4" />} onClick={openNew}>
          New Role
        </Button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-surface-2">
              <tr>
                <th className="min-w-[220px] border-b border-border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  Permission
                </th>
                {groups.map((g) => (
                  <th key={g.id} className="min-w-[130px] border-b border-border px-3 py-2 text-left align-top">
                    <p className="text-sm font-semibold text-text">{g.name}</p>
                    <p className="text-[11px] font-normal normal-case text-muted">{g.description}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSION_MODULES.map((module) => (
                <Fragment key={module}>
                  <tr className="bg-surface-2/60">
                    <td colSpan={groups.length + 1} className="border-b border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
                      {module}
                    </td>
                  </tr>
                  {PERMISSION_CATALOG.filter((p) => p.module === module).map((perm) => (
                    <tr key={perm.key} className="hover:bg-surface-2">
                      <td className="border-b border-border px-3 py-2 pl-6 text-text">{perm.label}</td>
                      {groups.map((g) => (
                        <td key={g.id} className="border-b border-border px-3 py-2">
                          <button
                            type="button"
                            onClick={() => toggle(g.id, perm.key)}
                            className={cn(
                              'grid h-5 w-5 place-items-center rounded border',
                              g.permissions.includes(perm.key)
                                ? 'border-primary bg-primary text-primary-fg'
                                : 'border-border bg-surface text-transparent',
                            )}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="New Role"
        subtitle="Starts with no permissions - toggle them on in the matrix after saving"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Save</Button>
          </>
        }
      >
        <fieldset className="card grid grid-cols-1 gap-4 p-4">
          <legend className="mb-2 px-1 text-sm font-semibold text-primary">Role Details</legend>
          <FormField label="Name" required value={draft.name} onChange={(v) => setDraft({ ...draft, name: String(v) })} />
          <FormField label="Description" type="textarea" value={draft.description} onChange={(v) => setDraft({ ...draft, description: String(v) })} />
        </fieldset>
      </Drawer>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Access requests
// ---------------------------------------------------------------------------

function RequestsTab({
  requests,
  setRequests,
  groups,
  addUser,
}: {
  requests: AccessRequest[]
  setRequests: React.Dispatch<React.SetStateAction<AccessRequest[]>>
  groups: Group[]
  addUser: (user: User) => void
}) {
  const viewerGroupId = groups.find((g) => g.name.toLowerCase() === 'viewer')?.id ?? groups[groups.length - 1]?.id ?? ''

  async function setStatus(req: AccessRequest, status: AccessRequest['status']) {
    await updateAccessRequestStatus(req.id, status)
    setRequests((prev) => prev.map((r) => (r.id === req.id ? { ...r, status } : r)))
  }

  async function approveAndCreate(req: AccessRequest) {
    addUser({
      id: uniqueId('user'),
      userId: userIdFromEmail(req.email),
      name: req.name,
      email: req.email,
      groupId: viewerGroupId,
      status: 'invited',
      grants: [],
      revokes: [],
    })
    await setStatus(req, 'approved')
  }

  if (requests.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center gap-2 p-10 text-center">
        <Inbox className="h-8 w-8 text-muted" />
        <p className="text-sm font-medium text-text">No access requests</p>
        <p className="text-sm text-muted">Requests submitted from the Login page&apos;s &ldquo;Request access&rdquo; form appear here.</p>
      </div>
    )
  }

  const tone: Record<AccessRequest['status'], Tone> = { pending: 'warning', approved: 'success', rejected: 'danger' }

  return (
    <div className="card divide-y divide-border">
      {requests.map((req) => (
        <div key={req.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-text">{req.name}</p>
              <StatusChip value={req.status} tone={tone[req.status]} />
            </div>
            <p className="text-sm text-muted">{req.email}</p>
            {req.requestedRole && (
              <p className="text-sm text-muted">
                Requested role: <span className="text-text">{req.requestedRole}</span>
              </p>
            )}
            {req.note && <p className="mt-1 text-sm text-text">{req.note}</p>}
            <p className="mt-1 text-[11px] text-muted">{new Date(req.createdAt).toLocaleString()}</p>
          </div>
          {req.status === 'pending' && (
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" onClick={() => setStatus(req, 'rejected')}>
                Reject
              </Button>
              <Button onClick={() => approveAndCreate(req)}>Approve &amp; create user</Button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
