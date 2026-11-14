-- FashionTech AI - Initial Database Schema
-- Phase 2, Step 1: Supabase Backend Foundation
--
-- This migration creates the core tables for user profiles, projects,
-- tech packs, flat sketches, line sheets, and subscriptions.
-- All user-owned tables have Row Level Security (RLS) enabled with
-- policies restricting access to the record owner only.

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------------
-- 1. profiles
-- Stores user profile data linked to Supabase Auth users.
-- -------------------------------------------------------------------
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'designer' CHECK (role IN ('designer', 'admin', 'viewer')),
  brand_name TEXT,
  brand_contact TEXT,
  sizing_system TEXT NOT NULL DEFAULT 'CM' CHECK (sizing_system IN ('CM', 'IN')),
  size_range TEXT DEFAULT 'XS to XL',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -------------------------------------------------------------------
-- 2. projects
-- Top-level container for all user-created tech packs, flat sketches,
-- and line sheets.
-- -------------------------------------------------------------------
CREATE TABLE projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('tech_pack', 'flat_sketch', 'line_sheet')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'ready', 'exported')),
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -------------------------------------------------------------------
-- 3. tech_packs
-- Detailed tech pack data linked to a project.
-- -------------------------------------------------------------------
CREATE TABLE tech_packs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  garment_type TEXT,
  size_range TEXT,
  measurements JSONB,
  bom JSONB,
  construction_notes TEXT,
  flat_sketch_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -------------------------------------------------------------------
-- 4. flat_sketches
-- Generated flat sketch data linked to a project.
-- -------------------------------------------------------------------
CREATE TABLE flat_sketches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  source_image_url TEXT,
  generated_sketch_url TEXT,
  svg_url TEXT,
  view TEXT NOT NULL DEFAULT 'front' CHECK (view IN ('front', 'back', 'both')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -------------------------------------------------------------------
-- 5. line_sheets
-- Line sheet / collection review data linked to a project.
-- -------------------------------------------------------------------
CREATE TABLE line_sheets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  collection_title TEXT,
  season TEXT,
  styles JSONB,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -------------------------------------------------------------------
-- 6. subscriptions
-- Subscription and billing records per user.
-- -------------------------------------------------------------------
CREATE TABLE subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan_id TEXT NOT NULL DEFAULT 'starter' CHECK (plan_id IN ('starter', 'professional', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'trialing', 'incomplete')),
  credits INTEGER NOT NULL DEFAULT 0,
  monthly_price_cents INTEGER,
  annual_price_cents INTEGER,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -------------------------------------------------------------------
-- Indexes for common query patterns
-- -------------------------------------------------------------------
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_type ON projects(type);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_tech_packs_project_id ON tech_packs(project_id);
CREATE INDEX idx_flat_sketches_project_id ON flat_sketches(project_id);
CREATE INDEX idx_line_sheets_project_id ON line_sheets(project_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);

-- -------------------------------------------------------------------
-- Updated-at triggers
-- -------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tech_packs_updated_at BEFORE UPDATE ON tech_packs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flat_sketches_updated_at BEFORE UPDATE ON flat_sketches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_line_sheets_updated_at BEFORE UPDATE ON line_sheets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -------------------------------------------------------------------
-- Row Level Security (RLS)
-- All user-owned tables: users can only access their own records.
-- -------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE flat_sketches ENABLE ROW LEVEL SECURITY;
ALTER TABLE line_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------------
-- Profiles policies
-- Users can read and update their own profile.
-- -------------------------------------------------------------------
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- -------------------------------------------------------------------
-- Projects policies
-- Users can only access projects they own.
-- -------------------------------------------------------------------
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- -------------------------------------------------------------------
-- Tech packs policies
-- Users can only access tech packs belonging to their projects.
-- -------------------------------------------------------------------
CREATE POLICY "Users can view their own tech packs"
  ON tech_packs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tech_packs.project_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own tech packs"
  ON tech_packs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tech_packs.project_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own tech packs"
  ON tech_packs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tech_packs.project_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own tech packs"
  ON tech_packs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tech_packs.project_id
        AND projects.user_id = auth.uid()
    )
  );

-- -------------------------------------------------------------------
-- Flat sketches policies
-- Users can only access flat sketches belonging to their projects.
-- -------------------------------------------------------------------
CREATE POLICY "Users can view their own flat sketches"
  ON flat_sketches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = flat_sketches.project_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own flat sketches"
  ON flat_sketches FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = flat_sketches.project_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own flat sketches"
  ON flat_sketches FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = flat_sketches.project_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own flat sketches"
  ON flat_sketches FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = flat_sketches.project_id
        AND projects.user_id = auth.uid()
    )
  );

-- -------------------------------------------------------------------
-- Line sheets policies
-- Users can only access line sheets belonging to their projects.
-- -------------------------------------------------------------------
CREATE POLICY "Users can view their own line sheets"
  ON line_sheets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = line_sheets.project_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own line sheets"
  ON line_sheets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = line_sheets.project_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own line sheets"
  ON line_sheets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = line_sheets.project_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own line sheets"
  ON line_sheets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = line_sheets.project_id
        AND projects.user_id = auth.uid()
    )
  );

-- -------------------------------------------------------------------
-- Subscriptions policies
-- Users can only access their own subscription.
-- -------------------------------------------------------------------
CREATE POLICY "Users can view their own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
