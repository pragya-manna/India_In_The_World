import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from '@/hooks/useTheme';
import { CursorGlow } from '@/components/CursorGlow';
import { FloatingBlobs } from '@/components/Animations';
import { Navbar } from '@/components/Navbar';
import { HomePage } from '@/pages/HomePage';
import { DashboardPage } from '@/pages/DashboardPage';
import { CategoryPage } from '@/pages/CategoryPage';
import { ComparePage } from '@/pages/ComparePage';
import { InsightsPage } from '@/pages/InsightsPage';
import { DataPage } from '@/pages/DataPage';
import AboutPage from './pages/AboutPage';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/data" element={<DataPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function Footer() {
  return (
    <footer
      className="relative z-10 border-t py-12 px-4 glass"
      style={{ borderColor: 'var(--footer-border)' }}
    >
      <div className="max-w-screen-xl mx-auto">
        <div className="grid sm:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#FF9933" strokeWidth="4" />
                  <circle cx="50" cy="50" r="7" fill="#FF9933" />
                </svg>
              </div>
              <span className="font-serif font-bold text-primary">India in the World</span>
            </div>
            <p className="text-sm text-secondary">
              A global progress dashboard consolidating international indices to understand where India stands.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-primary mb-3">Data Sources</h4>
            <ul className="text-xs text-muted space-y-1">
              <li>World Bank · IMF · UN · UNDP</li>
              <li>WHO · UNESCO · OECD · WEF</li>
              <li>Transparency International · WIPO</li>
              <li>Reporters Without Borders · Oxford Insights</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-primary mb-3">Explore</h4>
            <ul className="text-xs text-muted space-y-1">
              <li><a href="/dashboard" className="hover:text-saffron-500 transition-colors">Dashboard</a></li>
              <li><a href="/compare" className="hover:text-saffron-500 transition-colors">Country Comparison</a></li>
              <li><a href="/insights" className="hover:text-saffron-500 transition-colors">AI Insights</a></li>
              <li><a href="/data" className="hover:text-saffron-500 transition-colors">Data Management</a></li>
            </ul>
          </div>
        </div>
        <div className="india-stripe w-full mb-6" />
        <p className="text-center text-xs text-muted">
          Built for India. Data from trusted international sources. © 2024 India in the World Dashboard.
        </p>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="relative min-h-screen bg-base text-primary overflow-x-hidden">
          <FloatingBlobs />
          <CursorGlow />
          <Navbar />
          <main className="relative z-10">
            <AnimatedRoutes />
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}
