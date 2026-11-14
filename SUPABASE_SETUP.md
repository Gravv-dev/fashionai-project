# Supabase Backend Setup — FashionTech AI

**Phase 2, Step 1: Supabase Backend Foundation**

This document describes how to provision and connect the Supabase backend
for FashionTech AI. It covers environment variables, database migrations,
Row Level Security (RLS), and verification steps.

---

## 1. Prerequisites

- A Supabase account (https://supabase.com)
- The Supabase CLI (optional, for local development):
  ```bash
  npm install -g supabase
  supabase login
  ```

---

## 2. Environment Variables

Create or update `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

### Security Rules

- **Never** expose the `service_role` key in frontend code.
- Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are
  safe for client-side use.
- The `.env.local` file is gitignored and must not be committed.
- Use your hosting provider's secret management for production values.

### Obtaining Keys

1. Go to your Supabase project dashboard.
2. Navigate to **Settings → API**.
3. Copy the **Project URL** and **anon public** key.

---

## 3. Database Migrations

Run the initial migration against your Supabase database:

### Option A: Supabase CLI (recommended for local development)

```bash
supabase link --project-ref your-project-ref
supabase db push
```

### Option B: Supabase SQL Editor (dashboard)

1. Open your Supabase project dashboard.
2. Go to **SQL Editor**.
3. Create a new query and paste the contents of:
   `supabase/migrations/001_initial_schema.sql`
4. Click **Run**.

### Migration Contents

The migration creates the following tables:

| Table | Description | RLS Enabled |
|---|---|---|
| `profiles` | User profile linked to `auth.users` | Yes |
| `projects` | Top-level container for tech packs, flat sketches, line sheets | Yes |
| `tech_packs` | Tech pack data linked to a project | Yes |
| `flat_sketches` | Flat sketch data linked to a project | Yes |
| `line_sheets` | Line sheet / collection review data linked to a project | Yes |
| `subscriptions` | Subscription and billing records per user | Yes |

All user-owned tables have Row Level Security enabled with policies ensuring
users can only access their own records.

---

## 4. Row Level Security (RLS) Policies

| Table | Policy | Condition |
|---|---|---|
| profiles | Users can view their own profile | `auth.uid() = id` |
| profiles | Users can update their own profile | `auth.uid() = id` |
| profiles | Users can insert their own profile | `auth.uid() = id` |
| projects | Users can view/create/update/delete their own projects | `auth.uid() = user_id` |
| tech_packs | Users can view/create/update/delete their own tech packs | Project ownership check |
| flat_sketches | Users can view/create/update/delete their own flat sketches | Project ownership check |
| line_sheets | Users can view/create/update/delete their own line sheets | Project ownership check |
| subscriptions | Users can view/insert/update their own subscription | `auth.uid() = user_id` |

Tech packs, flat sketches, and line sheets use subquery-based policies
that verify the parent `projects` row belongs to the authenticated user.

---

## 5. TypeScript Database Types

The file `src/types/database.ts` contains TypeScript types generated to
match the SQL schema. These are used throughout the service layer for
type-safe database queries.

If you modify the SQL schema, regenerate or manually update these types:

```bash
# Using Supabase CLI (if installed locally)
supabase gen types typescript --local > src/types/database.ts
```

---

## 6. Database Services

Reusable service functions are located in `src/lib/services/`:

| Module | Responsibility |
|---|---|
| `base.ts` | Result wrappers, error handling, safeCall helper |
| `profiles.ts` | Profile CRUD (get, create, update, upsert) |
| `projects.ts` | Project CRUD (list, get, create, update, delete) |
| `techPacks.ts` | Tech pack CRUD |
| `flatSketches.ts` | Flat sketch CRUD |
| `lineSheets.ts` | Line sheet CRUD |
| `subscriptions.ts` | Subscription CRUD |
| `index.ts` | Barrel export for all services |

Each service returns a `ServiceResult<T>` shape:

```ts
interface ServiceResult<T> {
  data: T | null;
  error: ServiceError | null;
  success: boolean;
}
```

Example usage:

```ts
import { getProjects } from "@/lib/services";

const result = await getProjects();
if (!result.success) {
  console.error(result.error?.message);
  return;
}
// result.data is Project[]
```

---

## 7. Supabase Client Configuration

`src/lib/supabase.ts` exports:

- `createClient()` — browser/server Supabase client (returns `null` if not configured)
- `createServerSupabaseClient(cookies)` — server client with cookie handling
- `createBrowserSupabaseClient()` — browser client
- `validateSupabaseConfig()` — throws if env vars are missing
- `isConfigured` — boolean indicating whether credentials are present

The client is typed with the `Database` interface from
`src/types/database.ts` for end-to-end type safety.

---

## 8. Auth Integration

The existing login (`/login`) and signup (`/signup`) pages already use
`supabase.auth.signInWithPassword` and `supabase.auth.signUp`. On
successful signup, the app should call `upsertProfile` to create a
matching row in the `profiles` table.

A database trigger or Edge Function can be added later to auto-create
profiles on `auth.users` insert.

---

## 9. Verification Steps

After applying the migration and setting environment variables:

1. **Build check:**
   ```bash
   npm run build
   ```
   Should complete without TypeScript or build errors.

2. **Lint check:**
   ```bash
   npm run lint
   ```
   Should pass with zero errors.

3. **Connection test:**
   Create a temporary test page or use the Supabase SQL Editor to verify
   RLS policies block cross-user access:
   ```sql
   -- As user A, insert a project
   INSERT INTO projects (user_id, name, type, status)
   VALUES (auth.uid(), 'Test Project', 'tech_pack', 'draft');

   -- As user B, attempt to select user A's project (should return 0 rows)
   SELECT * FROM projects WHERE user_id != auth.uid();
   ```

4. **Auth flow:**
   - Sign up at `/signup` → check `profiles` table for a new row
   - Sign in at `/login` → session should be established
   - Sign out → redirected to `/login`

---

## 9. Next Steps (Phase 2, Step 2+)

- Connect dashboard and workspace pages to the database services
- Add real-time project loading with React Query or SWR
- Implement file uploads to Supabase Storage
- Add Stripe integration for subscription billing
- Add AI generation endpoints (Edge Functions)
