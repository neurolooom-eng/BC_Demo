# Best Cast e-QMS — project conventions

Vite + React + TypeScript + Tailwind SPA. Data goes through a Google Sheets
backend (Apps Script in `google-apps-script/Code.gs`) via `src/data/repository.ts`,
falling back to bundled mock data when no backend is configured. Auth/session and
permissions live in `src/context/AccessContext.tsx`.

## Documentation convention (required for every feature)

Whenever a feature is built or changed, update **all three** documentation
surfaces in the same change, so docs never drift from the app:

1. **Knowledge Base + FAQ** — user-facing, visible to all signed-in users.
   Add or update a `KbArticle` in `src/data/knowledgeBase.ts` (plain language,
   no internal names), including an FAQ. Rendered at `/knowledge-base`.
2. **Requirement Document** — developer-only. Add/update a `RequirementFeature`
   in `src/data/requirements.ts` with testable acceptance criteria and stable
   `REQ-*` IDs. Rendered at `/requirements` (gated by `config:access`).
3. **UAT plan** — developer-only. Add/update a `UatFeature` in `src/data/uat.ts`
   with `UAT-*` cases that reference the `REQ-*` IDs. Rendered at `/uat`
   (gated by `config:access`).

Keep requirement and UAT IDs stable across changes so the cross-references hold.

## Access model

- Access is by **Role** (a `Group` with a `Permission[]`) plus optional
  **per-user overrides** (`grants`/`revokes` on `User`). Effective access is
  `(role ∪ grants) − revokes` (see `hasPermission` in `AccessContext`).
- Gate a route by wrapping its element in `<RequirePermission permission="…">`.
  Developer-only pages use `config:access`; admin pages use `admin:access`.
- **Developers are Administrators by default** (`group-admin`), which includes
  `config:access`, so they can see the developer-only docs. Developer accounts
  are seeded in `src/data/users.ts`.

## Conventions

- Add a page: create `src/pages/X.tsx`, register the route in `src/App.tsx`,
  and add a nav entry in `src/components/layout/nav.ts` (omit `permission` to
  show it to everyone).
- Reference public assets through `assetUrl()` (the app may be served from a
  sub-path on GitHub Pages).
- Before finishing: `npm run build` (tsc + vite) and `npm run lint` must pass.
