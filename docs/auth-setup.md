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

## Google sign-in (OAuth)

Enabled app-side by one prop in `components/auth/AuthProvider.tsx`:
`social={{ providers: ["google"] }}`. The auth UI library renders the
"Continue with Google" button on `/auth/sign-in` and `/auth/sign-up`, plus a
and drives the whole redirect itself — there is no OAuth route, button or
handler in this repo. `/auth/callback` is the library's own landing view and is
already in `generateStaticParams`.

Linking and unlinking Google from an existing account is the library's
`ProvidersCard`, added explicitly to the **Security** tab in
`components/account/AccountTabs.tsx`. It does not come for free: that page
composes the auth UI's cards by hand (so the sessions card can be withheld on
an aged session), and the library only bundles the providers card into
`SecuritySettingsCards`, which the page therefore cannot use.

The OTP detour (`lib/auth/client.ts`, `lib/auth/pending-verification.ts`)
deliberately does **not** cover this path: it wraps `signUp.email` only, and
Google returns an already-verified address, so there is no code to enter.

### Credentials: shared today, your own before launch

Neon's Managed Better Auth ships Google OAuth **enabled by default with shared
development credentials**, which is what this project uses right now. Nothing
is configured on the Neon branch and no client secret exists anywhere in this
repo or in `.env.local` — and none should be added there. The Neon branch is
the only place these credentials belong.

The cost of the shared credentials is branding: Google's consent screen says
"Continue to `ep-dark-meadow-asosdp4k.neonauth.c-4.eu-central-1.aws.neon.tech`"
rather than the app's name. **Fine for development, not for launch.**

### Unverified: what happens to a duplicate email

If someone signed up with `x@gmail.com` + password and later clicks Continue
with Google, Managed Better Auth either links the two into one account or
refuses the sign-in. Neon documents no setting for this and exposes none
through its API, so it is a server-side default that cannot be read from here
— and confirming it needs a real Google account, which no automated check can
supply. **It is untested.** Before launch, sign in once each way with the same
address and see which happens; if it links, the user keeps one set of
progress/notes rows, and if it does not, they will silently own two accounts.

### Switching to your own Google OAuth app

1. **Google Cloud Console → Credentials → Create OAuth client ID**, type
   **Web application**. Under **Authorized redirect URIs** add, verbatim:

   ```text
   {NEON_AUTH_BASE_URL}/callback/google
   ```

   That is the *Neon* base URL from `.env.local`, not this app's domain — e.g.
   `https://ep-….neonauth.c-4.eu-central-1.aws.neon.tech/neondb/auth/callback/google`,
   with no trailing slash before `/callback`. Pointing Google at the app's own
   URL instead is the usual cause of `redirect_uri_mismatch`. Under
   **Authorized JavaScript origins** add the origins the UI runs on
   (`http://localhost:3000`, the production domain).

   Each Neon **branch** has its own `NEON_AUTH_BASE_URL`, so add one redirect
   URI per branch you sign in against.

2. **Google Cloud Console → OAuth consent screen → Branding**: app name, user
   support email, developer contact, and the app's domain under **Authorized
   domains**. Then **publish** it — an app left in *Testing* only admits Google
   accounts explicitly listed as test users, and verification can take several
   business days. Do this before launch, not on launch day.

3. **Register the credentials on the Neon branch** — console, CLI or API:

   ```bash
   neon neon-auth oauth-provider add --provider-id google      --oauth-client-id <client-id> --oauth-client-secret <client-secret>
   ```

   (Neon Console → project → branch → **Auth** does the same thing.)

4. **Trusted domains.** Every origin the user is returned to after the flow
   must be on Neon Auth's allowlist, or OAuth completes and then refuses to
   redirect back. Checked on 2026-09-03, the `production` branch already
   allows `https://algo.the-system.site`, and **any `localhost` port is
   pre-approved by Neon** — so nothing is needed for local work or for the
   current production domain. Add an entry only for a *new* origin: another
   domain, `www.`, or a wildcard such as `https://*-<project>.vercel.app` to
   cover Vercel preview deployments. Neon Console → branch → **Auth** →
   Configuration → Domains, or the trusted-domains API.

Reference: <https://neon.com/docs/auth/guides/setup-oauth>.

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
