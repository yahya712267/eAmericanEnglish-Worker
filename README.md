# eAmericanEnglish Worker

Production Worker application for the approved screens 01–05 milestone.

## Included in this milestone

- Google-only application sign-in
- Pending access for first-time users
- Pre-authorized owner bootstrap
- Owner approval, rejection, and revocation controls
- Shared workspace list, create, rename, delete, open, and switch flows
- Approved workspace sidebar hierarchy and product navigation entries
- Empty workspace state when no product is selected
- Supabase schema and Row Level Security policies

Product generators, Projects, Assets, Settings, invitations, and workspace-specific permissions are intentionally outside this milestone.

## Local setup

1. Install Node.js 20 or newer and pnpm.
2. Run `pnpm install`.
3. Copy `.env.example` to `.env.local`.
4. In the existing Supabase project, copy the publishable key into `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Do not use a service-role key in the browser application.
5. Ensure Google is enabled in Supabase Authentication and its OAuth client allows the Supabase callback URL shown in the provider settings.
6. Run `pnpm dev` and open `http://localhost:3000`.

The database foundation is tracked in `supabase/migrations/202608270001_initial_worker_foundation.sql`.

## Verification

```text
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```
