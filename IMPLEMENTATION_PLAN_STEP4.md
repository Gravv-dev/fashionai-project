# Phase 2, Step 4 Implementation Plan

## Overview
Implement Supabase Storage integration for file uploads across Tech Pack, Flat Sketch, and Line Sheet workflows.

## Files to Create

1. `supabase/migrations/002_storage_integration.sql` - Storage RLS policies + new DB columns
2. `src/lib/services/storage.ts` - Storage service (upload, URL, delete, list, validate)
3. `src/components/shared/ImagePreview.tsx` - Image preview with delete
4. `src/lib/storage-setup.ts` - Bucket creation setup function

## Files to Modify

1. `src/types/database.ts` - Add storage file types + new column types
2. `src/lib/services/index.ts` - Export storage service
3. `src/components/workspace/techpack/ReferenceUpload.tsx` - Connect to Supabase upload
4. `src/components/workspace/flatsketch/FlatSketchPreview.tsx` - Connect to Supabase upload
5. `src/components/workspace/line-sheet/LineSheetBuilder.tsx` - Connect to Supabase upload
6. `src/app/(app)/techpack/page.tsx` - Save storage path to tech pack record
7. `src/app/(app)/flatsketch/page.tsx` - Save storage path to flat sketch record
8. `src/app/(app)/line-sheet/page.tsx` - Save storage path to line sheet record

## Storage Buckets

| Bucket | Purpose | Access |
|---|---|---|
| garment-references | Tech pack reference images | Private |
| flat-sketches | Flat sketch source images | Private |
| line-sheet-assets | Line sheet product images | Private |

## Path Pattern

`{user_id}/{project_id}/{filename}`

## Security

- All buckets private
- RLS policies: users can only access files in their own `user_id/` folder
- File type validation: image/jpeg, image/png, image/webp
- Max file size: 5MB
- Signed URLs for private file access
