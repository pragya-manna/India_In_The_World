/*
# India Global Progress Dashboard - Schema

1. Purpose
   Aggregates trusted global datasets (UN, World Bank, IMF, WHO, etc.) into a single
   destination to explore India's rankings across international indices, compare
   countries, analyze trends, and generate AI-powered insights.

2. New Tables
   - `categories`        : Top-level thematic groups (Economy, Society, Governance, etc.)
   - `indicators`        : Individual metrics within a category (GDP Rank, HDI, etc.)
   - `countries`        : Reference list of countries (ISO codes + names)
   - `rankings`          : A country's value/rank for an indicator in a given year
   - `sources`           : Original source attribution per indicator
   - `ai_insights`       : AI-generated summaries and report cards
   - `watchlists`        : Personalized saved indicators (single-tenant, no auth)

3. Security
   - All tables are single-tenant (no sign-in) and intentionally public/shared.
   - RLS enabled on every table with anon+authenticated CRUD.

4. Notes
   - `rankings` stores both absolute values and global ranks per year for trend analysis.
   - `sources` supports multiple sources per indicator via JSONB array.
*/

CREATE TABLE IF NOT EXISTS categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text,
  color text,
  description text,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS indicators (
  id text PRIMARY KEY,
  category_id text NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  unit text,
  description text,
  higher_is_better boolean DEFAULT true,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS countries (
  id text PRIMARY KEY,
  name text NOT NULL,
  iso2 text UNIQUE,
  iso3 text UNIQUE,
  region text,
  flag_emoji text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_id text NOT NULL REFERENCES indicators(id) ON DELETE CASCADE,
  country_id text NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  year int NOT NULL,
  value numeric,
  rank int,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE (indicator_id, country_id, year)
);

CREATE TABLE IF NOT EXISTS sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_id text NOT NULL REFERENCES indicators(id) ON DELETE CASCADE,
  organization text NOT NULL,
  url text,
  report_name text,
  published_year int,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_id text REFERENCES indicators(id) ON DELETE CASCADE,
  category_id text REFERENCES categories(id) ON DELETE CASCADE,
  insight_type text NOT NULL DEFAULT 'summary',
  content text NOT NULL,
  model text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS watchlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_id text NOT NULL REFERENCES indicators(id) ON DELETE CASCADE,
  label text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_categories" ON categories;
CREATE POLICY "anon_read_categories" ON categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_write_categories" ON categories;
CREATE POLICY "anon_write_categories" ON categories FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_categories" ON categories;
CREATE POLICY "anon_update_categories" ON categories FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_categories" ON categories;
CREATE POLICY "anon_delete_categories" ON categories FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_read_indicators" ON indicators;
CREATE POLICY "anon_read_indicators" ON indicators FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_write_indicators" ON indicators;
CREATE POLICY "anon_write_indicators" ON indicators FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_indicators" ON indicators;
CREATE POLICY "anon_update_indicators" ON indicators FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_indicators" ON indicators;
CREATE POLICY "anon_delete_indicators" ON indicators FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_read_countries" ON countries;
CREATE POLICY "anon_read_countries" ON countries FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_write_countries" ON countries;
CREATE POLICY "anon_write_countries" ON countries FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_countries" ON countries;
CREATE POLICY "anon_update_countries" ON countries FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_countries" ON countries;
CREATE POLICY "anon_delete_countries" ON countries FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_read_rankings" ON rankings;
CREATE POLICY "anon_read_rankings" ON rankings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_write_rankings" ON rankings;
CREATE POLICY "anon_write_rankings" ON rankings FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_rankings" ON rankings;
CREATE POLICY "anon_update_rankings" ON rankings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_rankings" ON rankings;
CREATE POLICY "anon_delete_rankings" ON rankings FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_read_sources" ON sources;
CREATE POLICY "anon_read_sources" ON sources FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_write_sources" ON sources;
CREATE POLICY "anon_write_sources" ON sources FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_sources" ON sources;
CREATE POLICY "anon_update_sources" ON sources FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_sources" ON sources;
CREATE POLICY "anon_delete_sources" ON sources FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_read_ai_insights" ON ai_insights;
CREATE POLICY "anon_read_ai_insights" ON ai_insights FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_write_ai_insights" ON ai_insights;
CREATE POLICY "anon_write_ai_insights" ON ai_insights FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_ai_insights" ON ai_insights;
CREATE POLICY "anon_update_ai_insights" ON ai_insights FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_ai_insights" ON ai_insights;
CREATE POLICY "anon_delete_ai_insights" ON ai_insights FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_read_watchlists" ON watchlists;
CREATE POLICY "anon_read_watchlists" ON watchlists FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_write_watchlists" ON watchlists;
CREATE POLICY "anon_write_watchlists" ON watchlists FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_watchlists" ON watchlists;
CREATE POLICY "anon_update_watchlists" ON watchlists FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_watchlists" ON watchlists;
CREATE POLICY "anon_delete_watchlists" ON watchlists FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_indicators_category ON indicators(category_id);
CREATE INDEX IF NOT EXISTS idx_rankings_indicator_country ON rankings(indicator_id, country_id);
CREATE INDEX IF NOT EXISTS idx_rankings_year ON rankings(year);
CREATE INDEX IF NOT EXISTS idx_sources_indicator ON sources(indicator_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_indicator ON ai_insights(indicator_id);
