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
    id: 'pcs',
    feature: 'Process Check Sheet (QC FMT 038)',
    cases: [
      {
        id: 'UAT-PCS-01',
        requirement: 'REQ-PCS-06',
        title: 'Day print enforces the master template (all shifts, 47 columns)',
        preconditions: 'Signed in with check-sheet access.',
        steps: ['Open Production → Day Check Sheet (Print).', 'Inspect the reading grid header and row labels against the master template.'],
        expected: 'One sheet shows 1ST/2ND/3RD SHIFT with 16/15/16 = 47 slot columns and template row labels (e.g. Holding Furnace Metal Temperature 730°C ~ 750°C).',
      },
      {
        id: 'UAT-PCS-02',
        requirement: 'REQ-PCS-04',
        title: 'Out-of-spec readings are red',
        steps: ['On the Day Check Sheet, find a value outside its spec (e.g. melting temp 745 vs 720–740).'],
        expected: 'The out-of-spec value renders red; in-range values render normally. The out-of-spec summary lists them.',
      },
      {
        id: 'UAT-PCS-03',
        requirement: 'REQ-PCS-01',
        title: 'All sections present',
        steps: ['Scroll the Day Check Sheet.'],
        expected: 'Header, slot-reading grid, machine sub-grid with Die Temp, per-shift core-pin block, startup block and signatures are all shown.',
      },
      {
        id: 'UAT-PCS-04',
        requirement: 'REQ-PCS-06',
        title: 'Printing yields a landscape day sheet',
        steps: ['Select Print.', 'Review the print preview.'],
        expected: 'Only the check sheet prints, in landscape, reproducing the QC FMT 038 layout with out-of-spec cells red.',
      },
      {
        id: 'UAT-PCS-05',
        requirement: 'REQ-PCS-03',
        title: 'Spec limits come from the Parameters master',
        preconditions: 'Backend connected with a Parameters tab.',
        steps: ['Change a parameter’s min/max in the Parameters tab.', 'Reload the Day Check Sheet.'],
        expected: 'Highlighting reflects the new limits without any code change.',
      },
      {
        id: 'UAT-PCS-06',
        requirement: 'REQ-PCS-08',
        title: 'Hourly reading appends to the print, aligned by slot',
        steps: [
          'Open Production → Hourly Readings.',
          'Pick a shift and time slot, enter values (incl. a machine value), and Save.',
          'Open the Day Check Sheet.',
        ],
        expected: 'The saved values appear on the print under the matching shift/time-slot column, both line and machine rows.',
      },
      {
        id: 'UAT-PCS-07',
        requirement: 'REQ-PCS-08',
        title: 'Re-entering a slot updates it',
        steps: ['In Hourly Readings, save a slot, then select the same shift+slot, change a value and Save again.'],
        expected: 'The captured-slots list does not duplicate the slot; the print shows the updated value.',
      },
      {
        id: 'UAT-PCS-08',
        requirement: 'REQ-PCS-10',
        title: 'Out-of-spec highlight adapts to theme',
        steps: ['View an out-of-spec cell on a light theme.', 'Switch to a dark theme (Settings → Theme).'],
        expected: 'Light theme shows red background/white text; dark theme shows the inverted highlight; printing uses red background/white text.',
      },
      {
        id: 'UAT-PCS-09',
        requirement: 'REQ-PCS-11',
        title: 'Add a machine mid-day and see N/A back-fill',
        steps: [
          'In Hourly Readings, select a slot (e.g. 10:00) and add a new machine.',
          'Open the day sheet / print.',
        ],
        expected: 'The new machine shows readings from 10:00 onward and N/A for every slot before 10:00. Earlier slots on the form do not show the new machine for entry.',
      },
      {
        id: 'UAT-PCS-10',
        requirement: 'REQ-PCS-12',
        title: 'Print from the hourly entry page',
        steps: ['On Hourly Readings, select “Day sheet & print”.', 'Choose Print.'],
        expected: 'A day-sheet preview appears in place and prints as the QC FMT 038 landscape sheet.',
      },
      {
        id: 'UAT-PCS-11',
        requirement: 'REQ-PCS-13',
        title: 'Stop a machine mid-day; remaining slots are N/A',
        steps: [
          'In Hourly Readings, select a slot (e.g. 13:00) and under Machines press “Stop from 13:00” for a running machine.',
          'Select an earlier slot (e.g. 12:30) and a later slot (e.g. 13:30) and check the machine list for entry.',
          'Open the day sheet / print.',
        ],
        expected:
          'The machine is not asked for from 13:00 onward (still present at 12:30). The print shows its readings up to 12:30 and N/A from 13:00 to end of day. Reactivate restores it.',
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
