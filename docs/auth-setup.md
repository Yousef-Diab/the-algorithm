# Neon Auth setup (managed Better Auth)

The app uses Neon Auth's **managed Better Auth** SDK (`@neondatabase/auth` +
`@neondatabase/auth-ui`). Legacy Stack Auth (`@stackframe/stack`) is **not**
used — see <https://neon.com/docs/auth/migrate/from-legacy-auth>.

Until the two env vars below are set the app runs **local-only**: lessons are
public, progress/quiz persist in `localStorage`, notes are disabled.

## Environment variables (`.env`)

```dotenv
NEON_AUTH_BASE_URL=        # your project's auth endpoint, from the Neon console
NEON_AUTH_COOKIE_SECRET=   # any random string >= 32 chars (already generated)
```

- **`NEON_AUTH_BASE_URL`** — Neon Console → your project → **Auth** tab. The
  managed Better Auth setup shows a base URL like
  `https://ep-xxx.neonauth.<region>.aws.neon.tech/neondb/auth`.
- **`NEON_AUTH_COOKIE_SECRET`** — signs the session cache cookie. Generate with
  `openssl rand -base64 32` (a value is already set locally).

On Vercel, add `DATABASE_URL`, both `NEON_AUTH_*`, and `BLOB_READ_WRITE_TOKEN`.

## Sign-up verification (OTP)

Configured in `components/auth/AuthProvider.tsx` via the provider flags
`emailOTP` + `emailVerification`: after email/password sign-up the user must
enter an **emailed OTP code** to verify their address before the account is
active.

**Server side (Neon console):** confirm that Neon Auth has **email
verification required** and **email delivery** configured, so the OTP email
actually sends. Managed Neon Auth handles sending; if emails don't arrive,
check the Auth tab's email/verification settings.

## How it fits together

- `lib/auth/server.ts` — `createNeonAuth({ baseUrl, cookies:{ secret } })`;
  builds `auth` only when both env vars exist (`isAuthConfigured`), else null.
- `lib/auth/client.ts` — `createAuthClient()` (Better Auth client).
- `app/api/auth/[...path]/route.ts` — `auth.handler()` proxy (GET/POST).
- `lib/auth.ts` — `getCurrentUser()` via `auth.getSession()` → `session.user`;
  `requireUserId()` guards write server actions.
- `components/auth/AuthProvider.tsx` — `NeonAuthUIProvider` (rendered only when
  configured); `app/auth/[path]/page.tsx` serves sign-in / sign-up / verify /
  settings via `AuthView`; `components/auth/AuthControls.tsx` shows the
  `UserButton` / sign-in link in the sidebar.
- Progress/quiz/notes server actions scope every row by the authenticated user
  id and reject writes when signed out (auth is the security boundary — the
  client-supplied id is never trusted).
