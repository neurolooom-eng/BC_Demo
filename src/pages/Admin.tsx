import { Check, Plus, ShieldCheck } from 'lucide-react'
import { Fragment, useState } from 'react'
import { Button } from '../components/ui/Button'
import { DataTable, type DataColumn } from '../components/ui/DataTable'
import { Drawer } from '../components/ui/Drawer'
import { FormField, type SelectOption } from '../components/ui/FormField'
import { StatusChip } from '../components/ui/StatusChip'
import { useAccess } from '../context/AccessContext'
import { cn } from '../lib/cn'
import { nextId } from '../lib/id'
import { PERMISSION_CATALOG, PERMISSION_MODULES } from '../lib/permissions'
import type { Group, Permission, User } from '../types/access'

function emptyUser(defaultGroupId: string): User {
  return { id: nextId('user'), name: '', email: '', groupId: defaultGroupId }
}

function emptyGroup(): Group {
  return { id: nextId('group'), name: '', description: '', permissions: [] }
}

export function Admin() {
  const { users, setUsers, groups, setGroups } = useAccess()
  const [tab, setTab] = useState<'users' | 'groups'>('users')

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text">Users & Access</h1>
          <p className="text-sm text-muted">
            Manage who can sign in and what each group can see or do. Group permissions apply live across the app.
          </p>
        </div>
      </div>

      <div className="inline-flex rounded-md border border-border bg-surface p-1">
        <button
          type="button"
          onClick={() => setTab('users')}
          className={cn('rounded px-3 py-1.5 text-sm font-medium', tab === 'users' ? 'bg-primary/12 text-primary' : 'text-muted hover:text-text')}
        >
          Users
        </button>
        <button
          type="button"
          onClick={() => setTab('groups')}
          className={cn('rounded px-3 py-1.5 text-sm font-medium', tab === 'groups' ? 'bg-primary/12 text-primary' : 'text-muted hover:text-text')}
        >
          Groups & Permissions
        </button>
      </div>

      {tab === 'users' ? (
        <UsersTab users={users} setUsers={setUsers} groups={groups} />
      ) : (
        <GroupsTab groups={groups} setGroups={setGroups} />
      )}
    </div>
  )
}

function UsersTab({
  users,
  setUsers,
  groups,
}: {
  users: User[]
  setUsers: React.Dispatch<React.SetStateAction<User[]>>
  groups: Group[]
}) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<User>(emptyUser(groups[groups.length - 1]?.id ?? ''))
  const [editingId, setEditingId] = useState<string | null>(null)

  const groupOptions: SelectOption[] = groups.map((g) => ({ value: g.id, label: g.name }))

  function openNew() {
    setDraft(emptyUser(groups[groups.length - 1]?.id ?? ''))
    setEditingId(null)
    setOpen(true)
  }

  function openEdit(user: User) {
    setDraft(user)
    setEditingId(user.id)
    setOpen(true)
  }

  function save() {
    if (editingId) {
      setUsers((prev) => prev.map((u) => (u.id === editingId ? draft : u)))
    } else {
      setUsers((prev) => [draft, ...prev])
    }
    setOpen(false)
  }

  const columns: DataColumn<User>[] = [
    { key: 'name', header: 'Name', width: 180 },
    { key: 'email', header: 'Email', width: 240 },
    {
      key: 'group',
      header: 'Group',
      width: 180,
      accessor: (u) => groups.find((g) => g.id === u.groupId)?.name ?? '—',
      render: (u) => <StatusChip value={groups.find((g) => g.id === u.groupId)?.name} tone="primary" />,
    },
    {
      key: 'edit',
      header: '',
      width: 80,
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
          <legend className="mb-2 px-1 text-sm font-semibold text-primary">User Details</legend>
          <FormField label="Name" required value={draft.name} onChange={(v) => setDraft({ ...draft, name: String(v) })} />
          <FormField label="Email" type="email" required value={draft.email} onChange={(v) => setDraft({ ...draft, email: String(v) })} />
          <FormField label="Group" type="select" required span={2} value={draft.groupId} options={groupOptions} onChange={(v) => setDraft({ ...draft, groupId: String(v) })} />
        </fieldset>
      </Drawer>
    </div>
  )
}

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
          New Group
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
        title="New Group"
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
          <legend className="mb-2 px-1 text-sm font-semibold text-primary">Group Details</legend>
          <FormField label="Name" required value={draft.name} onChange={(v) => setDraft({ ...draft, name: String(v) })} />
          <FormField label="Description" type="textarea" value={draft.description} onChange={(v) => setDraft({ ...draft, description: String(v) })} />
        </fieldset>
      </Drawer>
    </div>
  )
}
