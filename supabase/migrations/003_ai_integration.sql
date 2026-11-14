-- FashionTech AI - AI Integration Migration
-- Phase 2, Step 1: AI Foundation and Architecture
--
-- This migration adds AI-generated columns to the tech_packs table for
-- storing AI-generated tech pack specifications from garment reference images.
-- All existing records are preserved. RLS policies already exist for the
-- tech_packs table and apply to these new columns automatically.

-- -------------------------------------------------------------------
-- 1. Add AI-generated columns to tech_packs table
-- -------------------------------------------------------------------

-- Garment overview fields
ALTER TABLE tech_packs
ADD COLUMN IF NOT EXISTS ai_garment_type TEXT;

ALTER TABLE tech_packs
ADD COLUMN IF NOT EXISTS ai_garment_category TEXT;

ALTER TABLE tech_packs
ADD COLUMN IF NOT EXISTS ai_gender_category TEXT;

ALTER TABLE tech_packs
ADD COLUMN IF NOT EXISTS ai_description TEXT;

ALTER TABLE tech_packs
ADD COLUMN IF NOT EXISTS ai_style_characteristics JSONB;

-- Visual details (JSONB for flexible structure)
ALTER TABLE tech_packs
ADD COLUMN IF NOT EXISTS ai_visual_details JSONB;

-- Materials (JSONB)
ALTER TABLE tech_packs
ADD COLUMN IF NOT EXISTS ai_materials JSONB;

-- Measurements (JSONB - array of measurement objects)
ALTER TABLE tech_packs
ADD COLUMN IF NOT EXISTS ai_measurements JSONB;

-- Bill of Materials (JSONB - array of BOM items)
ALTER TABLE tech_packs
ADD COLUMN IF NOT EXISTS ai_bill_of_materials JSONB;

-- Construction details (JSONB)
ALTER TABLE tech_packs
ADD COLUMN IF NOT EXISTS ai_construction_details JSONB;

-- AI metadata
ALTER TABLE tech_packs
ADD COLUMN IF NOT EXISTS ai_confidence_score REAL;

ALTER TABLE tech_packs
ADD COLUMN IF NOT EXISTS ai_model_used TEXT;

ALTER TABLE tech_packs
ADD COLUMN IF NOT EXISTS ai_status TEXT
  DEFAULT 'pending'
  CHECK (ai_status IN ('pending', 'generating', 'completed', 'failed'));

ALTER TABLE tech_packs
ADD COLUMN IF NOT EXISTS ai_generated_at TIMESTAMPTZ;

-- -------------------------------------------------------------------
-- 2. Indexes for new columns
-- -------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_tech_packs_ai_status
ON tech_packs(ai_status)
WHERE ai_status IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tech_packs_ai_garment_type
ON tech_packs(ai_garment_type)
WHERE ai_garment_type IS NOT NULL;

-- -------------------------------------------------------------------
-- 3. Updated-at trigger (already exists for tech_packs table)
-- -------------------------------------------------------------------

-- The existing trigger on tech_packs table will automatically
-- update updated_at column on any changes to these new columns.
