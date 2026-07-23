import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, FileText, Brain, TrendingUp } from 'lucide-react';
import { AIInsights } from '@/components/AIInsights';
import { useScrollReveal } from '@/hooks/useAnimations';
import { supabase, type AIInsight, type Indicator, type Category } from '@/lib/supabase';

export function InsightsPage() {
  useScrollReveal();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: ins }, { data: inds }, { data: cats }] = await Promise.all([
        supabase.from('ai_insights').select('*').order('created_at', { ascending: false }),
        supabase.from('indicators').select('*'),
        supabase.from('categories').select('*').order('display_order'),
      ]);
      setInsights(ins || []);
      setIndicators(inds || []);
      setCategories(cats || []);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4 max-w-screen-xl mx-auto">
        <div className="skeleton rounded-2xl h-12 w-64 mb-6" />
        <div className="skeleton rounded-2xl h-96" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="pt-24 pb-8 px-4 max-w-screen-xl mx-auto">
        <Link to="/" className="reveal inline-flex items-center gap-2 text-sm text-secondary hover:text-primary mb-6 transition-colors">
          <ArrowLeft size={14} /> Back
        </Link>
        <div className="reveal mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-saffron-500/30 text-xs text-saffron-500 mb-3">
            <Sparkles size={12} /> AI Powered
          </div>
          <h1 className="font-serif text-4xl font-bold text-primary mb-2">
            AI <span className="gradient-text-saffron">Insights</span>
          </h1>
          <p className="text-secondary max-w-2xl">
            AI-generated summaries, report cards, and data-driven insights about India's global performance.
          </p>
        </div>

        {/* Feature cards */}
        <div className="reveal grid sm:grid-cols-3 gap-4 mb-8">
          <div className="glass-card rounded-2xl p-5">
            <Brain size={20} className="text-saffron-500 mb-2" />
            <h3 className="font-serif font-bold text-primary text-sm mb-1">Natural Language</h3>
            <p className="text-xs text-muted">Ask questions like "Show India's innovation ranking"</p>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <FileText size={20} className="text-saffron-500 mb-2" />
            <h3 className="font-serif font-bold text-primary text-sm mb-1">Report Cards</h3>
            <p className="text-xs text-muted">AI-generated annual summaries per category</p>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <TrendingUp size={20} className="text-saffron-500 mb-2" />
            <h3 className="font-serif font-bold text-primary text-sm mb-1">Predictions</h3>
            <p className="text-xs text-muted">Ranking forecasts based on historical trends</p>
          </div>
        </div>
      </div>

      <AIInsights insights={insights} indicators={indicators} categories={categories} />
    </div>
  );
}
