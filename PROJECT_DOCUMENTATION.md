# FashionTech AI SaaS — Project Documentation

**Version:** 1.0.0  
**Last Updated:** November 14, 2026  
**Project Path:** `/home/gaurav/Documents/rea-project-side/fashiontech-ai/`

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Route Groups](#route-groups)
4. [Database Schema](#database-schema)
5. [Supabase Storage](#supabase-storage)
6. [Authentication](#authentication)
7. [AI Integration](#ai-integration)
8. [Export System](#export-system)
9. [Component Library](#component-library)
10. [Phase Breakdown](#phase-breakdown)
11. [API Reference](#api-reference)
12. [Security Measures](#security-measures)
13. [Setup & Installation](#setup--installation)
14. [Build & Lint Status](#build--lint-status)
15. [Environment Variables](#environment-variables)
16. [Remaining Work](#remaining-work)

---

## Project Overview

FashionTech AI is a Next.js 16 SaaS platform for fashion designers to create tech packs using AI-powered garment analysis. The system allows users to upload garment reference images, generate AI-powered tech pack specifications, edit them, and export to PDF or Excel.

**Design System:** PANTONE®-inspired palette — deep ink (`#0F172A`) primary + rose-gold accent (`#F4A496`), Tailwind CSS, shadcn/ui components.

**Tech Stack:**
- Next.js 16 App Router
- TypeScript (strict mode)
- Tailwind CSS
- shadcn/ui
- Supabase (Auth, Database, Storage)
- OpenAI-compatible AI provider
- Stripe-compatible membership model

---

## Architecture

### Route Groups

The application uses Next.js route groups to separate marketing pages from authenticated app pages:

```
src/app/
├── (marketing)/          # Public marketing pages
│   ├── page.tsx          # Landing page
│   ├── login/            # Sign in
│   ├── signup/           # Registration
│   ├── forgot-password/  # Password reset request
│   ├── reset-password/   # Password reset form
│   └── pricing/          # Pricing plans
├── (app)/                # Authenticated app pages (protected via proxy)
│   ├── layout.tsx        # App shell layout with AuthShell
│   ├── dashboard/        # User dashboard
│   ├── projects/         # Project management
│   ├── flatsketch/       # Flat sketch tool
│   ├── line-sheet/       # Line sheet builder
│   ├── settings/         # User settings
│   └── techpack/         # Tech pack generator (AI)
└── layout.tsx            # Root layout
```

### Layer Architecture

```
┌─────────────────────────────────────────┐
│  Presentation Layer (Next.js Pages)     │
│  Components: shadcn/ui + custom         │
├─────────────────────────────────────────┤
│  Service Layer (src/lib/services/)      │
│  - techPacks, projects, profiles,       │
│    subscriptions, storage, exports      │
├─────────────────────────────────────────┤
│  AI Layer (src/lib/ai/)                 │
│  - Providers (OpenAI-compatible)        │
│  - Services (techpack-ai)               │
│  - Schemas (Zod validation)             │
│  - Types                                │
├─────────────────────────────────────────┤
│  Data Layer (Supabase)                  │
│  - Tables with RLS policies             │
│  - Storage buckets                      │
└─────────────────────────────────────────┘
```

---

## Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| `profiles` | User profiles (id, email, full_name, avatar_url, role) |
| `projects` | User projects (id, user_id, name, type, status, etc.) |
| `tech_packs` | Tech pack records with AI columns |
| `flat_sketches` | Flat sketch records |
| `line_sheets` | Line sheet records |
| `subscriptions` | Stripe subscription records |

### Tech Pack AI Columns

| Column | Type | Description |
|--------|------|-------------|
| `ai_garment_type` | text | AI-detected garment type |
| `ai_garment_category` | text | AI-detected category |
| `ai_gender_category` | text | AI-detected gender |
| `ai_description` | text | AI-generated description |
| `ai_style_characteristics` | jsonb | Style characteristics array |
| `ai_visual_details` | jsonb | Visual details object |
| `ai_materials` | jsonb | Materials object |
| `ai_measurements` | jsonb | Measurements array |
| `ai_bill_of_materials` | jsonb | BOM array |
| `ai_construction_details` | jsonb | Construction details |
| `ai_confidence_score` | integer | AI confidence (0-100) |
| `ai_model_used` | text | AI model identifier |
| `ai_status` | text | draft/generating/completed/failed |
| `ai_generated_at` | timestamptz | Generation timestamp |

### RLS Policies

All tables have Row Level Security enabled. Users can only access records belonging to their own projects (`user_id = auth.uid()`).

---

## Supabase Storage

### Buckets

| Bucket | Purpose | Access |
|--------|---------|--------|
| `garment-references` | Garment reference images | Private (signed URLs) |
| `flat-sketches` | Flat sketch exports | Private (signed URLs) |
| `line-sheet-assets` | Line sheet assets | Private (signed URLs) |

**File Validation:**
- Max file size: 5 MB
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`
- Allowed extensions: `.jpg`, `.jpeg`, `.png`, `.webp`

**RLS:** Users can only access files in their own `user_id/` folder.

---

## Authentication

Auth is handled via Supabase Auth with a **Next.js 16 proxy pattern** (not middleware) for route protection:

- Login: `(marketing)/login/page.tsx`
- Signup: `(marketing)/signup/page.tsx`
- Forgot Password: `(marketing)/forgot-password/page.tsx`
- Reset Password: `(marketing)/reset-password/page.tsx`
- Protected routes: `(app)` group, protected by `AppShell` auth check

### Auth Flow

```
User → Login/Signup → Supabase Auth → Session → AppShell → Protected Routes
```

In development without Supabase configured, a mock user (`demo@fashiontech.ai`) is provided after a timeout.

---

## AI Integration

### Provider Architecture

The AI system uses an OpenAI-compatible provider with configurable API endpoint:

```
src/lib/ai/
├── providers/
│   ├── base.ts       # BaseAIProvider abstract class
│   ├── factory.ts    # Provider factory (createAIProvider, createAIProviderFromEnv)
│   └── openai.ts     # OpenAI provider implementation
├── services/
│   ├── index.ts      # Service exports
│   └── techpack-ai.ts # Tech pack AI service
├── schemas/
│   └── techpack.ts   # Zod schemas for structured output
├── types/
│   └── index.ts      # AI type definitions
└── errors.ts         # AI error classes
```

### AI Generation Flow (Phase 3 Step 2)

1. User uploads garment reference image to Supabase Storage
2. Server action `generateAITechPack()` is called
3. Server action verifies auth + project ownership
4. `generateTechPackFromImage()` calls AI provider
5. Response validated via Zod schema (`validateTechPackOutput`)
6. Results saved to `tech_packs` table
7. `AIResultsEditor` displays editable AI-generated specs

### AI Confidence & Accuracy

- Never claim exact measurements from ordinary photographs
- Mark estimated measurements as estimates
- Show unknown values where information cannot be determined
- Do not invent fabric composition
- Require user approval before finalizing

---

## Export System

### Services

| Service | File | Formats |
|---------|------|---------|
| Tech Pack Export | `src/lib/services/exports/techpack-export.ts` | PDF, Excel |
| Flat Sketch Export | `src/lib/services/exports/flatsketch-export.ts` | PDF |
| Line Sheet Export | `src/lib/services/exports/line-sheet-export.ts` | PDF |

### Export Features

- Retrieves private images via signed URLs
- Handles missing data gracefully
- Uses latest saved user-approved values (not unsaved AI responses)
- PDF generated with `pdfkit`, Excel with `exceljs`

---

## Component Library

### shadcn/ui Components

Button, Card, Input, Label, Dialog, DropdownMenu, Popover, Progress, RadioGroup, ScrollArea, Select, Separator, Sheet, Skeleton, Tabs, Toast, Tooltip

### Custom Components

| Component | File | Purpose |
|-----------|------|---------|
| ReferenceUpload | `src/components/workspace/techpack/ReferenceUpload.tsx` | Garment image upload |
| GenerationControls | `src/components/workspace/techpack/GenerationControls.tsx` | Generation settings (effort, notes) |
| AIProgressTracker | `src/components/workspace/techpack/AIProgressTracker.tsx` | 4-step generation progress |
| AIResultsEditor | `src/components/workspace/techpack/AIResultsEditor.tsx` | Editable AI results (6 sections) |
| ProgressStep | `src/components/shared/ProgressStep.tsx` | General progress step indicator |
| StatusBadge | `src/components/shared/StatusBadge.tsx` | Status display badge |
| FileUpload | `src/components/shared/FileUpload.tsx` | Generic file upload |
| EmptyState | `src/components/shared/EmptyState.tsx` | Empty state UI |
| ProjectForm | `src/components/shared/ProjectForm.tsx` | Project creation form |

---

## Phase Breakdown

### Phase 1 — Frontend Build (Complete)
- 10 pages across marketing and app route groups
- Responsive design with deep ink + rose-gold palette
- shadcn/ui component library
- All UI components (buttons, cards, inputs, dialogs, etc.)

### Phase 2 Step 1 — Supabase Schema (Complete)
- 6 database tables with RLS policies
- Supabase client configuration
- Database services (CRUD operations)

### Phase 2 Step 2 — Auth (Complete)
- Login, signup, forgot password, reset password
- Middleware → proxy migration for route protection
- Protected routes

### Phase 2 Step 3 — Dashboard/CRUD (Complete)
- Dashboard, pricing, agency pages connected to DB
- CRUD for projects
- Excel export service

### Phase 2 Step 4 — Supabase Storage (Complete)
- 3 storage buckets (garment-references, flat-sketches, line-sheet-assets)
- Storage service with file upload, signed URLs, validation
- File upload integration

### Phase 2 Step 5 — Export System (Complete)
- Excel and PDF export services
- Export buttons on all 3 product pages

### Phase 3 Step 1 — AI Foundation (Complete)
- AI provider abstraction (OpenAI-compatible)
- JavaScript client-side AI service
- Zod schemas for structured output
- Storage integration for garment images

### Phase 3 Step 2 — AI Tech Pack Generation UI (Complete)
- **Server action** for secure AI generation (`actions.ts`)
- **AIProgressTracker** component with 4 stages
- **AIResultsEditor** component with 6 editable sections
- Tech pack page upgraded with AI generation workflow
- Export integration (PDF/Excel buttons on generated tech packs)
- Build: ✅ Passes | Lint: ✅ Passes (0 errors)

---

## API Reference

### Server Action: `generateAITechPack`

**File:** `src/app/(app)/techpack/actions.ts`

```typescript
export async function generateAITechPack(
  imagePath: string,
  projectId: string,
  userId: string
): Promise<{
  data: { techPackId: string; techPack: TechPack } | null;
  error: { message: string } | null;
  success: boolean;
}>
```

**Parameters:**
- `imagePath` — Path to uploaded garment reference image in Supabase Storage
- `projectId` — Project ID (must belong to user)
- `userId` — Authenticated user ID

**Returns:** Tech pack data on success, error object on failure.

**Security:**
- Verifies user authentication via `supabase.auth.getUser()`
- Verifies project ownership (`user_id = auth.uid()`)
- Never exposes AI API key to client

### Service: `generateTechPackFromImage`

**File:** `src/lib/ai/services/techpack-ai.ts`

Calls the AI provider, validates output with Zod, saves to database. Returns `AIGeneratedTechPack` type.

---

## Security Measures

| Measure | Implementation |
|---------|---------------|
| API Key Security | `AI_API_KEY` server-side only, never `NEXT_PUBLIC_*` |
| Auth | Supabase Auth + proxy-based route protection |
| Ownership | RLS policies enforce `user_id` matching on all queries |
| Image Access | Private buckets + signed URLs only |
| AI Output Validation | Zod schemas validate all AI responses |
| Rate Limiting | Provider-level rate limit handling |
| No Mock AI | All AI calls go to real provider, no hardcoded results |
| No Frontend AI Keys | AI API key never sent to browser |

---

## Setup & Installation

### Prerequisites

- Node.js v24+
- npm v11+
- Supabase account (for production)
- OpenAI-compatible API key (for AI generation)

### Installation

```bash
cd /home/gaurav/Documents/rea-project-side/fashiontech-ai
npm install
```

### Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI (server-side only)
AI_API_KEY=your_openai_compatible_api_key
AI_API_BASE_URL=https://api.openai.com/v1  # optional, configurable
AI_MODEL=gpt-4o-mini  # optional
```

### Storage Setup

Create storage buckets via Supabase dashboard or run:

```typescript
// From src/lib/storage-setup.ts
createStorageBuckets()
```

### Running

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # Run ESLint
```

---

## Build & Lint Status

| Command | Status | Errors |
|---------|--------|--------|
| `npm run build` | ✅ Passes | 0 |
| `npm run lint` | ✅ Passes | 0 (81 warnings, all pre-existing) |
| TypeScript strict mode | ✅ Verified | — |

**Build Output:** All 15 routes compile successfully, including `/techpack` with AI generation UI.

---

## Remaining Work

1. **Environment Variables:** Set real Supabase credentials and `AI_API_KEY` in `.env.local`
2. **Storage Buckets:** Create buckets via Supabase dashboard or `createStorageBuckets()`
3. **AI Testing:** Test with real API key for valid/invalid image, timeout, rate limit scenarios
4. **Production Deployment:** Deploy to Vercel or similar platform with environment variables

---

## File Index

### Key Files

| File | Description |
|------|-------------|
| `src/app/(app)/techpack/page.tsx` | Main tech pack page with AI generation UI |
| `src/app/(app)/techpack/actions.ts` | Server action for AI generation |
| `src/components/workspace/techpack/AIResultsEditor.tsx` | Editable AI results (6 sections) |
| `src/components/workspace/techpack/AIProgressTracker.tsx` | Generation progress tracker |
| `src/lib/ai/services/techpack-ai.ts` | AI service layer |
| `src/lib/ai/schemas/techpack.ts` | Zod schemas |
| `src/lib/ai/providers/factory.ts` | AI provider factory |
| `src/lib/ai/types/index.ts` | AI type definitions |
| `src/lib/services/techPacks.ts` | Tech pack CRUD |
| `src/lib/services/storage.ts` | Storage service |
| `src/lib/services/exports/techpack-export.ts` | PDF/Excel export |
| `src/types/database.ts` | Database types |
| `supabase/migrations/003_ai_integration.sql` | AI columns migration |

---

*Documentation generated for FashionTech AI SaaS — Phase 3 Step 2 Complete*