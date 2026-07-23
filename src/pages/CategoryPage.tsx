import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { IndicatorCard } from '@/components/IndicatorCard';
import { useScrollReveal } from '@/hooks/useAnimations';
import {
  supabase,
  type Category, type Indicator, type Ranking, type Source,
} from '@/lib/supabase';

export function CategoryPage() {
  useScrollReveal();
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      if (!slug) return;
      const { data: cat } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      setCategory(cat);
      if (cat) {
        const [{ data: inds }, { data: ranks }, { data: srcs }] = await Promise.all([
          supabase.from('indicators').select('*').eq('category_id', cat.id).order('display_order'),
          supabase.from('rankings').select('*').eq('country_id', 'IN'),
          supabase.from('sources').select('*'),
        ]);
        setIndicators(inds || []);
        setRankings(ranks || []);
        setSources(srcs || []);
      }
      setLoading(false);
    })();
  }, [slug]);

  const filteredIndicators = useMemo(() => {
    if (!search) return indicators;
    return indicators.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));
  }, [indicators, search]);

  const getLatest = (id: string) =>
    rankings.filter((r) => r.indicator_id === id && r.country_id === 'IN').sort((a, b) => b.year - a.year)[0] || null;
  const getPrev = (id: string) =>
    rankings.filter((r) => r.indicator_id === id && r.country_id === 'IN').sort((a, b) => b.year - a.year)[1] || null;

  const toggleWatchlist = (id: string) => {
    setWatchlist((w) => {
      const next = new Set(w);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4 max-w-screen-xl mx-auto">
        <div className="skeleton rounded-2xl h-12 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton rounded-2xl h-64" />)}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen pt-24 px-4 text-center text-muted">
        Category not found. <Link to="/" className="text-saffron-400">Go home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 max-w-screen-xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-secondary hover:text-primary mb-6 transition-colors">
        <ArrowLeft size={14} /> Back
      </Link>

      <div className="mb-8">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-3"
          style={{ background: `${category.color}20`, color: category.color }}
        >
          Category
        </div>
        <h1 className="font-serif text-4xl font-bold text-primary mb-2">{category.name}</h1>
        <p className="text-secondary max-w-2xl">{category.description}</p>
      </div>

      <div className="relative mb-8 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter indicators..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl glass text-primary text-sm placeholder:text-muted outline-none border focus:border-saffron-500/50"
          style={{ borderColor: 'var(--input-border)' }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIndicators.map((ind) => {
          const latest = getLatest(ind.id);
          const prev = getPrev(ind.id);
          return (
            <IndicatorCard
              key={ind.id}
              indicator={ind}
              rankings={rankings.filter((r) => r.indicator_id === ind.id && r.country_id === 'IN')}
              latestRank={latest?.rank || null}
              latestValue={latest?.value || null}
              previousRank={prev?.rank || null}
              sources={sources.filter((s) => s.indicator_id === ind.id)}
              color={category.color}
              inWatchlist={watchlist.has(ind.id)}
              onToggleWatchlist={() => toggleWatchlist(ind.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
