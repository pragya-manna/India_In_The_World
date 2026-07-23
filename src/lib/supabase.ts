import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string;
  display_order: number;
};

export type Indicator = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  unit: string;
  description: string;
  higher_is_better: boolean;
  display_order: number;
};

export type Country = {
  id: string;
  name: string;
  iso2: string;
  iso3: string;
  region: string;
  flag_emoji: string;
};

export type Ranking = {
  id: string;
  indicator_id: string;
  country_id: string;
  year: number;
  value: number | null;
  rank: number | null;
  metadata?: Record<string, unknown>;
};

export type Source = {
  id: string;
  indicator_id: string;
  organization: string;
  url: string;
  report_name: string;
  published_year: number;
  notes?: string;
};

export type AIInsight = {
  id: string;
  indicator_id: string | null;
  category_id: string | null;
  insight_type: string;
  content: string;
  model: string | null;
  created_at: string;
};

export type Watchlist = {
  id: string;
  indicator_id: string;
  label: string | null;
  created_at: string;
};
