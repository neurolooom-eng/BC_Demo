export type Permission =
  | 'dashboard:view'
  | 'documents:view'
  | 'documents:create'
  | 'documents:edit'
  | 'specifications:view'
  | 'specifications:edit'
  | 'checksheets:view'
  | 'checksheets:create'
  | 'checksheets:edit'
  | 'checksheets:approve'
  | 'purchase:view'
  | 'purchase:create'
  | 'purchase:edit'
  | 'stores:view'
  | 'stores:create'
  | 'stores:edit'
  | 'accounts:view'
  | 'accounts:create'
  | 'accounts:edit'
  | 'ledgers:view'
  | 'ledgers:create'
  | 'ledgers:edit'
  | 'admin:access'
  | 'config:access'
  | 'dev:access'

export interface Group {
  id: string
  name: string
  description: string
  permissions: Permission[]
}

/**
 * Account lifecycle:
 *  - invited: admin created the account, no password set yet. The user must
 *    set one via the Login page's "Set / Reset password" flow before they
 *    can sign in.
 *  - active: has a password and may sign in.
 *  - disabled: account exists but sign-in is blocked.
 */
export type UserStatus = 'invited' | 'active' | 'disabled'

export interface User {
  id: string
  /** Login handle created by the admin (what the user types on the Login page). */
  userId: string
  name: string
  email: string
  groupId: string
  status: UserStatus
  /** Per-user permissions granted on top of the group's ("Specific Access"). */
  grants?: Permission[]
  /** Per-user permissions revoked from the group's, even if the group has them. */
  revokes?: Permission[]
}

/** A "Request for Access" submitted from the Login page, actioned by an admin. */
export interface AccessRequest {
  id: string
  name: string
  email: string
  /** Free-text role/department the requester is asking for. */
  requestedRole: string
  note: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}
