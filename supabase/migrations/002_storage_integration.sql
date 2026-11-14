-- FashionTech AI - Storage Integration
-- Phase 2, Step 4: Supabase Storage & File Uploads
--
-- This migration:
-- 1. Adds storage file metadata columns to existing tables
-- 2. Enables Row Level Security on storage.objects
-- 3. Creates storage RLS policies for user-specific file access
--
-- NOTE: Storage buckets (garment-references, flat-sketches, line-sheet-assets)
-- must be created via the Supabase client API or dashboard.
-- See src/lib/storage-setup.ts for the bucket creation function.

-- -------------------------------------------------------------------
-- 1. Add storage file columns to existing tables
-- -------------------------------------------------------------------

-- tech_packs: Add reference_image_url for uploaded garment reference images
ALTER TABLE tech_packs
ADD COLUMN IF NOT EXISTS reference_image_url TEXT;

-- line_sheets: Add product_image_url for uploaded product images
ALTER TABLE line_sheets
ADD COLUMN IF NOT EXISTS product_image_url TEXT;

-- -------------------------------------------------------------------
-- 2. Enable RLS on storage.objects
-- -------------------------------------------------------------------

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------------
-- 3. Storage RLS policies
-- Users can only access files in their own user_id/ folder.
-- Path pattern: {user_id}/{project_id}/{filename}
-- -------------------------------------------------------------------

-- Users can list files in their own folder
CREATE POLICY "Users can list files in their own folder"
ON storage.objects FOR SELECT
USING (
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can upload files to their own folder
CREATE POLICY "Users can upload to their own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update files in their own folder
CREATE POLICY "Users can update files in their own folder"
ON storage.objects FOR UPDATE
USING (
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete files in their own folder
CREATE POLICY "Users can delete files in their own folder"
ON storage.objects FOR DELETE
USING (
  auth.uid()::text = (storage.foldername(name))[1]
);

-- -------------------------------------------------------------------
-- Indexes for new columns
-- -------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_tech_packs_reference_image_url
ON tech_packs(reference_image_url)
WHERE reference_image_url IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_line_sheets_product_image_url
ON line_sheets(product_image_url)
WHERE product_image_url IS NOT NULL;
