import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Globe2, Sparkles, ChevronRight } from 'lucide-react';
import { Hero } from '@/components/Hero';
import { CategoryGrid } from '@/components/CategoryGrid';
import { AIInsights } from '@/components/AIInsights';
import { TrendChart } from '@/components/Charts';
import { useScrollReveal, useSvgLineDraw } from '@/hooks/useAnimations';
import { supabase, type Category, type Country, type Ranking, type AIInsight, type Indicator } from '@/lib/supabase';

export function HomePage() {
  useScrollReveal();
  useSvgLineDraw();

  const [categories, setCategories] = useState<Category[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: cats }, { data: countries }, { data: inds }, { data: ranks }, { data: ins }] = await Promise.all([
        supabase.from('categories').select('*').order('display_order'),
        supabase.from('countries').select('*').order('name'),
        supabase.from('indicators').select('*').order('display_order'),
        supabase.from('rankings').select('*').eq('country_id', 'IN'),
        supabase.from('ai_insights').select('*'),
      ]);
      setCategories(cats || []);
      setCountries(countries || []);
      setIndicators(inds || []);
      setRankings(ranks || []);
      setInsights(ins || []);
      setLoading(false);
    })();
  }, []);

  // India highlight rankings for hero ticker
  const indiaRankings = rankings.filter((r) => r.country_id === 'IN');
  const tickerItems = indiaRankings
    .filter((r) => r.rank !== null)
    .map((r) => {
      const ind = indicators.find((i) => i.id === r.indicator_id);
      return { label: ind?.name || r.indicator_id, rank: r.rank, value: r.value };
    });

  return (
    <div className="min-h-screen">
      <Hero />

      {/* Ticker */}
      {tickerItems.length > 0 && (
        <div className="ticker-wrapper border-y glass py-3 relative z-10" style={{ borderColor: 'var(--glass-border)' }}>
          <div className="ticker-track">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-6 text-sm">
                <span className="text-muted">{item.label}</span>
                <span className="font-bold gradient-text-saffron">#{item.rank}</span>
                <span className="text-muted opacity-30">|</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Grid */}
      {!loading && <CategoryGrid categories={categories} />}

      {/* India Spotlight */}
      <section className="py-20 px-4 max-w-screen-xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl font-bold mb-3 text-primary">
            India <span className="gradient-text-saffron">Spotlight</span>
          </h2>
          <p className="text-secondary max-w-2xl mx-auto">
            A snapshot of where India stands across key global indicators.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton rounded-2xl h-48" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* GDP Growth */}
            <div className="glass-card rounded-2xl p-6 border border-saffron-500/20">
              <h3 className="font-serif font-bold text-primary mb-1">GDP Growth Rate</h3>
              <p className="text-xs text-muted mb-4">Annual % growth</p>
              <TrendChart
                data={rankings.filter((r) => r.indicator_id === 'gdp_growth' && r.country_id === 'IN')}
                color="#FF9933"
                height={140}
              />
              <div className="mt-3 text-sm text-green-500 font-semibold">
                #1 in the world (7.0%)
              </div>
            </div>

            {/* HDI */}
            <div className="glass-card rounded-2xl p-6 border border-blue-500/20">
              <h3 className="font-serif font-bold text-primary mb-1">Human Development Index</h3>
              <p className="text-xs text-muted mb-4">UNDP score (0-1)</p>
              <TrendChart
                data={rankings.filter((r) => r.indicator_id === 'hdi' && r.country_id === 'IN')}
                color="#3b82f6"
                height={140}
              />
              <div className="mt-3 text-sm text-muted">
                Rank #134 · Score 0.644
              </div>
            </div>

            {/* Corruption */}
            <div className="glass-card rounded-2xl p-6 border border-green-500/20">
              <h3 className="font-serif font-bold text-primary mb-1">Corruption Perceptions</h3>
              <p className="text-xs text-muted mb-4">Transparency International</p>
              <TrendChart
                data={rankings.filter((r) => r.indicator_id === 'corruption_perceptions' && r.country_id === 'IN')}
                color="#138808"
                height={140}
              />
              <div className="mt-3 text-sm text-muted">
                Rank #93 · Score 39
              </div>
            </div>
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            to="/dashboard"
            className="btn-shine inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #FF9933, #e67e00)' }}
          >
            View Full Dashboard
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

{/* AI Insights */}
      {!loading && <AIInsights insights={insights} indicators={indicators} categories={categories} />}

      {/* CTA */}
      <section className="py-20 px-4 max-w-4xl mx-auto text-center">
        <div className="glass-card rounded-3xl p-12 border border-saffron-500/20">
          <Sparkles size={32} className="text-saffron-400 mx-auto mb-4" />
          <h2 className="font-serif text-3xl font-bold text-primary mb-4">
            Ready to explore India's global standing?
          </h2>
          <p className="text-secondary mb-8 max-w-xl mx-auto">
            Dive into 60+ indicators across 10 categories. Compare with any country.
            Generate AI insights. Understand where India should improve next.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="btn-shine inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #FF9933, #e67e00)' }}
            >
              <Globe2 size={16} /> Dashboard
            </Link>
            <Link
              to="/compare"
              className="btn-shine inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white glass border"
              style={{ borderColor: 'var(--glass-border)' }}
            >
              <TrendingUp size={16} /> Compare Countries
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
