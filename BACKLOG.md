# Backlog

Developer-facing backlog of follow-ups and open questions. Newest first.

## Open

- **Seed developer/admin accounts into the live `Users` sheet.** The developer
  accounts (`neurolooom@gmail.com`, `dev@bcit.com`) and other seeded users are
  defined in `src/data/users.ts` for the standalone demo. When the Google Sheets
  backend is connected, those rows must also exist in the `Users` tab (with a
  `passwordHash`/`passwordSalt` set via the Login page) for those people to sign
  in against the live backend. Decide whether to document this as a manual setup
  step or add a one-time bootstrap/import.
  _(Raised 2026-08-08.)_

- **`dev@bcit.com` is temporary.** This developer address is expected to change.
  Update it in `src/data/users.ts` (and the live `Users` tab) or via
  Admin → Users when the real address is known.

## Done

- Hide Supply Chain & Finance from navigation by default, developer-configurable
  from the Developer Config page. _(2026-08-08)_
