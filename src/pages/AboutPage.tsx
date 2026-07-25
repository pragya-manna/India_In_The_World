import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    Sparkles,
    Database,
    TrendingUp,
    Users,
    Landmark,
    Cpu,
    Languages,
    MapPin,
} from 'lucide-react';
import { useScrollReveal, useMagneticButton, useCounterAnimation } from '@/hooks/useAnimations';
import { supabase } from '@/lib/supabase';

const pillars = [
    {
        icon: TrendingUp,
        name: 'Economy',
        desc: "GDP, growth, inflation, trade — India's economic engine, measured against the world.",
    },
    {
        icon: Users,
        name: 'Society',
        desc: 'Life expectancy, literacy, equity — the human story behind the headline numbers.',
    },
    {
        icon: Landmark,
        name: 'Governance',
        desc: 'Institutions, public debt, rule of law — how the country is actually run.',
    },
    {
        icon: Cpu,
        name: 'Technology',
        desc: "Internet reach, R&D spend, patents — where India stands in tomorrow's race.",
    },
];

const sources = ['World Bank', 'United Nations', 'World Health Organization', 'IMF'];

// Local photos — files live in public/images/about/
const gallery = [
    {
        url: '/images/about/taj-mahal.avif',
        place: 'Taj Mahal',
        location: 'Agra, Uttar Pradesh',
        fact: 'A UNESCO World Heritage Site, built in 1653 by Emperor Shah Jahan.',
    },
    {
        url: '/images/about/himalayas.avif',
        place: 'The Himalayas',
        location: 'Northern India',
        fact: 'Home to the world\'s highest peaks and the source of the Ganges.',
    },
    {
        url: '/images/about/kerala-backwaters.avif',
        place: 'Backwaters',
        location: 'Kerala',
        fact: 'A network of lagoons and canals running parallel to the Arabian Sea coast.',
    },
    {
        url: '/images/about/holi.avif',
        place: 'Holi',
        location: 'Celebrated nationwide',
        fact: 'The festival of colour marking the arrival of spring.',
    },
    {
        url: '/images/about/jaipur.avif',
        place: 'Hawa Mahal',
        location: 'Jaipur, Rajasthan',
        fact: 'The "Palace of Winds," built in 1799 with 953 small windows.',
    },
    {
        url: '/images/about/varanasi.avif',
        place: 'Varanasi',
        location: 'Uttar Pradesh',
        fact: 'One of the oldest continuously inhabited cities in the world.',
    },
];

const facts = [
    { icon: Users, value: '1.4B+', label: 'People' },
    { icon: Languages, value: '22', label: 'Official languages' },
    { icon: MapPin, value: '28', label: 'States, 8 union territories' },
];

// Live indicators pulled for India — indicator_id must match your `indicators` table.
const snapshotIndicators = [
    { id: 'gdp_rank', label: 'GDP', unit: 'USD', icon: TrendingUp, photo: '/images/about/jaipur.avif' },
    { id: 'life_expectancy', label: 'Life Expectancy', unit: 'years', icon: Users, photo: '/images/about/varanasi.avif' },
    { id: 'literacy_rate', label: 'Literacy Rate', unit: '%', icon: Landmark, photo: '/images/about/kerala-backwaters.avif' },
    { id: 'internet_penetration', label: 'Internet Penetration', unit: '%', icon: Cpu, photo: '/images/about/himalayas.avif' },
];

type SnapshotRow = {
    id: string;
    label: string;
    unit: string;
    icon: typeof TrendingUp;
    photo: string;
    value: number | null;
    rank: number | null;
};

function formatValue(value: number, unit: string) {
    if (unit === 'USD') {
        if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
        if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
        return `$${value.toLocaleString()}`;
    }
    if (unit === '%') return `${value.toFixed(1)}%`;
    if (unit === 'years') return `${value.toFixed(1)} yrs`;
    return value.toLocaleString();
}

function IndiaSnapshot() {
    const [rows, setRows] = useState<SnapshotRow[] | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            const ids = snapshotIndicators.map((s) => s.id);
            const { data, error } = await supabase
                .from('rankings')
                .select('indicator_id, value, rank, year')
                .eq('country_id', 'IN')
                .in('indicator_id', ids)
                .order('year', { ascending: false });

            if (cancelled) return;

            if (error || !data) {
                setRows(snapshotIndicators.map((s) => ({ ...s, value: null, rank: null })));
                return;
            }

            const latestByIndicator = new Map<string, { value: number; rank: number | null }>();
            for (const row of data) {
                if (!latestByIndicator.has(row.indicator_id)) {
                    latestByIndicator.set(row.indicator_id, { value: row.value, rank: row.rank });
                }
            }

            setRows(
                snapshotIndicators.map((s) => {
                    const found = latestByIndicator.get(s.id);
                    return { ...s, value: found?.value ?? null, rank: found?.rank ?? null };
                })
            );
        }

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <section className="px-4 py-16">
            <div className="max-w-5xl mx-auto">
                <div className="reveal text-center mb-12">
                    <h2 className="font-serif text-3xl font-bold text-primary mb-3">
                        India, <span className="gradient-text-tricolor">at a Glance</span>
                    </h2>
                    <p className="text-secondary max-w-xl mx-auto">
                        A quick overview of selected indicators highlighting India's
                        current position across key areas of development.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                    {(rows ?? snapshotIndicators.map((s) => ({ ...s, value: null, rank: null }))).map(
                        (item, i) => (
                            <div
                                key={item.id}
                                className={`glass-card rounded-2xl overflow-hidden flex ${i % 2 === 0 ? 'reveal-left' : 'reveal-right'
                                    }`}
                            >
                                <div className="w-28 sm:w-36 flex-shrink-0">
                                    <img
                                        src={item.photo}
                                        alt=""
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="p-5 flex flex-col justify-center min-w-0">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <item.icon size={15} className="text-saffron-500 flex-shrink-0" />
                                        <span className="text-xs uppercase tracking-wider text-muted truncate">
                                            {item.label}
                                        </span>
                                    </div>
                                    {rows === null ? (
                                        <div className="skeleton h-7 w-24 rounded-md" />
                                    ) : item.value === null ? (
                                        <span className="text-sm text-muted">Not yet available</span>
                                    ) : (
                                        <>
                                            <div className="font-serif text-2xl font-bold text-primary">
                                                {formatValue(item.value, item.unit)}
                                            </div>
                                            {item.rank !== null && (
                                                <div className="text-xs text-secondary mt-0.5">
                                                    Global rank #{item.rank}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </section>
    );
}

function StatCounter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
    const ref = useCounterAnimation(value);
    return (
        <div className="text-center">
            <div className="text-3xl sm:text-4xl font-serif font-bold gradient-text-saffron">
                <span ref={ref}>0</span>
                {suffix}
            </div>
            <div className="text-xs text-muted mt-1 uppercase tracking-wider">{label}</div>
        </div>
    );
}

export default function AboutPage() {
    useScrollReveal();
    const ctaRef = useRef<HTMLAnchorElement>(null);
    useMagneticButton(ctaRef);

    return (
        <div className="bg-base min-h-screen pt-20">
            {/* ── HERO ── */}
            <section className="relative overflow-hidden px-4 py-24 md:py-32">
                <div
                    className="absolute -top-20 -left-20 w-96 h-96 rounded-full animate-blob"
                    style={{ background: 'radial-gradient(circle, #FF9933 0%, transparent 70%)', opacity: 'var(--blob-opacity)' }}
                />
                <div
                    className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full animate-blob-delayed"
                    style={{ background: 'radial-gradient(circle, #138808 0%, transparent 70%)', opacity: 'var(--blob-opacity)' }}
                />

                <svg
                    className="absolute top-10 right-10 opacity-[0.08] animate-spin-slow pointer-events-none hidden md:block"
                    width="360"
                    height="360"
                    viewBox="0 0 200 200"
                >
                    <circle cx="100" cy="100" r="90" fill="none" stroke="#000080" strokeWidth="2" />
                    <circle cx="100" cy="100" r="6" fill="#000080" />
                    {Array.from({ length: 24 }).map((_, i) => {
                        const angle = (i * 360) / 24;
                        const rad = (angle * Math.PI) / 180;
                        const x1 = 8 * Math.cos(rad);
                        const y1 = 8 * Math.sin(rad);
                        const x2 = 85 * Math.cos(rad);
                        const y2 = 85 * Math.sin(rad);
                        return (
                            <line
                                key={i}
                                x1={100 + x1}
                                y1={100 + y1}
                                x2={100 + x2}
                                y2={100 + y2}
                                stroke="#000080"
                                strokeWidth="1.5"
                            />
                        );
                    })}
                </svg>

                <div className="relative z-10 max-w-3xl mx-auto text-center">
                    <div className="reveal inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-saffron-500/30 mb-8">
                        <Sparkles size={14} className="text-saffron-500" />
                        <span className="text-xs text-primary font-medium tracking-wide">
                            About this dashboard
                        </span>
                    </div>

                    <h1 className="reveal font-serif text-4xl sm:text-6xl font-bold leading-tight mb-6">
                        <span className="block text-primary">Where does India</span>
                        <span className="block gradient-text-tricolor">actually stand?</span>
                    </h1>

                    <p className="reveal text-lg text-secondary max-w-xl mx-auto leading-relaxed">
                        Explore India's performance across internationally recognized
                        development indicators, including the economy, education,
                        healthcare, technology, governance, and more—all presented
                        through an interactive dashboard for easy comparison.
                    </p>
                </div>
            </section>

            {/* ── PHOTO GALLERY: A GLIMPSE OF INDIA ── */}
            <section className="px-4 py-16">
                <div className="max-w-6xl mx-auto">
                    <div className="reveal text-center mb-10">
                        <h2 className="font-serif text-3xl font-bold text-primary mb-3">
                            A glimpse of <span className="gradient-text-tricolor">Incredible India</span>
                        </h2>
                        <p className="text-secondary max-w-xl mx-auto">
                            Behind every ranking is a real, vast, endlessly varied country.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                        {gallery.map((img, i) => (
                            <div
                                key={img.place}
                                className={
                                    'reveal-scale relative rounded-2xl overflow-hidden group flex flex-col justify-end' +
                                    (i === 0 ? ' row-span-2' : '')
                                }
                                style={{ aspectRatio: i === 0 ? '4/5' : '1/1' }}
                            >
                                <img
                                    src={img.url}
                                    alt={img.place}
                                    loading="lazy"
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                {/* Always-visible gradient so text stays readable */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

                                <div className="relative z-10 p-3 sm:p-4">
                                    <div className="flex items-center gap-1 text-white/70 text-[10px] uppercase tracking-wider mb-0.5">
                                        <MapPin size={10} />
                                        {img.location}
                                    </div>
                                    <div className="text-white font-serif font-bold text-sm sm:text-base leading-tight mb-1">
                                        {img.place}
                                    </div>
                                    <p className="text-white/80 text-[11px] sm:text-xs leading-snug opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-20 transition-all duration-300 overflow-hidden">
                                        {img.fact}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── QUICK FACTS STRIP ── */}
            <section className="px-4 py-10">
                <div className="reveal-scale max-w-4xl mx-auto glass rounded-2xl p-8 grid grid-cols-3 gap-4 sm:gap-8 border" style={{ borderColor: 'var(--glass-border)' }}>
                    {facts.map((f) => (
                        <div key={f.label} className="text-center">
                            <f.icon size={20} className="text-saffron-500 mx-auto mb-2" />
                            <div className="text-2xl sm:text-3xl font-serif font-bold text-primary">{f.value}</div>
                            <div className="text-xs text-muted mt-1 uppercase tracking-wider">{f.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── LIVE INDIA SNAPSHOT (fetched from your Supabase data) ── */}
            <IndiaSnapshot />

            {/* ── WHAT / WHY ── */}
            <section className="px-4 py-16">
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
                    <div className="reveal-left glass-card rounded-2xl p-8">
                        <h2 className="font-serif text-2xl font-bold mb-3 text-primary">
                            Understanding India's Global Performance
                        </h2>
                        <p className="text-secondary leading-relaxed">
                            India is one of the world's fastest-growing economies and one
                            of its most diverse nations. This dashboard brings together
                            multiple internationally recognized indicators to provide a
                            comprehensive view of India's performance across economic,
                            social, technological, and governance dimensions while enabling
                            comparisons with countries around the world.
                        </p>
                    </div>
                    <div className="reveal-right glass-card rounded-2xl p-8">
                        <h2 className="font-serif text-2xl font-bold mb-3 text-primary">
                            Reliable Public Data
                        </h2>
                        <p className="text-secondary leading-relaxed">
                            The dashboard is built using publicly available datasets
                            published by internationally recognized organizations.
                            Presenting information from trusted sources in one place helps
                            users explore global trends and compare countries through a
                            consistent and easy-to-understand interface.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── PILLARS ── */}
            <section className="px-4 py-16">
                <div className="max-w-5xl mx-auto">
                    <h2 className="reveal font-serif text-3xl font-bold text-center mb-12 text-primary">
                        Four lenses on one country
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-5">
                        {pillars.map((p, i) => (
                            <div
                                key={p.name}
                                className={`glass-card rounded-2xl p-6 ${i % 2 === 0 ? 'reveal-left' : 'reveal-right'}`}
                            >
                                <div
                                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                                    style={{ background: 'rgba(255,153,51,0.12)' }}
                                >
                                    <p.icon size={20} className="text-saffron-500" />
                                </div>
                                <h3 className="font-serif text-xl font-bold mb-1.5 text-primary">
                                    {p.name}
                                </h3>
                                <p className="text-sm text-secondary leading-relaxed">{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── DATA STATS STRIP ── */}
            <section className="px-4 py-16">
                <div className="reveal-scale max-w-2xl mx-auto glass rounded-2xl p-8 grid grid-cols-3 gap-4 sm:gap-8 border" style={{ borderColor: 'var(--glass-border)' }}>
                    <StatCounter value={19} suffix="+" label="Indicators" />
                    <StatCounter value={230} suffix="+" label="Countries" />
                    <StatCounter value={4} suffix="" label="Categories" />
                </div>
            </section>

            {/* ── SOURCES ── */}
            <section className="px-4 py-16">
                <div className="reveal max-w-3xl mx-auto text-center">
                    <div className="flex justify-center mb-5">
                        <div
                            className="w-11 h-11 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(19,136,8,0.12)' }}
                        >
                            <Database size={18} style={{ color: '#138808' }} />
                        </div>
                    </div>
                    <h2 className="font-serif text-2xl font-bold mb-3 text-primary">
                        Trusted Global Data Sources
                    </h2>
                    <p className="text-secondary mb-8">
                        The dashboard brings together information from internationally
                        recognized organizations to provide consistent and reliable
                        global indicators.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {sources.map((s) => (
                            <span
                                key={s}
                                className="glass text-sm px-4 py-2 rounded-full text-primary border"
                                style={{ borderColor: 'var(--glass-border)' }}
                            >
                                {s}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CLOSING CTA ── */}
            <section className="px-4 py-24 text-center">
                <h2 className="reveal font-serif text-3xl sm:text-4xl font-bold mb-8 max-w-xl mx-auto text-primary">
                    Explore India's progress through global data.
                </h2>
                <Link
                    ref={ctaRef}
                    to="/dashboard"
                    className="btn-shine magnetic reveal group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white shadow-2xl transition-all duration-300"
                    style={{ background: 'linear-gradient(135deg, #FF9933, #e67e00)' }}
                >
                    Explore the Dashboard
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </section>
        </div>
    );
}