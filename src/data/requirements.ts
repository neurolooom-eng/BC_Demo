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
    id: 'pcs',
    feature: 'Process Check Sheet (QC FMT 038)',
    overview:
      'Daily process check sheet for a line: a day header, 30-minute time-slot readings across all three shifts, per-machine setup and Die-Temp readings, per-shift core-pin verification and sign-off, and once-a-day startup checks. Spec limits live in the Parameters master and drive out-of-spec highlighting and email alerts. The day prints as one sheet covering all shifts, matching the paper form.',
    requirements: [
      {
        id: 'REQ-PCS-01',
        title: 'Day sheet structure',
        priority: 'Must',
        description: 'One day sheet per Line per Date captures data at five cadences: Day header, Time-slot, Machine, Shift and Startup.',
        acceptanceCriteria: [
          'A day sheet holds the day header, machines, slot readings, per-shift core-pin and sign-off, and startup checks.',
          'Each field is captured at its defined cadence.',
        ],
      },
      {
        id: 'REQ-PCS-02',
        title: 'Half-hourly capture across three shifts',
        priority: 'Must',
        description: 'Time-slot readings are captured every 30 minutes across 1st, 2nd and 3rd shift.',
        acceptanceCriteria: [
          'Each shift exposes 30-minute slot columns.',
          'Line-level readings are captured per slot; Die Temp is captured per machine per slot.',
        ],
      },
      {
        id: 'REQ-PCS-03',
        title: 'Spec limits in the Parameters master',
        priority: 'Must',
        description: 'Every measurable parameter has min/max spec limits held in the Parameters master (Google Sheet tab).',
        acceptanceCriteria: [
          'Each parameter carries unit, min, max, cadence and appliesTo.',
          'Limits are editable without code changes.',
        ],
      },
      {
        id: 'REQ-PCS-04',
        title: 'Out-of-spec highlighting',
        priority: 'Must',
        description: 'Readings outside their spec range are highlighted red on screen and on the printout.',
        acceptanceCriteria: [
          'A value below min or above max renders red.',
          'A value within range renders normally.',
        ],
      },
      {
        id: 'REQ-PCS-05',
        title: 'Out-of-spec email alerts',
        priority: 'Should',
        description: 'An out-of-spec reading triggers an email to the configured recipients and is logged.',
        acceptanceCriteria: [
          'The backend exposes an alert action that emails active AlertRecipients filtered by scope and severity.',
          'Each alert is logged to the Alerts tab with value, limits and recipients.',
        ],
      },
      {
        id: 'REQ-PCS-06',
        title: 'Day printout (all shifts, one sheet)',
        priority: 'Must',
        description: 'The day sheet prints as a single landscape page per date reproducing QC FMT 038 Rev 10, covering all three shifts.',
        acceptanceCriteria: [
          'The printout shows the header, 30-minute grid for all shifts, machine sub-grid, core-pin block, startup and signatures.',
          'Out-of-spec cells print red.',
        ],
      },
      {
        id: 'REQ-PCS-07',
        title: 'Client-managed masters',
        priority: 'Should',
        description: 'Reference data and spec limits are held in Google Sheet master tabs so the client has full control.',
        acceptanceCriteria: [
          'Master tabs exist for lines, machines, furnaces, shifts, grades, alloys, gases, coatings, employees, parameters, alert recipients and field definitions (see docs/MASTERS.md).',
          'Every tab has an id column and documented headers.',
        ],
      },
      {
        id: 'REQ-PCS-08',
        title: 'Hourly readings as child records via a separate form',
        priority: 'Must',
        description: 'Hourly readings are captured one time slot at a time as standalone child records, not embedded in the day sheet, and are assembled into the print aligned by slot.',
        acceptanceCriteria: [
          'A dedicated Hourly Readings form captures a single shift + time slot per submission.',
          'Each submission is stored as its own child record (slot entry).',
          'Re-submitting the same shift+slot updates that slot rather than duplicating it.',
          'The day print assembles all captured child records into the grid, each aligned to its time-slot column.',
        ],
      },
      {
        id: 'REQ-PCS-09',
        title: 'Machine hourly readings',
        priority: 'Must',
        description: 'Each machine has its own hourly readings (e.g. Die Temp) captured per time slot.',
        acceptanceCriteria: [
          'The hourly form captures a per-machine value for each machine on the day.',
          'Machine hourly readings appear on the print in the machine row under the correct slot.',
        ],
      },
      {
        id: 'REQ-PCS-10',
        title: 'Theme-aware out-of-spec highlight',
        priority: 'Should',
        description: 'Out-of-spec values are highlighted with a red background and white text on light themes, and the contrary on dark themes; printing always uses the red-fill form.',
        acceptanceCriteria: [
          'On light themes an out-of-spec cell has a red background with white text.',
          'On dark themes the highlight inverts (light cell, red text).',
          'Printing forces the red background with white text regardless of theme.',
        ],
      },
      {
        id: 'REQ-PCS-11',
        title: 'Machines added mid-day with N/A back-fill',
        priority: 'Must',
        description: 'Machines can be added at any time slot during the day; each captures hourly readings from its start slot onward, and slots before it started print N/A.',
        acceptanceCriteria: [
          'A machine can be added at the selected shift + time slot (up to the machine limit).',
          'The hourly form only shows machines active at the selected slot for entry.',
          'On the day print, slots before a machine started show N/A for that machine; from its start slot onward they show readings.',
        ],
      },
      {
        id: 'REQ-PCS-12',
        title: 'Print from the check sheet',
        priority: 'Should',
        description: 'The day sheet can be previewed and printed from within the hourly entry page, not only the separate print page.',
        acceptanceCriteria: [
          'The hourly entry page offers a day-sheet preview and a Print action.',
          'Printing yields the same QC FMT 038 landscape sheet.',
        ],
      },
      {
        id: 'REQ-PCS-13',
        title: 'Stop a machine mid-day (fault) with N/A for remaining slots',
        priority: 'Must',
        description: 'A running machine can be stopped from a given time slot; from that slot onward it is not asked for on the hourly form and prints N/A for the rest of the day. A stopped machine can be reactivated.',
        acceptanceCriteria: [
          'Stopping a machine from a slot excludes it from the hourly form for that slot and all later slots.',
          'The day print shows N/A for the machine from its stop slot to the end of the day.',
          'Slots before the stop still show the readings that were captured.',
          'Reactivating a stopped machine makes it active again for subsequent slots.',
        ],
      },
    ],
  },
  {
    id: 'navigation',
    feature: 'Configurable Navigation',
    overview:
      'Sidebar sections (module groups) can be shown or hidden. Supply Chain and Finance are hidden by default. Developers configure visibility from the Developer Config page; hiding a section does not remove its routes.',
    requirements: [
      {
        id: 'REQ-NAV-01',
        title: 'Default hidden modules',
        priority: 'Must',
        description: 'Supply Chain and Finance are hidden from navigation by default.',
        acceptanceCriteria: [
          'With no saved preference, the sidebar does not list Supply Chain or Finance.',
          'Their routes remain defined and reachable by direct URL.',
        ],
      },
      {
        id: 'REQ-NAV-02',
        title: 'Developer-configurable visibility',
        priority: 'Must',
        description: 'A developer can show or hide any sidebar section from the Developer Config page.',
        acceptanceCriteria: [
          'The Developer Config page lists every sidebar section with a Visible/Hidden toggle.',
          'Toggling a section updates the sidebar immediately.',
          'The choice persists across reloads.',
          'The control is reachable only with the developer (config) permission.',
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
        description: 'The Requirement Document and UAT are accessible only to Developers, not to ordinary administrators.',
        acceptanceCriteria: [
          'The Requirements and UAT pages require the developer permission (dev:access).',
          'The Developer role holds dev:access; developer accounts (who are administrators) hold it as a per-user grant.',
          'An administrator without dev:access sees neither page in navigation nor when opening the routes directly.',
          'UAT cases reference requirement IDs.',
        ],
      },
    ],
  },
]
