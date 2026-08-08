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

export interface Group {
  id: string
  name: string
  description: string
  permissions: Permission[]
}

export interface User {
  id: string
  name: string
  email: string
  groupId: string
}
