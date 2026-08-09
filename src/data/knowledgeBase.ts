/**
 * Knowledge Base content.
 *
 * This is the single source of truth for the in-app **Knowledge Base** page
 * (src/pages/KnowledgeBase.tsx). Every feature we ship gets an article here
 * with plain-language user documentation and an FAQ - add a new `KbArticle`
 * object to this array when a feature lands (see CLAUDE.md "Documentation
 * convention"). Keep the language user-facing (no code, no internal names).
 */

export interface KbFaq {
  q: string
  a: string
}

export interface KbSection {
  heading: string
  /** One or more paragraphs. */
  body?: string[]
  /** Optional bullet list rendered under the paragraphs. */
  bullets?: string[]
  /** Optional ordered steps rendered as a numbered list. */
  steps?: string[]
}

export type KbAudience = 'All users' | 'Administrators' | 'Developers'

export interface KbArticle {
  id: string
  title: string
  category: string
  audience: KbAudience
  /** One-line description shown in the article list. */
  summary: string
  /** Last meaningful content update (YYYY-MM-DD). */
  updated: string
  sections: KbSection[]
  faqs: KbFaq[]
}

export const KB_ARTICLES: KbArticle[] = [
  {
    id: 'signing-in-and-access',
    title: 'Signing In & Access Management',
    category: 'Accounts & Security',
    audience: 'All users',
    summary: 'How to sign in, set or reset your password, request access, and how administrators create users and assign roles.',
    updated: '2026-08-08',
    sections: [
      {
        heading: 'Overview',
        body: [
          'Best Cast e-QMS is protected by a sign-in screen. Every person has an account with a unique User ID that an administrator creates for you. Once your account exists, you set your own password and sign in.',
          'What you can see and do inside the app depends on your Role (for example Quality Manager, Store Keeper, Accountant) plus any specific access your administrator has granted you individually.',
        ],
      },
      {
        heading: 'Signing in',
        steps: [
          'Open the app. You will land on the sign-in screen.',
          'Enter the User ID your administrator gave you (for example "vimal").',
          'Enter your password.',
          'Select "Sign in".',
        ],
        body: [
          'If your User ID and password are correct you go straight to the Dashboard. Your name and role appear at the top-right of every screen.',
        ],
      },
      {
        heading: 'Setting your password for the first time',
        body: [
          'When an administrator first creates your account it has no password yet - its status is "Invited". You set your own password before your first sign-in.',
        ],
        steps: [
          'On the sign-in screen, select "Set / Reset password".',
          'Enter your User ID and the email address your administrator registered for you.',
          'Choose a new password (at least 8 characters) and confirm it.',
          'Select "Save password & sign in" - you are signed in immediately.',
        ],
      },
      {
        heading: 'Resetting a forgotten password',
        body: [
          'Forgot your password? Use the same "Set / Reset password" link on the sign-in screen. Because it verifies both your User ID and your registered email, you can safely set a new password yourself without waiting for an administrator.',
        ],
      },
      {
        heading: 'Requesting access',
        body: [
          "Don't have an account yet? Select \"Request access\" on the sign-in screen and fill in your name, email, the role or department you need, and an optional note.",
          'Your request is sent to the administrators. Once they approve it and create your account, use "Set / Reset password" to set your password and sign in.',
        ],
      },
      {
        heading: 'Signing out',
        body: [
          'Select your name at the top-right of any screen, then "Sign out". You return to the sign-in screen. Your session stays active until you sign out, even if you close and reopen the app.',
        ],
      },
      {
        heading: 'For administrators: creating and managing users',
        body: ['Administrators manage everyone from Users & Access in the sidebar (visible only to the Administrator role).'],
        steps: [
          'Go to Users & Access → Users → New User.',
          'Enter the person\'s Name and Email. A User ID is suggested from the email - adjust it if you like; this is what they type to sign in.',
          'Set Status to "Invited" so they set their own password on first sign-in.',
          'Choose a Role, then optionally fine-tune Specific Access (see below).',
          'Select Save, then share the User ID with the person.',
        ],
      },
      {
        heading: 'Roles and Specific Access',
        body: [
          'A Role (also called a group) is a bundle of permissions - it decides which modules a person can view and what actions they can take. Assigning the right Role is usually all you need.',
          'Specific Access lets you tailor one person beyond their Role. In the New/Edit User screen, the permission checkboxes start matching the selected Role. Tick a box to grant an extra permission, or untick one to revoke a permission the Role would normally allow. Overrides are labelled "+grant" or "−revoke" so they are easy to spot, and the Users list shows how many overrides each person has.',
        ],
      },
      {
        heading: 'Handling access requests',
        body: [
          'Requests submitted from the "Request access" form appear under Users & Access → Requests, with a count badge when any are pending.',
          'For each request you can "Approve & create user" (which creates an Invited account you can then assign a role to) or "Reject". Approved users still set their own password from the sign-in screen.',
        ],
      },
      {
        heading: 'Where your credentials are stored',
        body: [
          'Passwords are never stored as plain text. They are protected with salted hashing - when the Google Sheet backend is connected the check happens on the server and the stored value never reaches your browser. In standalone demo mode (no backend connected) accounts and passwords are kept locally in your browser only.',
        ],
      },
    ],
    faqs: [
      {
        q: 'What is the difference between my User ID and my email?',
        a: 'Your User ID is the short handle you type to sign in (for example "vimal"). Your email is used to verify your identity when you set or reset your password. They are often similar but the User ID is what signs you in.',
      },
      {
        q: 'I was given an account but cannot sign in. What now?',
        a: 'New accounts start without a password (status "Invited"). Select "Set / Reset password" on the sign-in screen, verify your User ID and registered email, and choose a password. Then sign in.',
      },
      {
        q: 'I forgot my password.',
        a: 'Use "Set / Reset password" on the sign-in screen. It verifies your User ID and registered email and lets you set a new password yourself - no administrator needed.',
      },
      {
        q: 'The reset screen says my User ID and email do not match.',
        a: 'The email must match exactly the one your administrator registered on your account. Check for typos, and ask your administrator to confirm the email on file if it still fails.',
      },
      {
        q: 'Why is a menu or page missing for me?',
        a: 'You only see modules your Role (or specific access) allows. If you open a restricted page you will see an "Access restricted" message naming the permission you need. Ask an administrator to grant it via your Role or your Specific Access.',
      },
      {
        q: 'What are the password rules?',
        a: 'A password must be at least 8 characters. We recommend a mix of letters, numbers and symbols.',
      },
      {
        q: 'How do I get an account if I don\'t have one?',
        a: 'Select "Request access" on the sign-in screen and submit your details. An administrator will review the request and create your account.',
      },
      {
        q: 'Admin: how do I give someone one extra permission without changing their whole role?',
        a: 'Open the user in Users & Access → Users → Edit, and under Specific Access tick the individual permission. It is saved as a per-user grant on top of their role, shown as "+grant".',
      },
      {
        q: 'Admin: how do I stop someone signing in without deleting them?',
        a: 'Edit the user and set Status to "Disabled". Their account is kept but sign-in is blocked. Set it back to "Active" (or "Invited") to restore access.',
      },
    ],
  },
  {
    id: 'appearance-and-branding',
    title: 'Appearance & Branding',
    category: 'Getting Started',
    audience: 'All users',
    summary: 'Switching between light and dark themes, and the Best Cast logo used across the app.',
    updated: '2026-08-08',
    sections: [
      {
        heading: 'Choosing a theme',
        body: ['The app supports several light and dark colour themes. Go to Settings → Theme and pick one; your choice is remembered on this device.'],
      },
      {
        heading: 'The Best Cast logo',
        body: [
          'The Best Cast logo appears in the sidebar, on the sign-in screen and on printed documents such as Purchase Orders. It uses crisp vector (SVG) artwork, so it stays sharp at any size and on high-resolution screens.',
          'On dark themes the wordmark beside the logo mark is drawn as live text so it always stays readable.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Does my theme choice affect other users?',
        a: 'No. The theme is saved per device/browser and only changes what you see.',
      },
      {
        q: 'The logo looks blurry when I print. Why?',
        a: 'It should not - the logo is vector artwork. If a printout looks soft, check your printer/PDF scaling settings rather than the app.',
      },
    ],
  },
  {
    id: 'configurable-navigation',
    title: 'Showing & Hiding Modules',
    category: 'Administration',
    audience: 'Developers',
    summary: 'Which sidebar sections (modules) appear, and how a developer turns them on or off.',
    updated: '2026-08-08',
    sections: [
      {
        heading: 'Overview',
        body: [
          'The sidebar is organised into sections such as Quality Management, Production, Supply Chain and Finance. Sections can be shown or hidden so people only see the modules that are in use.',
          'Out of the box, Supply Chain and Finance are hidden. Hiding a section only removes it from the sidebar - the pages and their data are untouched and can still be reached by their direct link.',
        ],
      },
      {
        heading: 'Turning a section on or off (developers)',
        steps: [
          'Open Developer Config from the sidebar (available to developers).',
          'Find the "Navigation & Modules" card.',
          'Select a section to switch it between Visible and Hidden.',
        ],
        body: ['The sidebar updates immediately and your choice is remembered on this device.'],
      },
    ],
    faqs: [
      {
        q: 'Why don’t I see Supply Chain or Finance in the menu?',
        a: 'They are hidden by default. A developer can switch them back on from Developer Config → Navigation & Modules.',
      },
      {
        q: 'Does hiding a section delete anything?',
        a: 'No. Hiding only removes the section from the sidebar. The pages and data remain, and the section can be shown again at any time.',
      },
      {
        q: 'Is the show/hide choice shared with everyone?',
        a: 'The toggle is saved in the current browser. The shipped defaults (Supply Chain and Finance hidden) apply everywhere until a developer changes them.',
      },
    ],
  },
  {
    id: 'process-check-sheet-day',
    title: 'Process Check Sheet & Day Printout',
    category: 'Production',
    audience: 'All users',
    summary: 'How the daily Process Check Sheet is structured, how out-of-spec values are flagged, and how to print the day sheet with all shifts.',
    updated: '2026-08-09',
    sections: [
      {
        heading: 'Overview',
        body: [
          'The Process Check Sheet (form QC FMT 038) records melting, degassing, pouring and die parameters for a line across a whole day. One sheet covers all three shifts, with readings taken every 30 minutes.',
        ],
      },
      {
        heading: 'How the day is captured',
        bullets: [
          'Day header — set once: date, line, metal grade, degassing gas, furnace, alloys.',
          'Time-slot readings — every 30 minutes across all shifts (melting temp, coverall, pressure, flow, rotor RPM, gas checking, room temp, humidity, pouring temp, etc.).',
          'Machine entry — per machine: BC no, die coat thickness, pre-heat, cooling/pouring/tilting times, and a per-slot Die Temp reading.',
          'Shift close-out — per shift: core-pin cavity verification, operator and supervisor sign-off.',
          'Startup checks — once a day: die pre-heat, coatings, DPT, rejects at start, error-proofs.',
        ],
      },
      {
        heading: 'Capturing hourly readings',
        body: [
          'Hourly readings are entered on their own form (Production → Hourly Readings), one time slot at a time. Pick the shift and time slot, enter the line readings and each active machine’s reading, and save. Each save is a separate record that is appended to the day and slotted into the correct column on the print — so several people can record different slots and the day sheet assembles them at print time.',
          'Machines can be added as they start during the day. When you add a machine at, say, 10:00, it takes readings from 10:00 onward and every earlier slot shows N/A for it. You can preview and print the day sheet right from this page (“Day sheet & print”).',
        ],
      },
      {
        heading: 'Out-of-spec highlighting',
        body: [
          'Every measured parameter has a spec range. Any reading outside its range is highlighted: a red background with white text on light themes (and the inverse on dark themes), on screen and on the printout. With the backend connected an email alert is also sent to the configured recipients.',
        ],
      },
      {
        heading: 'Printing the day sheet',
        steps: [
          'Open Production → Day Check Sheet (Print).',
          'Review the sheet; out-of-spec cells are red.',
          'Select Print — the sheet prints as one landscape page per day, with all three shifts, matching the QC FMT 038 layout.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Why is a reading shown in red?',
        a: 'It is outside the parameter’s spec range (for example melting temp above 740°C). Red means out-of-spec, which also triggers an alert to the admin/QA.',
      },
      {
        q: 'Does one printout include all three shifts?',
        a: 'Yes. The day print is a single sheet per date covering 1st, 2nd and 3rd shift side by side, in 30-minute columns, exactly like the paper form.',
      },
      {
        q: 'Can the spec limits be changed?',
        a: 'Yes — the limits live in the Parameters master (a Google Sheet tab), so an administrator/developer can adjust them without code changes.',
      },
    ],
  },
]

export const KB_CATEGORIES = Array.from(new Set(KB_ARTICLES.map((a) => a.category)))
