import { useEffect, useState, useMemo, useRef } from 'react';
import { ArrowLeft, Plus, X, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { ComparisonBarChart } from '@/components/Charts';
import { useScrollReveal } from '@/hooks/useAnimations';
import {
  supabase,
  type Country, type Indicator, type Ranking, type Category,
} from '@/lib/supabase';

export function ComparePage() {
  useScrollReveal();
  const [countries, setCountries] = useState<Country[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>(['IN', 'US', 'CN']);
  const [indicatorId, setIndicatorId] = useState<string>('gdp_growth');
  const [showPicker, setShowPicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const hasLoadedRankings = useRef(false);

  useEffect(() => {
    (async () => {
      const [{ data: ctrs }, { data: inds }, { data: cats }] = await Promise.all([
        supabase.from('countries').select('*').order('name'),
        supabase.from('indicators').select('*').order('display_order'),
        supabase.from('categories').select('*').order('display_order'),
      ]);

      setCountries(ctrs || []);
      setIndicators(inds || []);
      setCategories(cats || []);
    })();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadRankings = async () => {
      // Show the skeleton only when the page opens for the first time.
      if (hasLoadedRankings.current) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setLoadError(null);

      const { data, error } = await supabase
        .from('rankings')
        .select('*')
        .eq('indicator_id', indicatorId)
        .in('country_id', selected);

      if (cancelled) return;

      if (error) {
        setLoadError(error.message);
        setRankings([]);
      } else {
        setRankings(data || []);
      }

      setLoading(false);
      setRefreshing(false);
      hasLoadedRankings.current = true;
    };

    void loadRankings();

    return () => {
      cancelled = true;
    };
  }, [selected, indicatorId]);

  const currentIndicator = indicators.find((i) => i.id === indicatorId);
  const currentCategory = categories.find((c) => c.id === currentIndicator?.category_id);

  const comparisonData = useMemo(() => {
    return selected.map((cid) => {
      const country = countries.find((c) => c.id === cid);
      const latest = rankings
        .filter((r) => r.indicator_id === indicatorId && r.country_id === cid)
        .sort((a, b) => b.year - a.year)[0];
      return {
        name: country?.flag_emoji ? `${country.flag_emoji} ${country.name}` : cid,
        value: latest?.value || 0,
        rank: latest?.rank || 0,
        fill: cid === 'IN' ? '#FF9933' : cid === 'US' ? '#3b82f6' : cid === 'CN' ? '#ef4444' : '#8b5cf6',
      };
    });
  }, [selected, indicatorId, rankings, countries]);

  const trendData = useMemo(() => {
    const years = [...new Set(rankings.filter((r) => r.indicator_id === indicatorId).map((r) => r.year))].sort();
    return years.map((year) => {
      const row: Record<string, number | string> = { year };
      selected.forEach((cid) => {
        const r = rankings.find((x) => x.indicator_id === indicatorId && x.country_id === cid && x.year === year);
        row[cid] = r?.value || 0;
      });
      return row;
    });
  }, [selected, indicatorId, rankings]);

  const toggleCountry = (id: string) => {
    setSelected((s) => {
      if (s.includes(id)) return s.filter((x) => x !== id);
      if (s.length >= 5) return s;
      return [...s, id];
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4 max-w-screen-xl mx-auto">
        <div className="skeleton rounded-2xl h-12 w-64 mb-6" />
        <div className="skeleton rounded-2xl h-96" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 max-w-screen-xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-secondary hover:text-primary mb-6 transition-colors">
        <ArrowLeft size={14} /> Back
      </Link>

      <div className="mb-8">
        <h1 className="font-serif text-4xl font-bold text-primary mb-2">
          Country <span className="gradient-text-saffron">Comparison</span>
        </h1>
        <p className="text-secondary">Compare India with any country across any indicator.</p>
      </div>
      {loadError && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
          Could not load comparison data: {loadError}
        </div>
      )}

      {refreshing && (
        <p className="mb-4 text-xs text-muted">Updating comparison data…</p>
      )}

      {/* Selected countries */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {selected.map((cid) => {
          const c = countries.find((x) => x.id === cid);
          return (
            <div
              key={cid}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full glass text-sm text-primary border"
              style={cid === 'IN' ? { borderColor: '#FF9933' } : { borderColor: 'var(--glass-border)' }}
            >
              <span>{c?.flag_emoji}</span>
              <span>{c?.name}</span>
              {cid !== 'IN' && (
                <button onClick={() => toggleCountry(cid)} className="text-muted hover:text-primary">
                  <X size={12} />
                </button>
              )}
            </div>
          );
        })}
        {selected.length < 5 && (
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="btn-shine flex items-center gap-1 px-3 py-1.5 rounded-full text-sm text-saffron-500 border border-saffron-500/30 hover:bg-saffron-500/10 transition-all"
          >
            <Plus size={14} /> Add Country
          </button>
        )}
      </div>

      {/* Country picker */}
      {showPicker && (
        <div className="glass-card rounded-2xl p-4 mb-6 max-h-60 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {countries
              .filter((c) => !selected.includes(c.id))
              .map((c) => (
                <button
                  key={c.id}
                  onClick={() => { toggleCountry(c.id); setShowPicker(false); }}
                  className="btn-shine flex items-center gap-2 px-3 py-2 rounded-lg glass text-sm text-secondary hover:text-primary transition-all border hover:border-saffron-500/20"
                  style={{ borderColor: 'var(--glass-border)' }}
                >
                  <span>{c.flag_emoji}</span>
                  {c.name}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Indicator selector */}
      <div className="mb-8">
        <label className="text-xs text-muted uppercase tracking-wider mb-2 block">Select Indicator</label>
        <select
          value={indicatorId}
          onChange={(e) => setIndicatorId(e.target.value)}
          className="px-4 py-2.5 rounded-xl glass text-primary text-sm outline-none border focus:border-saffron-500/50 transition-all"
          style={{ borderColor: 'var(--input-border)' }}
        >
          {categories.map((cat) => (
            <optgroup key={cat.id} label={cat.name}>
              {indicators
                .filter((i) => i.category_id === cat.id)
                .map((i) => (
                  <option key={i.id} value={i.id} style={{ background: 'var(--bg-elevated)' }}>
                    {i.name}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Comparison chart */}
      <div className="glass-card rounded-3xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-serif font-bold text-lg text-primary">{currentIndicator?.name}</h3>
            <p className="text-xs text-muted">{currentCategory?.name} · {currentIndicator?.unit}</p>
          </div>
          <Trophy size={20} className="text-saffron-500" />
        </div>
        <ComparisonBarChart data={comparisonData} color="#FF9933" height={250} />

        {/* Rank table */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[...comparisonData]
            .sort((a, b) => (
              currentIndicator?.higher_is_better
                ? b.value - a.value
                : a.value - b.value
            ))
            .map((d, i) => (
              <div key={i} className="glass rounded-xl p-3 text-center">
                <div className="text-xs text-muted mb-1">{d.name}</div>
                <div className="text-xl font-bold text-primary">{d.value.toLocaleString()}</div>
                {d.rank > 0 && <div className="text-xs text-muted">Rank #{d.rank}</div>}
              </div>
            ))}
        </div>
      </div>

      {/* Trend comparison */}
      <div className="glass-card rounded-3xl p-6">
        <h3 className="font-serif font-bold text-lg text-primary mb-4">Historical Trend Comparison</h3>
        <div style={{ height: 300 }}>
          <ResponsiveTrendChart data={trendData} selected={selected} countries={countries} />
        </div>
      </div>
    </div>
  );
}

function ResponsiveTrendChart({
  data,
  selected,
  countries,
}: {
  data: Record<string, number | string>[];
  selected: string[];
  countries: Country[];
}) {
  const colors: Record<string, string> = { IN: '#FF9933', US: '#3b82f6', CN: '#ef4444', GB: '#a855f7', DE: '#22c55e' };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
        <XAxis dataKey="year" stroke="var(--chart-axis)" fontSize={11} />
        <YAxis stroke="var(--chart-axis)" fontSize={11} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid rgba(255,153,51,0.3)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontSize: '12px',
          }}
        />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        {selected.map((cid) => {
          const c = countries.find((x) => x.id === cid);
          return (
            <Line
              key={cid}
              type="monotone"
              dataKey={cid}
              name={`${c?.flag_emoji} ${c?.name}`}
              stroke={colors[cid] || '#8b5cf6'}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
}
