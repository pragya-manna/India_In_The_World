import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Globe, Sun, Moon, Search, Bell, Menu, X,
  TrendingUp, Users, Landmark, Cpu, GraduationCap,
  HeartPulse, Leaf, Shield, Scale, LayoutDashboard, Database,
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { MusicButton } from '@/components/MusicButton';

const navLinks = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Compare', href: '/compare', icon: Globe },
  { label: 'Economy', href: '/category/economy', icon: TrendingUp },
  { label: 'Society', href: '/category/society', icon: Users },
  { label: 'Governance', href: '/category/governance', icon: Landmark },
  { label: 'Technology', href: '/category/technology', icon: Cpu },
  { label: 'Education', href: '/category/education', icon: GraduationCap },
  { label: 'Healthcare', href: '/category/healthcare', icon: HeartPulse },
  { label: 'Environment', href: '/category/environment', icon: Leaf },
  { label: 'Safety', href: '/category/safety', icon: Shield },
  { label: 'Equality', href: '/category/equality', icon: Scale },
  { label: 'AI Insights', href: '/insights', icon: Cpu },
  { label: 'Data', href: '/data', icon: Database },
];

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isDark = theme === 'dark';

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-40 transition-all duration-500"
        style={scrolled ? { background: 'var(--nav-bg-scrolled)', backdropFilter: 'blur(20px)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' } : undefined}
      >
        {/* Top india stripe */}
        <div className="india-stripe w-full" />

        <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#FF9933" strokeWidth="4" />
                <circle cx="50" cy="50" r="7" fill="#FF9933" />
                {Array.from({ length: 24 }).map((_, i) => {
                  const angle = (i * 360) / 24;
                  const rad = (angle * Math.PI) / 180;
                  const x1 = 50 + 10 * Math.cos(rad);
                  const y1 = 50 + 10 * Math.sin(rad);
                  const x2 = 50 + 40 * Math.cos(rad);
                  const y2 = 50 + 40 * Math.sin(rad);
                  return (
                    <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke="#000080" strokeWidth="1.5" />
                  );
                })}
              </svg>
            </div>
            <div>
              <div className="font-serif font-bold text-lg leading-tight text-primary">
                India<span className="gradient-text-saffron"> in the</span>
              </div>
              <div className="text-xs font-medium -mt-1 text-muted">
                World Dashboard
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.slice(0, 6).map((link) => {
              const active = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                    active
                      ? 'bg-saffron-500/20 text-saffron-500'
                      : 'text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  <link.icon size={14} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <MusicButton />

            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-xl transition-all text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/10"
            >
              <Search size={18} />
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl transition-all text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/10"
              title="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Mobile menu */}
            <button
              className="lg:hidden p-2 rounded-xl transition-all text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/10"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t px-4 py-3" style={{ borderColor: 'var(--glass-border)' }}>
            <div className="max-w-2xl mx-auto relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Try "India corruption rank" or "HDI trend"...'
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all text-primary placeholder:text-muted border focus:border-saffron-500/50"
                style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)' }}
              />
            </div>
          </div>
        )}
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div
            className="absolute top-0 right-0 h-full w-72 shadow-2xl pt-20 pb-8 overflow-y-auto bg-surface"
          >
            <div className="px-4 space-y-1">
              {navLinks.map((link) => {
                const active = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'bg-saffron-500/20 text-saffron-500'
                        : 'text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/10'
                    }`}
                  >
                    <link.icon size={16} />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
