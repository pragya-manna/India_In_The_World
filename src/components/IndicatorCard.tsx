import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus, ExternalLink, Star } from 'lucide-react';
import type { Indicator, Ranking, Source } from '@/lib/supabase';
import { TrendChart, ScoreRing } from '@/components/Charts';
import { useRef } from 'react';
import { useTiltCard } from '@/hooks/useAnimations';

interface IndicatorCardProps {
  indicator: Indicator;
  rankings: Ranking[];
  latestRank: number | null;
  latestValue: number | null;
  previousRank: number | null;
  sources: Source[];
  color: string;
  inWatchlist?: boolean;
  onToggleWatchlist?: () => void;
}

export function IndicatorCard({
  indicator,
  rankings,
  latestRank,
  latestValue,
  previousRank,
  sources,
  color,
  inWatchlist = false,
  onToggleWatchlist,
}: IndicatorCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  useTiltCard(cardRef);

  const rankChange = latestRank && previousRank ? previousRank - latestRank : 0;
  const improved = rankChange > 0;
  const declined = rankChange < 0;

  return (
    <div
      ref={cardRef}
      className="tilt-card glass-card rounded-2xl p-6 relative overflow-hidden"
      style={{ borderColor: `${color}30` }}
    >
      {/* Top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
      />

      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-serif font-bold text-lg text-primary">{indicator.name}</h3>
          <p className="text-xs text-muted mt-1">{indicator.unit}</p>
        </div>
        {onToggleWatchlist && (
          <button
            onClick={onToggleWatchlist}
            className={`p-1.5 rounded-lg transition-all ${
              inWatchlist ? 'text-saffron-400 bg-saffron-500/10' : 'text-white/30 hover:text-white/60 hover:bg-white/5'
            }`}
            title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            <Star size={16} fill={inWatchlist ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>

      {/* Rank + change */}
      <div className="flex items-end gap-4 mb-4">
        <div>
          <div className="text-3xl font-bold text-primary">
            {latestRank ? `#${latestRank}` : '—'}
          </div>
          <div className="text-xs text-muted uppercase tracking-wider">Global Rank</div>
        </div>
        {rankChange !== 0 && (
          <div
            className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-lg ${
              improved
                ? 'text-green-400 bg-green-500/10'
                : declined
                ? 'text-red-400 bg-red-500/10'
                : 'text-white/40 bg-white/5'
            }`}
          >
            {improved ? <TrendingUp size={14} /> : declined ? <TrendingDown size={14} /> : <Minus size={14} />}
            {Math.abs(rankChange)}
          </div>
        )}
        {latestValue !== null && (
          <div className="ml-auto text-right">
            <div className="text-lg font-semibold text-primary">
              {Number(latestValue).toLocaleString()}
            </div>
            <div className="text-xs text-muted">Latest Value</div>
          </div>
        )}
      </div>

      {/* Trend chart */}
      {rankings.length > 1 && (
        <div className="mb-4 -mx-2">
          <TrendChart data={rankings} color={color} type="area" height={140} />
        </div>
      )}

      {/* Sources */}
      {sources.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {sources.slice(0, 2).map((src) => (
            <a
              key={src.id}
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg text-muted hover:text-primary transition-all"
              style={{ background: 'var(--input-bg)' }}
            >
              <ExternalLink size={10} />
              {src.organization}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export function IndicatorDetail({
  indicator,
  rankings,
  latestRank,
  latestValue,
  previousRank,
  sources,
  color,
}: IndicatorCardProps) {
  const rankChange = latestRank && previousRank ? previousRank - latestRank : 0;
  const improved = rankChange > 0;
  const declined = rankChange < 0;

  return (
    <div className="glass-card rounded-3xl p-8" style={{ borderColor: `${color}30` }}>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold text-primary mb-2">{indicator.name}</h2>
          <p className="text-secondary max-w-2xl">{indicator.description}</p>
        </div>
        <div className="flex items-center gap-4">
          <ScoreRing value={latestRank || 0} max={200} color={color} size={100} label="Rank" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass rounded-xl p-4">
          <div className="text-2xl font-bold text-primary">#{latestRank || '—'}</div>
          <div className="text-xs text-muted">Global Rank</div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="text-2xl font-bold text-primary">
            {latestValue !== null ? Number(latestValue).toLocaleString() : '—'}
          </div>
          <div className="text-xs text-muted">Value ({indicator.unit})</div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className={`text-2xl font-bold ${improved ? 'text-green-500' : declined ? 'text-red-500' : 'text-primary'}`}>
            {rankChange > 0 ? `+${rankChange}` : rankChange < 0 ? rankChange : '—'}
          </div>
          <div className="text-xs text-muted">Rank Change</div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="text-2xl font-bold text-primary">{rankings.length}</div>
          <div className="text-xs text-muted">Years of Data</div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-secondary mb-3 uppercase tracking-wider">Historical Trend</h3>
        <TrendChart data={rankings} color={color} type="area" height={320} />
      </div>

      {sources.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-secondary mb-3 uppercase tracking-wider">Data Sources</h3>
          <div className="flex flex-wrap gap-3">
            {sources.map((src) => (
              <a
                key={src.id}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-shine inline-flex items-center gap-2 px-4 py-2 rounded-xl glass text-sm text-secondary hover:text-primary transition-all border hover:border-saffron-500/30"
                style={{ borderColor: 'var(--glass-border)' }}
              >
                <ExternalLink size={14} />
                <span className="font-medium">{src.organization}</span>
                <span className="text-white/40">· {src.report_name}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
