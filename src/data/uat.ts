/**
 * User Acceptance Test (UAT) suite (developer-facing).
 *
 * Manual acceptance test cases mapped to requirement IDs (src/data/requirements.ts).
 * Rendered by src/pages/Uat.tsx (gated to Developers), where a tester can mark
 * each case Pass/Fail/Not run (kept in the browser) and print the sheet. Add a
 * UatFeature block for every feature and keep case IDs stable.
 */

export interface UatCase {
  /** Stable ID, e.g. UAT-AUTH-01. */
  id: string
  /** Requirement ID this case verifies (see src/data/requirements.ts). */
  requirement: string
  title: string
  preconditions?: string
  steps: string[]
  expected: string
}

export interface UatFeature {
  id: string
  feature: string
  cases: UatCase[]
}

export const UAT_META = {
  product: 'Best Cast e-QMS',
  documentTitle: 'User Acceptance Test Plan',
  version: '0.1',
  updated: '2026-08-08',
}

export const UAT_SUITES: UatFeature[] = [
  {
    id: 'auth',
    feature: 'Authentication & Access Management',
    cases: [
      {
        id: 'UAT-AUTH-01',
        requirement: 'REQ-AUTH-01',
        title: 'App is gated behind sign-in',
        preconditions: 'Signed out.',
        steps: ['Open the application URL.', 'Attempt to open a module route directly (e.g. add #/documents to the URL).'],
        expected: 'The Login page is shown; no module content is visible until sign-in.',
      },
      {
        id: 'UAT-AUTH-02',
        requirement: 'REQ-AUTH-02',
        title: 'Successful sign-in',
        preconditions: 'An active account exists (demo: vikensh / BestCast@123).',
        steps: ['Enter a valid User ID and password.', 'Select Sign in.'],
        expected: 'User is authenticated and lands on the Dashboard; name and role show top-right.',
      },
      {
        id: 'UAT-AUTH-03',
        requirement: 'REQ-AUTH-02',
        title: 'Wrong password rejected',
        steps: ['Enter a valid User ID with an incorrect password.', 'Select Sign in.'],
        expected: 'An "Incorrect User ID or password" message is shown; user is not signed in.',
      },
      {
        id: 'UAT-AUTH-04',
        requirement: 'REQ-AUTH-03',
        title: 'Invited user sets first password',
        preconditions: 'An Invited account exists with a known registered email.',
        steps: [
          'On the Login page choose "Set / Reset password".',
          'Enter the User ID and registered email.',
          'Enter a new password (8+ chars) and confirm it.',
          'Submit.',
        ],
        expected: 'Password is saved, the account becomes Active, and the user is signed in.',
      },
      {
        id: 'UAT-AUTH-05',
        requirement: 'REQ-AUTH-04',
        title: 'Self-service password reset',
        preconditions: 'An active account with known registered email.',
        steps: ['Choose "Set / Reset password".', 'Verify User ID + email.', 'Set a new password and submit.', 'Sign out, then sign in with the new password.'],
        expected: 'Sign-in succeeds with the new password.',
      },
      {
        id: 'UAT-AUTH-06',
        requirement: 'REQ-AUTH-05',
        title: 'Password policy enforced',
        steps: ['In Set / Reset password, enter a password shorter than 8 characters, or mismatched confirm.', 'Submit.'],
        expected: 'A validation message is shown and the password is not changed.',
      },
      {
        id: 'UAT-AUTH-07',
        requirement: 'REQ-AUTH-06',
        title: 'Request access is captured',
        steps: ['On the Login page choose "Request access".', 'Fill in name, email, requested role and submit.'],
        expected: 'A confirmation is shown and the request appears under Admin → Users & Access → Requests as pending.',
      },
      {
        id: 'UAT-AUTH-08',
        requirement: 'REQ-AUTH-07',
        title: 'Restricted navigation and pages',
        preconditions: 'Signed in as a role without Purchase access.',
        steps: ['Inspect the sidebar.', 'Attempt to open the Purchase route directly.'],
        expected: 'Purchase is absent from the sidebar and the route shows "Access restricted" naming the permission.',
      },
      {
        id: 'UAT-AUTH-09',
        requirement: 'REQ-AUTH-08',
        title: 'Per-user grant override',
        preconditions: 'Signed in as an administrator.',
        steps: [
          'Open Users & Access → Users → Edit a user.',
          'Under Specific Access, tick a permission the role does not include (shows "+grant").',
          'Save and sign in as that user.',
        ],
        expected: 'The user now has access to the granted permission in addition to their role.',
      },
      {
        id: 'UAT-AUTH-10',
        requirement: 'REQ-AUTH-09',
        title: 'Create a new user',
        preconditions: 'Signed in as an administrator.',
        steps: ['Users & Access → Users → New User.', 'Enter name and email; confirm the suggested User ID.', 'Set Status = Invited, pick a Role, Save.'],
        expected: 'The user appears in the list with the correct User ID, role and Invited status.',
      },
      {
        id: 'UAT-AUTH-11',
        requirement: 'REQ-AUTH-09',
        title: 'Disabled account cannot sign in',
        preconditions: 'Signed in as an administrator.',
        steps: ['Edit a user and set Status = Disabled, Save.', 'Sign out and attempt to sign in as that user.'],
        expected: 'Sign-in is refused with an "account disabled" message.',
      },
      {
        id: 'UAT-AUTH-12',
        requirement: 'REQ-AUTH-10',
        title: 'Approve an access request',
        preconditions: 'A pending access request exists; signed in as administrator.',
        steps: ['Open Users & Access → Requests.', 'Select "Approve & create user" on a pending request.'],
        expected: 'An Invited user is created from the request details and the request is marked approved.',
      },
      {
        id: 'UAT-AUTH-13',
        requirement: 'REQ-AUTH-11',
        title: 'Sign out ends the session',
        steps: ['While signed in, open the account menu top-right.', 'Select Sign out.', 'Attempt to reopen a module route.'],
        expected: 'User returns to the Login page and cannot reach module content without signing in again.',
      },
    ],
  },
  {
    id: 'navigation',
    feature: 'Configurable Navigation',
    cases: [
      {
        id: 'UAT-NAV-01',
        requirement: 'REQ-NAV-01',
        title: 'Supply Chain and Finance hidden by default',
        preconditions: 'A browser with no saved navigation preference; signed in.',
        steps: ['Inspect the sidebar sections.'],
        expected: 'Neither Supply Chain nor Finance appears in the sidebar.',
      },
      {
        id: 'UAT-NAV-02',
        requirement: 'REQ-NAV-02',
        title: 'Developer toggles a section on',
        preconditions: 'Signed in as a developer/administrator.',
        steps: ['Open Developer Config.', 'In "Navigation & Modules", set Supply Chain to Visible.', 'Observe the sidebar, then reload the page.'],
        expected: 'Supply Chain appears in the sidebar immediately and remains visible after reload.',
      },
      {
        id: 'UAT-NAV-03',
        requirement: 'REQ-NAV-01',
        title: 'Hidden module still reachable by URL',
        preconditions: 'Finance hidden; signed in with Accounts access.',
        steps: ['Navigate directly to #/accounts.'],
        expected: 'The Accounts page loads; hiding only affects the sidebar, not the routes.',
      },
    ],
  },
  {
    id: 'docs',
    feature: 'Documentation',
    cases: [
      {
        id: 'UAT-DOC-01',
        requirement: 'REQ-DOC-01',
        title: 'Knowledge Base is available to all users',
        steps: ['Sign in as any role.', 'Open Knowledge Base from the sidebar.', 'Search for a term and open an article.'],
        expected: 'The Knowledge Base opens, search filters articles, and articles show content and FAQs.',
      },
      {
        id: 'UAT-DOC-02',
        requirement: 'REQ-DOC-02',
        title: 'Requirements and UAT are developer-only',
        preconditions: 'An ordinary administrator without dev:access (e.g. the demo admin) and a developer account are both available.',
        steps: ['Sign in as the ordinary administrator.', 'Look for Requirements and UAT in the sidebar and open #/requirements directly.', 'Sign out, sign in as a developer, and repeat.'],
        expected: 'The administrator sees neither page in the sidebar and gets "Access restricted" on the route; the developer sees both and can open them.',
      },
    ],
  },
]
