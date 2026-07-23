import { useEffect, useState, useMemo } from 'react';
import { Search, Filter, Star, Download } from 'lucide-react';
import { IndicatorCard } from '@/components/IndicatorCard';
import {
  supabase,
  type Category, type Indicator, type Ranking, type Source, type Country,
} from '@/lib/supabase';

export function DashboardPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState<string>('all');
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      const [{ data: cats }, { data: inds }, { data: ranks }, { data: srcs }, { data: ctrs }] = await Promise.all([
        supabase.from('categories').select('*').order('display_order'),
        supabase.from('indicators').select('*').order('display_order'),
        supabase.from('rankings').select('*').eq('country_id', 'IN'),
        supabase.from('sources').select('*'),
        supabase.from('countries').select('*').order('name'),
      ]);
      setCategories(cats || []);
      setIndicators(inds || []);
      setRankings(ranks || []);
      setSources(srcs || []);
      setCountries(ctrs || []);
      setLoading(false);
    })();
  }, []);

  // suppress unused warning
  void countries;

  const filteredIndicators = useMemo(() => {
    return indicators.filter((ind) => {
      if (activeCat !== 'all' && ind.category_id !== activeCat) return false;
      if (search && !ind.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [indicators, activeCat, search]);

  const getLatestRank = (indicatorId: string, countryId = 'IN') =>
    rankings
      .filter((r) => r.indicator_id === indicatorId && r.country_id === countryId)
      .sort((a, b) => b.year - a.year)[0] || null;

  const getPreviousRank = (indicatorId: string, countryId = 'IN') =>
    rankings
      .filter((r) => r.indicator_id === indicatorId && r.country_id === countryId)
      .sort((a, b) => b.year - a.year)[1] || null;

  const getIndicatorRankings = (indicatorId: string, countryId = 'IN') =>
    rankings.filter((r) => r.indicator_id === indicatorId && r.country_id === countryId);

  const toggleWatchlist = (id: string) => {
    setWatchlist((w) => {
      const next = new Set(w);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exportCsv = () => {
    const rows = filteredIndicators.map((ind) => {
      const latest = getLatestRank(ind.id);
      const cat = categories.find((c) => c.id === ind.category_id);
      return [ind.name, cat?.name, latest?.value, latest?.rank, latest?.year, ind.unit].join(',');
    });
    const csv = ['Indicator,Category,Value,Rank,Year,Unit', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'india-rankings.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 max-w-screen-xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-bold text-primary mb-2">
          Global <span className="gradient-text-saffron">Dashboard</span>
        </h1>
        <p className="text-secondary">India's rankings across all international indices.</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search indicators..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl glass text-primary text-sm placeholder:text-muted outline-none border focus:border-saffron-500/50 transition-all"
            style={{ borderColor: 'var(--input-border)' }}
          />
        </div>
        <button
          onClick={exportCsv}
          className="btn-shine flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl glass text-primary text-sm border hover:border-saffron-500/30 transition-all"
          style={{ borderColor: 'var(--glass-border)' }}
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveCat('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeCat === 'all'
              ? 'bg-saffron-500 text-white'
              : 'glass text-secondary hover:text-primary border'
          }`}
          style={activeCat !== 'all' ? { borderColor: 'var(--glass-border)' } : undefined}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCat(cat.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeCat === cat.id ? 'text-white' : 'glass text-secondary hover:text-primary border'
            }`}
            style={activeCat === cat.id ? { background: cat.color } : { borderColor: 'var(--glass-border)' }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton rounded-2xl h-64" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIndicators.map((ind) => {
            const latest = getLatestRank(ind.id);
            const prev = getPreviousRank(ind.id);
            const cat = categories.find((c) => c.id === ind.category_id);
            return (
              <IndicatorCard
                key={ind.id}
                indicator={ind}
                rankings={getIndicatorRankings(ind.id)}
                latestRank={latest?.rank || null}
                latestValue={latest?.value || null}
                previousRank={prev?.rank || null}
                sources={sources.filter((s) => s.indicator_id === ind.id)}
                color={cat?.color || '#FF9933'}
                inWatchlist={watchlist.has(ind.id)}
                onToggleWatchlist={() => toggleWatchlist(ind.id)}
              />
            );
          })}
        </div>
      )}

      {!loading && filteredIndicators.length === 0 && (
        <div className="text-center py-20 text-muted">
          <Filter size={32} className="mx-auto mb-4 opacity-50" />
          No indicators found. Try a different search or category.
        </div>
      )}
    </div>
  );
}
