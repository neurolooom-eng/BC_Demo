import type { User } from '../types/access'

/**
 * Seed users. `userId` is the login handle the admin hands out; `status`
 * drives the sign-in flow (see UserStatus). In the standalone demo (no
 * Google Sheets backend), the admin account below is pre-seeded with a
 * password by src/data/credentials.ts so you can sign in immediately;
 * everyone else starts "invited" and sets their own password from the
 * Login page. When a Sheets backend is configured, these are only the
 * fallback rows until the Users tab loads.
 */
export const USERS: User[] = [
  { id: 'user-vikensh', userId: 'vikensh', name: 'Vikensh R', email: 'vikensh@bestcastgroup.com', groupId: 'group-admin', status: 'active' },
  { id: 'user-dev', userId: 'devops', name: 'Dev Ops', email: 'devops@bestcastgroup.com', groupId: 'group-developer', status: 'invited' },
  { id: 'user-qhead', userId: 'quality.head', name: 'Quality Head', email: 'quality.head@bestcastgroup.com', groupId: 'group-quality-manager', status: 'invited' },
  { id: 'user-vimal', userId: 'vimal', name: 'Vimal', email: 'vimal@bestcastgroup.com', groupId: 'group-shift-supervisor', status: 'invited' },
  { id: 'user-bharathi', userId: 'bharathi', name: 'Bharathi', email: 'bharathi@bestcastgroup.com', groupId: 'group-shift-supervisor', status: 'invited' },
  { id: 'user-mohan', userId: 'mohan', name: 'Mohan', email: 'mohan@bestcastgroup.com', groupId: 'group-shift-supervisor', status: 'invited' },
  { id: 'user-naveen', userId: 'naveen', name: 'Naveen', email: 'naveen@bestcastgroup.com', groupId: 'group-shift-supervisor', status: 'invited' },
  { id: 'user-ashok', userId: 'ashok', name: 'Ashok', email: 'ashok@bestcastgroup.com', groupId: 'group-shift-supervisor', status: 'invited' },
  { id: 'user-ravi', userId: 'ravi.kumar', name: 'Ravi Kumar', email: 'ravi.kumar@bestcastgroup.com', groupId: 'group-operator', status: 'invited' },
  { id: 'user-suresh-p', userId: 'suresh.kumar', name: 'Suresh Kumar', email: 'suresh.kumar@bestcastgroup.com', groupId: 'group-purchase-officer', status: 'invited' },
  { id: 'user-ganesh', userId: 'ganesh', name: 'Ganesh', email: 'ganesh@bestcastgroup.com', groupId: 'group-store-keeper', status: 'invited' },
  { id: 'user-lakshmi', userId: 'lakshmi', name: 'Lakshmi', email: 'lakshmi@bestcastgroup.com', groupId: 'group-accountant', status: 'invited' },
  { id: 'user-auditor', userId: 'auditor', name: 'External Auditor', email: 'auditor@bestcastgroup.com', groupId: 'group-viewer', status: 'invited' },
  // Developers are Administrators by default (full access, incl. Requirements & UAT).
  // These accounts set their own password from the Login page (verified by email).
  { id: 'user-neuroloom', userId: 'neurolooom', name: 'NeuroLooom (Developer)', email: 'neurolooom@gmail.com', groupId: 'group-admin', status: 'invited' },
  // NOTE: dev@bcit.com is a temporary developer address and is expected to
  // change - update the email/User ID here or via Admin > Users when it does.
  { id: 'user-bcit-dev', userId: 'dev', name: 'BCIT Developer', email: 'dev@bcit.com', groupId: 'group-admin', status: 'invited' },
]

/** userId of the demo admin that ships with a pre-seeded password (demo mode only). */
export const DEMO_ADMIN_USER_ID = 'vikensh'
/** The pre-seeded password for DEMO_ADMIN_USER_ID in standalone demo mode. */
export const DEMO_ADMIN_PASSWORD = 'BestCast@123'
