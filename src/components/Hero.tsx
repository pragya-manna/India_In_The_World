import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Globe2, TrendingUp, ChevronDown } from 'lucide-react';
import { useCounterAnimation, useMagneticButton } from '@/hooks/useAnimations';

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

export function Hero() {
  const magneticRef = useRef<HTMLAnchorElement>(null);
  const magneticRef2 = useRef<HTMLAnchorElement>(null);
  useMagneticButton(magneticRef);
  useMagneticButton(magneticRef2);

  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
      {/* ── Background: Animated Indian Flag Wave ── */}
      <div
        className="absolute inset-0 z-0"
        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
      >
        <svg
          viewBox="0 0 1200 800"
          className="w-full h-full flag-wave"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="saffronGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF9933" />
              <stop offset="100%" stopColor="#FFB347" />
            </linearGradient>
            <filter id="waveDistort">
              <feTurbulence type="fractalNoise" baseFrequency="0.008 0.02" numOctaves="2" seed="3">
                <animate attributeName="baseFrequency" values="0.008 0.02;0.012 0.025;0.008 0.02" dur="6s" repeatCount="indefinite" />
              </feTurbulence>
              <feDisplacementMap in="SourceGraphic" scale="30" />
            </filter>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Saffron stripe */}
          <g filter="url(#waveDistort)">
            <rect x="0" y="100" width="1200" height="200" fill="url(#saffronGrad)" opacity="0.85" />
            <rect x="0" y="300" width="1200" height="200" fill="#ffffff" opacity="0.7" />
            <rect x="0" y="500" width="1200" height="200" fill="#138808" opacity="0.85" />
          </g>

          {/* Ashoka Chakra */}
          <g filter="url(#glow)">
            <g transform="translate(600, 400)">
              <circle cx="0" cy="0" r="80" fill="none" stroke="#000080" strokeWidth="4" opacity="0.9" />
              <circle cx="0" cy="0" r="10" fill="#000080" />
              <g className="animate-spin-slow" style={{ transformOrigin: 'center' }}>
                {Array.from({ length: 24 }).map((_, i) => {
                  const angle = (i * 360) / 24;
                  const rad = (angle * Math.PI) / 180;
                  const x1 = 12 * Math.cos(rad);
                  const y1 = 12 * Math.sin(rad);
                  const x2 = 75 * Math.cos(rad);
                  const y2 = 75 * Math.sin(rad);
                  return (
                    <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke="#000080" strokeWidth="2" opacity="0.9" />
                  );
                })}
              </g>
            </g>
          </g>
        </svg>
      </div>

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 z-1 flag-overlay" />

      {/* ── Content ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        {/* Badge */}
        <div className="reveal inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-saffron-500/30 mb-8">
          <Sparkles size={14} className="text-saffron-500" />
          <span className="text-xs text-primary font-medium tracking-wide">
            A Global Progress Dashboard
          </span>
        </div>

        {/* Title */}
        <h1 className="reveal font-serif text-5xl sm:text-7xl lg:text-8xl font-bold leading-tight mb-4">
          <span className="block text-primary">India</span>
          <span className="block gradient-text-tricolor">in the World</span>
        </h1>

        {/* Subtitle */}
        <p className="reveal text-lg sm:text-xl text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
          Explore India's rankings across 60+ international indices. Compare with any country.
          Analyze trends. Generate AI insights. Understand where India stands — and where it should go next.
        </p>

        {/* CTAs */}
        <div className="reveal flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            ref={magneticRef}
            to="/dashboard"
            className="btn-shine magnetic group flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white shadow-2xl transition-all duration-300"
            style={{ background: 'linear-gradient(135deg, #FF9933, #e67e00)' }}
          >
            Explore Dashboard
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            ref={magneticRef2}
            to="/compare"
            className="btn-shine magnetic group flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-primary border glass transition-all duration-300 hover:border-saffron-500/50"
            style={{ borderColor: 'var(--glass-border)' }}
          >
            <Globe2 size={18} />
            Compare Countries
          </Link>
        </div>

        {/* Stats */}
        <div className="reveal grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto glass rounded-2xl p-6 border" style={{ borderColor: 'var(--glass-border)' }}>
          <StatCounter value={60} suffix="+" label="Indicators" />
          <StatCounter value={56} suffix="" label="Countries" />
          <StatCounter value={10} suffix="" label="Categories" />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <ChevronDown size={28} className="text-muted animate-bounce" />
      </div>
    </section>
  );
}
