# Phase 2, Step 3 Implementation Plan

## Overview
Integrate existing database services with the actual frontend. Replace deprecated middleware with Next.js 16 proxy convention. Connect all pages to real Supabase data.

## Tasks

### 1. Middleware → Proxy Migration
- Create `src/proxy.ts` using Next.js 16 proxy convention
- Remove `src/middleware.ts`
- Preserve Supabase cookie handling
- Use `auth.getClaims()` for server-side identity verification

### 2. Dashboard Database Integration
- Replace hardcoded STATS with real counts from DB
- Replace hardcoded RECENT_PROJECTS with real data from DB
- Show loading, empty, error states

### 3. Projects CRUD Page
- Create project form (modal or inline)
- Fetch projects from DB with search/filter
- View/edit/delete projects
- Loading, empty, success, error states

### 4. Feature Record Integration
- Tech Pack page: save metadata, associate with project, fetch saved
- Flat Sketch page: save metadata, associate with project, fetch saved
- Line Sheet page: save metadata, associate with project, fetch saved

### 5. Settings Page Integration
- Load user profile from DB
- Save profile updates to DB

### 6. Security
- RLS policies respected (already in DB)
- Server-side identity verification via proxy
- Input validation before writes
- Proper error handling

## Files to Create
- `src/proxy.ts` (replaces middleware.ts)
- `src/components/shared/ProjectForm.tsx` (create/edit project form)

## Files to Modify
- `src/middleware.ts` (delete)
- `src/app/(app)/dashboard/page.tsx` (DB integration)
- `src/app/(app)/projects/page.tsx` (DB integration + CRUD)
- `src/app/(app)/techpack/page.tsx` (DB integration)
- `src/app/(app)/flatsketch/page.tsx` (DB integration)
- `src/app/(app)/line-sheet/page.tsx` (DB integration)
- `src/app/(app)/settings/page.tsx` (DB integration)

## Build & Lint Verification
- `npm run build` must pass
- `npm run lint` must pass (0 errors)
- TypeScript strict mode must pass
