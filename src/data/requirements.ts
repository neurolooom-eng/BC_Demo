/**
 * Requirement Document (developer-facing).
 *
 * Living specification of what each feature must do, with testable acceptance
 * criteria. Rendered by src/pages/Requirements.tsx (gated to Developers). Add
 * a RequirementFeature block whenever a feature is built or changed, keeping
 * IDs stable so the UAT suite (src/data/uat.ts) can reference them.
 */

export type Priority = 'Must' | 'Should' | 'Could'

export interface Requirement {
  /** Stable ID, e.g. REQ-AUTH-01. Referenced by UAT cases. */
  id: string
  title: string
  priority: Priority
  description: string
  acceptanceCriteria: string[]
}

export interface RequirementFeature {
  id: string
  feature: string
  overview: string
  requirements: Requirement[]
}

export const REQUIREMENTS_META = {
  product: 'Best Cast e-QMS',
  documentTitle: 'Software Requirements Specification',
  version: '0.1',
  updated: '2026-08-08',
  status: 'Draft',
}

export const REQUIREMENTS: RequirementFeature[] = [
  {
    id: 'auth',
    feature: 'Authentication & Access Management',
    overview:
      'Users sign in with an admin-issued User ID and a self-set password. Access to modules and actions is governed by a Role plus optional per-user permission overrides. Credentials are stored in Google Sheets (moving to Supabase later) and never in plain text.',
    requirements: [
      {
        id: 'REQ-AUTH-01',
        title: 'Sign-in gate',
        priority: 'Must',
        description: 'The application must not expose any module until the user has authenticated.',
        acceptanceCriteria: [
          'Visiting any route while unauthenticated shows the Login page, not application content.',
          'A successful sign-in reveals the app shell and lands on the Dashboard.',
          'The session persists across a page reload until the user signs out.',
        ],
      },
      {
        id: 'REQ-AUTH-02',
        title: 'Sign in with User ID and password',
        priority: 'Must',
        description: 'A user with an active account signs in with their User ID and password.',
        acceptanceCriteria: [
          'Correct User ID + password authenticates the user.',
          'An unknown User ID, a wrong password, and a disabled account each show a distinct, non-revealing error message.',
          'User ID matching is case-insensitive.',
        ],
      },
      {
        id: 'REQ-AUTH-03',
        title: 'First-time password set for invited users',
        priority: 'Must',
        description: 'An admin-created account starts as "Invited" with no password; the user sets their own before first sign-in.',
        acceptanceCriteria: [
          'An invited user can set a password after verifying User ID + registered email.',
          'On success the account becomes Active and the user is signed in.',
          'Sign-in is refused for an invited account until a password is set.',
        ],
      },
      {
        id: 'REQ-AUTH-04',
        title: 'Self-service password reset',
        priority: 'Must',
        description: 'A user can reset a forgotten password without administrator intervention.',
        acceptanceCriteria: [
          'Reset requires a matching User ID and registered email.',
          'A new password takes effect immediately for subsequent sign-in.',
          'A mismatched User ID/email pair is rejected with a clear message.',
        ],
      },
      {
        id: 'REQ-AUTH-05',
        title: 'Password policy and storage',
        priority: 'Must',
        description: 'Passwords must meet a minimum strength and never be stored in plain text.',
        acceptanceCriteria: [
          'Passwords shorter than 8 characters are rejected at set/reset time.',
          'Set and confirm fields must match.',
          'Stored credentials are salted-hashed; with the Sheets backend the hash is verified server-side and is never returned by data reads.',
        ],
      },
      {
        id: 'REQ-AUTH-06',
        title: 'Request access',
        priority: 'Should',
        description: 'A person without an account can request one from the Login page.',
        acceptanceCriteria: [
          'The form captures name, email, requested role and an optional note.',
          'A submitted request is stored with status "pending" and confirmation is shown.',
          'Name and email are required.',
        ],
      },
      {
        id: 'REQ-AUTH-07',
        title: 'Role-based access control',
        priority: 'Must',
        description: 'Each user has a Role (group) whose permissions determine visible modules and allowed actions.',
        acceptanceCriteria: [
          'Navigation only shows modules the user is permitted to view.',
          'Opening a route the user lacks permission for shows an "Access restricted" message naming the permission.',
          'Changing a role’s permissions updates access live across the app.',
        ],
      },
      {
        id: 'REQ-AUTH-08',
        title: 'Per-user specific access overrides',
        priority: 'Should',
        description: 'An administrator can grant or revoke individual permissions for one user on top of their role.',
        acceptanceCriteria: [
          'A permission not in the role can be granted to a single user.',
          'A permission in the role can be revoked from a single user.',
          'The effective permission is (role ∪ grants) − revokes.',
        ],
      },
      {
        id: 'REQ-AUTH-09',
        title: 'Admin user management',
        priority: 'Must',
        description: 'Administrators create and edit users, assign roles and set account status.',
        acceptanceCriteria: [
          'An admin can create a user with Name, Email, User ID, Status and Role.',
          'User ID defaults from the email but is editable.',
          'Status supports Invited, Active and Disabled, and Disabled blocks sign-in.',
        ],
      },
      {
        id: 'REQ-AUTH-10',
        title: 'Access request handling',
        priority: 'Should',
        description: 'Administrators review pending access requests and act on them.',
        acceptanceCriteria: [
          'Pending requests are listed with a count indicator.',
          'Approving a request creates an Invited user from its details.',
          'A request can be rejected, and its status reflects the outcome.',
        ],
      },
      {
        id: 'REQ-AUTH-11',
        title: 'Sign out',
        priority: 'Must',
        description: 'A signed-in user can end their session.',
        acceptanceCriteria: [
          'Sign out returns the user to the Login page.',
          'After sign out, application content is not reachable without signing in again.',
        ],
      },
    ],
  },
  {
    id: 'docs',
    feature: 'Documentation (Knowledge Base, Requirements, UAT)',
    overview:
      'Every feature is documented for end users (Knowledge Base + FAQ, visible to all) and for the delivery team (Requirement Document and UAT, visible only to Developers).',
    requirements: [
      {
        id: 'REQ-DOC-01',
        title: 'In-app Knowledge Base',
        priority: 'Must',
        description: 'A Knowledge Base page provides searchable user documentation and FAQs for each feature.',
        acceptanceCriteria: [
          'All authenticated users can open the Knowledge Base.',
          'Articles are grouped by category and are searchable.',
          'Each article can carry an FAQ section.',
        ],
      },
      {
        id: 'REQ-DOC-02',
        title: 'Developer-only Requirements and UAT',
        priority: 'Must',
        description: 'The Requirement Document and UAT are accessible only to Developers.',
        acceptanceCriteria: [
          'The Requirements and UAT pages require the developer (config) permission.',
          'Non-developer roles do not see these pages in navigation and cannot open them directly.',
          'UAT cases reference requirement IDs.',
        ],
      },
    ],
  },
]
