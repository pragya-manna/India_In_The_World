import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, PolarAngleAxis,
} from 'recharts';
import type { Ranking } from '@/lib/supabase';

const tooltipStyle = {
  backgroundColor: 'var(--bg-elevated)',
  border: '1px solid rgba(255,153,51,0.3)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  fontSize: '12px',
};

export function TrendChart({
  data,
  color = '#FF9933',
  type = 'area',
  height = 280,
}: {
  data: Ranking[];
  color?: string;
  type?: 'area' | 'line' | 'bar';
  height?: number;
}) {
  const chartData = [...data]
    .sort((a, b) => a.year - b.year)
    .map((r) => ({ year: r.year, value: r.value, rank: r.rank }));

  if (chartData.length === 0) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-muted text-sm">
        No historical data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      {type === 'area' ? (
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis dataKey="year" stroke="var(--chart-axis)" fontSize={11} />
          <YAxis stroke="var(--chart-axis)" fontSize={11} />
          <Tooltip contentStyle={tooltipStyle} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#grad-${color})`}
            dot={{ fill: color, r: 3 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      ) : type === 'bar' ? (
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis dataKey="year" stroke="var(--chart-axis)" fontSize={11} />
          <YAxis stroke="var(--chart-axis)" fontSize={11} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      ) : (
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis dataKey="year" stroke="var(--chart-axis)" fontSize={11} />
          <YAxis stroke="var(--chart-axis)" fontSize={11} />
          <Tooltip contentStyle={tooltipStyle} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      )}
    </ResponsiveContainer>
  );
}

export function ScoreRing({
  value,
  max = 100,
  color = '#FF9933',
  size = 120,
  label,
}: {
  value: number;
  max?: number;
  color?: string;
  size?: number;
  label?: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  const data = [{ name: 'score', value: pct, fill: color }];
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="45" fill="none" stroke="var(--glass-card-border)" strokeWidth="6" />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="score-ring-fill"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-primary">{value}</span>
        {label && <span className="text-xs text-muted mt-0.5">{label}</span>}
      </div>
    </div>
  );
}

export function ComparisonBarChart({
  data,
  color = '#FF9933',
  height = 300,
}: {
  data: { name: string; value: number; fill?: string }[];
  color?: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" horizontal={false} />
        <XAxis type="number" stroke="var(--chart-axis)" fontSize={11} />
        <YAxis type="category" dataKey="name" stroke="var(--chart-axis)" fontSize={12} width={70} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {data.map((entry, i) => (
            <Bar key={i} dataKey="value" fill={entry.fill || color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
