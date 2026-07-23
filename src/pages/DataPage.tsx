import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Download, Upload, Database, RefreshCw, Plus,
  CheckCircle, XCircle, Loader2, FileText, Zap, Brain, Globe2,
} from 'lucide-react';
import { useScrollReveal } from '@/hooks/useAnimations';
import {
  supabase,
  type Category, type Indicator, type Country, type Ranking,
} from '@/lib/supabase';

type FetchLog = {
  indicator: string;
  status: 'pending' | 'fetching' | 'success' | 'error';
  message: string;
  count?: number;
};

const inputStyle = {
  background: 'var(--input-bg)',
  borderColor: 'var(--input-border)',
  color: 'var(--text-primary)',
} as const;

export function DataPage() {
  useScrollReveal();
  const [categories, setCategories] = useState<Category[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'worldbank' | 'csv' | 'manual' | 'ai'>('worldbank');
  const [fetchLogs, setFetchLogs] = useState<FetchLog[]>([]);
  const [fetching, setFetching] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvPreview, setCsvPreview] = useState<string[][] | null>(null);
  const [csvFileName, setCsvFileName] = useState('');
  const [csvImporting, setCsvImporting] = useState(false);
  const [csvResult, setCsvResult] = useState<{ success: boolean; count: number; error?: string } | null>(null);

  const [manualIndicator, setManualIndicator] = useState('');
  const [manualCountry, setManualCountry] = useState('IN');
  const [manualYear, setManualYear] = useState(new Date().getFullYear());
  const [manualValue, setManualValue] = useState('');
  const [manualRank, setManualRank] = useState('');
  const [manualResult, setManualResult] = useState<string | null>(null);

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiIndicator, setAiIndicator] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: cats }, { data: inds }, { data: ctrs }, { data: ranks }] = await Promise.all([
        supabase.from('categories').select('*').order('display_order'),
        supabase.from('indicators').select('*').order('display_order'),
        supabase.from('countries').select('*').order('name'),
        supabase.from('rankings').select('*'),
      ]);
      setCategories(cats || []);
      setIndicators(inds || []);
      setCountries(ctrs || []);
      setRankings(ranks || []);
      setLoading(false);
    })();
  }, []);

  const wbIndicators = indicators.filter((i) =>
    ['gdp_rank', 'gdp_ppp_rank', 'gdp_per_capita_rank', 'gdp_growth', 'inflation',
     'unemployment', 'public_debt_gdp', 'rd_expenditure', 'internet_penetration',
     'life_expectancy', 'infant_mortality', 'forest_cover', 'renewable_energy',
     'co2_per_capita', 'literacy_rate', 'female_labor', 'gini', 'urbanization_rate',
     'patents_per_million'].includes(i.id)
  );

  const fetchSingleIndicator = useCallback(async (indicatorId: string) => {
    setFetchLogs((prev) => [...prev, { indicator: indicatorId, status: 'fetching', message: 'Requesting from World Bank...' }]);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const response = await fetch(
        `${supabaseUrl}/functions/v1/fetch-world-bank?indicator=${indicatorId}&country=all&years=15`,
        { headers: { Authorization: `Bearer ${anonKey}` } }
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setFetchLogs((prev) =>
        prev.map((log, i) =>
          i === prev.length - 1
            ? { ...log, status: data.success ? 'success' : 'error', message: data.success ? `Fetched ${data.upserted} records, ranked ${data.ranked} countries` : data.error || 'Failed', count: data.upserted }
            : log
        )
      );
    } catch (err) {
      setFetchLogs((prev) =>
        prev.map((log, i) =>
          i === prev.length - 1
            ? { ...log, status: 'error', message: err instanceof Error ? err.message : 'Unknown error' }
            : log
        )
      );
    }
  }, []);

  const fetchAllWorldBank = async () => {
    setFetching(true);
    setFetchLogs([]);
    for (const ind of wbIndicators) {
      await fetchSingleIndicator(ind.id);
      await new Promise((r) => setTimeout(r, 300));
    }
    setFetching(false);
    const { count } = await supabase.from('rankings').select('*', { count: 'exact', head: true });
    setRankings(new Array(count || 0));
  };

  const handleCsvFile = (file: File) => {
    setCsvFileName(file.name);
    setCsvResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text.split('\n').map((row) => row.split(',').map((c) => c.trim()));
      setCsvPreview(rows.slice(0, 20));
    };
    reader.readAsText(file);
  };

  const importCsv = async () => {
    if (!csvPreview) return;
    setCsvImporting(true);
    setCsvResult(null);
    try {
      const rows = csvPreview.filter((r) => r.length >= 4 && r[0] && r[0] !== 'indicator_id');
      const records = rows.map((r) => ({
        indicator_id: r[0],
        country_id: r[1],
        year: parseInt(r[2]),
        value: parseFloat(r[3]) || null,
        rank: r[4] ? parseInt(r[4]) : null,
      })).filter((r) => r.indicator_id && r.country_id && !isNaN(r.year));

      const batchSize = 500;
      let total = 0;
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        const { error } = await supabase.from('rankings').upsert(batch, { onConflict: 'indicator_id,country_id,year' });
        if (error) throw error;
        total += batch.length;
      }
      setCsvResult({ success: true, count: total });
    } catch (err) {
      setCsvResult({ success: false, count: 0, error: err instanceof Error ? err.message : 'Import failed' });
    }
    setCsvImporting(false);
  };

  const downloadCsvTemplate = () => {
    const csv = 'indicator_id,country_id,year,value,rank\nhdi,IN,2024,0.644,134\nhdi,US,2024,0.920,10\ngdp_growth,IN,2024,7.0,1\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rankings-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const addManualEntry = async () => {
    setManualResult(null);
    try {
      const { error } = await supabase.from('rankings').upsert({
        indicator_id: manualIndicator,
        country_id: manualCountry,
        year: manualYear,
        value: manualValue ? parseFloat(manualValue) : null,
        rank: manualRank ? parseInt(manualRank) : null,
      }, { onConflict: 'indicator_id,country_id,year' });
      if (error) throw error;
      setManualResult(`Successfully added: ${manualIndicator} for ${manualCountry} (${manualYear})`);
      setManualValue('');
      setManualRank('');
    } catch (err) {
      setManualResult(`Error: ${err instanceof Error ? err.message : 'Failed'}`);
    }
  };

  const generateAiInsight = async () => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const response = await fetch(`${supabaseUrl}/functions/v1/ai-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${anonKey}` },
        body: JSON.stringify({
          prompt: aiPrompt || 'Generate a summary of India performance',
          indicator_id: aiIndicator || null,
          save: true,
        }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setAiResult(data.content || data.error || 'No result');
    } catch (err) {
      setAiResult(`Error: ${err instanceof Error ? err.message : 'Failed'}`);
    }
    setAiLoading(false);
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
      <Link to="/" className="reveal inline-flex items-center gap-2 text-sm text-secondary hover:text-primary mb-6 transition-colors">
        <ArrowLeft size={14} /> Back
      </Link>

      <div className="reveal mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-saffron-500/30 text-xs text-saffron-500 mb-3">
          <Database size={12} /> Data Management
        </div>
        <h1 className="font-serif text-4xl font-bold text-primary mb-2">
          Data <span className="gradient-text-saffron">Integration</span>
        </h1>
        <p className="text-secondary max-w-2xl">
          Fetch data from the World Bank API, import CSVs, add manual entries, and generate AI insights.
        </p>
      </div>

      <div className="reveal grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-primary">{indicators.length}</div>
          <div className="text-xs text-muted">Indicators</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-primary">{countries.length}</div>
          <div className="text-xs text-muted">Countries</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-primary">{rankings.length || '—'}</div>
          <div className="text-xs text-muted">Rankings</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-primary">{categories.length}</div>
          <div className="text-xs text-muted">Categories</div>
        </div>
      </div>

      <div className="reveal flex flex-wrap gap-2 mb-6">
        {[
          { id: 'worldbank' as const, label: 'World Bank API', icon: Globe2 },
          { id: 'csv' as const, label: 'CSV Import', icon: Upload },
          { id: 'manual' as const, label: 'Manual Entry', icon: Plus },
          { id: 'ai' as const, label: 'AI Insights', icon: Brain },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-saffron-500 text-white'
                : 'glass text-secondary hover:text-primary border'
            }`}
            style={activeTab !== tab.id ? { borderColor: 'var(--glass-border)' } : undefined}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* World Bank Tab */}
      {activeTab === 'worldbank' && (
        <div className="reveal glass-card rounded-3xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="font-serif font-bold text-lg text-primary mb-1">World Bank Data Fetcher</h3>
              <p className="text-sm text-muted">
                Fetches real data from the World Bank API for {wbIndicators.length} mapped indicators. No API key needed.
              </p>
            </div>
            <button
              onClick={fetchAllWorldBank}
              disabled={fetching}
              className="btn-shine flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #FF9933, #e67e00)' }}
            >
              {fetching ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
              {fetching ? 'Fetching...' : 'Fetch All'}
            </button>
          </div>

          <div className="mb-4 p-3 rounded-xl glass text-xs text-muted">
            <strong className="text-secondary">How it works:</strong> The edge function calls the World Bank API
            (<code className="text-saffron-500">api.worldbank.org/v2</code>), fetches the last 15 years of data
            for all countries, upserts into the <code className="text-saffron-500">rankings</code> table, and
            computes global ranks for the latest year.
          </div>

          {fetchLogs.length > 0 && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {fetchLogs.map((log, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg glass text-sm">
                  {log.status === 'fetching' && <Loader2 size={16} className="animate-spin text-saffron-500" />}
                  {log.status === 'success' && <CheckCircle size={16} className="text-green-500" />}
                  {log.status === 'error' && <XCircle size={16} className="text-red-500" />}
                  <span className="text-secondary font-mono text-xs">{log.indicator}</span>
                  <span className="text-muted text-xs ml-auto">{log.message}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6">
            <h4 className="text-xs text-muted uppercase tracking-wider mb-3">Mapped Indicators</h4>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {wbIndicators.map((ind) => (
                <button
                  key={ind.id}
                  onClick={() => fetchSingleIndicator(ind.id)}
                  disabled={fetching}
                  className="btn-shine text-left px-3 py-2 rounded-lg glass text-xs text-secondary hover:text-primary transition-all border hover:border-saffron-500/20 disabled:opacity-50"
                  style={{ borderColor: 'var(--glass-border)' }}
                >
                  <RefreshCw size={10} className="inline mr-1 text-saffron-500" />
                  {ind.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Tab */}
      {activeTab === 'csv' && (
        <div className="reveal glass-card rounded-3xl p-6">
          <h3 className="font-serif font-bold text-lg text-primary mb-1">CSV Import</h3>
          <p className="text-sm text-muted mb-6">
            Upload a CSV file with ranking data. Expected format: <code className="text-saffron-500">indicator_id, country_id, year, value, rank</code>
          </p>

          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={downloadCsvTemplate}
              className="btn-shine flex items-center gap-2 px-4 py-2 rounded-xl glass text-sm text-primary border hover:border-saffron-500/30 transition-all"
              style={{ borderColor: 'var(--glass-border)' }}
            >
              <Download size={14} /> Download Template
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-shine flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #FF9933, #e67e00)' }}
            >
              <Upload size={14} /> Choose CSV File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleCsvFile(e.target.files[0])}
            />
          </div>

          {csvFileName && (
            <div className="mb-4">
              <div className="flex items-center gap-2 text-sm text-secondary mb-3">
                <FileText size={14} className="text-saffron-500" />
                {csvFileName}
              </div>

              {csvPreview && (
                <div className="overflow-x-auto mb-4">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-muted border-b" style={{ borderColor: 'var(--glass-border)' }}>
                        <th className="text-left py-2 px-3">Indicator ID</th>
                        <th className="text-left py-2 px-3">Country ID</th>
                        <th className="text-left py-2 px-3">Year</th>
                        <th className="text-left py-2 px-3">Value</th>
                        <th className="text-left py-2 px-3">Rank</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.slice(1, 10).map((row, i) => (
                        <tr key={i} className="text-secondary border-b" style={{ borderColor: 'var(--glass-border)' }}>
                          {row.map((cell, j) => (
                            <td key={j} className="py-1.5 px-3 font-mono">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <button
                onClick={importCsv}
                disabled={csvImporting}
                className="btn-shine flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #138808, #0a6606)' }}
              >
                {csvImporting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                {csvImporting ? 'Importing...' : 'Import Data'}
              </button>
            </div>
          )}

          {csvResult && (
            <div className={`p-4 rounded-xl text-sm ${csvResult.success ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              {csvResult.success ? `Successfully imported ${csvResult.count} records!` : `Import failed: ${csvResult.error}`}
            </div>
          )}

          <div className="mt-6 p-4 rounded-xl glass text-xs text-muted space-y-2">
            <p><strong className="text-secondary">Country IDs:</strong> Use ISO3 codes (IN, US, CN, DE, etc.)</p>
            <p><strong className="text-secondary">Indicator IDs:</strong> Use the slug from the indicators table (hdi, gdp_growth, etc.)</p>
            <p><strong className="text-secondary">Sources for CSV data:</strong></p>
            <ul className="ml-4 space-y-1 text-muted">
              <li>UNDP HDI: https://hdr.undp.org/data-center</li>
              <li>World Happiness: https://worldhappiness.report/data/</li>
              <li>Transparency Intl: https://www.transparency.org/en/cpi</li>
              <li>EPI Yale: https://epi.yale.edu/</li>
              <li>Global Peace Index: https://www.visionofhumanity.org/</li>
              <li>Gender Gap WEF: https://www.weforum.org/reports/global-gender-gap-report</li>
              <li>Democracy Index: https://www.eiu.com/n/campaigns/democracy-index-2024</li>
              <li>Global Innovation: https://www.wipo.int/global_innovation_index/</li>
              <li>AI Readiness: https://oxfordinsights.com/ai-readiness-index/</li>
              <li>E-Government: https://publicadministration.un.org/egovkb/</li>
            </ul>
          </div>
        </div>
      )}

      {/* Manual Entry Tab */}
      {activeTab === 'manual' && (
        <div className="reveal glass-card rounded-3xl p-6">
          <h3 className="font-serif font-bold text-lg text-primary mb-1">Manual Data Entry</h3>
          <p className="text-sm text-muted mb-6">Add individual ranking records directly.</p>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Indicator</label>
              <select
                value={manualIndicator}
                onChange={(e) => setManualIndicator(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border focus:border-saffron-500/50"
                style={inputStyle}
              >
                <option value="">Select indicator...</option>
                {categories.map((cat) => (
                  <optgroup key={cat.id} label={cat.name}>
                    {indicators.filter((i) => i.category_id === cat.id).map((i) => (
                      <option key={i.id} value={i.id} style={{ background: 'var(--bg-elevated)' }}>{i.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Country</label>
              <select
                value={manualCountry}
                onChange={(e) => setManualCountry(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border focus:border-saffron-500/50"
                style={inputStyle}
              >
                {countries.map((c) => (
                  <option key={c.id} value={c.id} style={{ background: 'var(--bg-elevated)' }}>{c.flag_emoji} {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Year</label>
              <input
                type="number"
                value={manualYear}
                onChange={(e) => setManualYear(parseInt(e.target.value) || 2024)}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border focus:border-saffron-500/50"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Value</label>
              <input
                type="number"
                step="any"
                value={manualValue}
                onChange={(e) => setManualValue(e.target.value)}
                placeholder="e.g. 0.644"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border focus:border-saffron-500/50"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Global Rank (optional)</label>
              <input
                type="number"
                value={manualRank}
                onChange={(e) => setManualRank(e.target.value)}
                placeholder="e.g. 134"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border focus:border-saffron-500/50"
                style={inputStyle}
              />
            </div>
          </div>

          <button
            onClick={addManualEntry}
            disabled={!manualIndicator}
            className="btn-shine flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #FF9933, #e67e00)' }}
          >
            <Plus size={16} /> Add Record
          </button>

          {manualResult && (
            <div className="mt-4 p-3 rounded-xl text-sm glass text-secondary">{manualResult}</div>
          )}
        </div>
      )}

      {/* AI Insights Tab */}
      {activeTab === 'ai' && (
        <div className="reveal glass-card rounded-3xl p-6">
          <h3 className="font-serif font-bold text-lg text-primary mb-1">AI Insight Generator</h3>
          <p className="text-sm text-muted mb-6">
            Generate AI-powered insights from your data. Uses OpenAI if configured, otherwise generates rule-based summaries.
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Indicator (optional)</label>
              <select
                value={aiIndicator}
                onChange={(e) => setAiIndicator(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border focus:border-saffron-500/50"
                style={inputStyle}
              >
                <option value="">General insight (no specific indicator)</option>
                {indicators.map((i) => (
                  <option key={i.id} value={i.id} style={{ background: 'var(--bg-elevated)' }}>{i.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Prompt</label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. Summarize India's performance and suggest improvements"
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border focus:border-saffron-500/50 resize-none"
                style={inputStyle}
              />
            </div>
            <button
              onClick={generateAiInsight}
              disabled={aiLoading}
              className="btn-shine flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #FF9933, #e67e00)' }}
            >
              {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Brain size={16} />}
              {aiLoading ? 'Generating...' : 'Generate Insight'}
            </button>
          </div>

          {aiResult && (
            <div className="mt-6 p-4 rounded-xl glass text-sm text-secondary whitespace-pre-wrap border border-saffron-500/20">
              {aiResult}
            </div>
          )}

          <div className="mt-6 p-4 rounded-xl glass text-xs text-muted">
            <strong className="text-secondary">To enable real AI (GPT-4o):</strong>
            <p className="mt-1">Add your OpenAI API key as a Supabase secret named <code className="text-saffron-500">OPENAI_API_KEY</code>. Without it, the function generates rule-based insights from your database data.</p>
          </div>
        </div>
      )}
    </div>
  );
}
