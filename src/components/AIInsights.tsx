import { useState, useRef } from 'react';
import { Sparkles, Send, Bot, User, FileText, TrendingUp, Lightbulb } from 'lucide-react';
import type { AIInsight, Indicator, Category } from '@/lib/supabase';
import { useMagneticButton } from '@/hooks/useAnimations';
import ReactMarkdown from 'react-markdown';

interface AIInsightsProps {
  insights: AIInsight[];
  indicators: Indicator[];
  categories: Category[];
}

export function AIInsights({ insights, indicators, categories }: AIInsightsProps) {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([
    {
      role: 'ai',
      content:
        "Namaste! I'm Bharat AI, your India data assistant. Ask me about India's rankings, trends, or request an annual report card.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const sendRef = useRef<HTMLButtonElement>(null);
  useMagneticButton(sendRef);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: userMsg },
    ]);
    setInput('');
    setLoading(true);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const apiResponse = await fetch(
        `${supabaseUrl}/functions/v1/ai-insights`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${anonKey}`,
          },
          body: JSON.stringify({
            prompt: userMsg,
            save: false,
          }),
        }
      );

      const data = await apiResponse.json();

      if (!apiResponse.ok) {
        throw new Error(data.error || `HTTP ${apiResponse.status}`);
      }

      setMessages((messages) => [
        ...messages,
        { role: 'ai', content: data.content || 'No answer received.' },
      ]);
    } catch (error) {
      setMessages((messages) => [
        ...messages,
        {
          role: 'ai',
          content: `Sorry, I could not get an answer: ${error instanceof Error ? error.message : 'Unknown error'
            }`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 px-4 max-w-screen-xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-saffron-500/30 mb-4">
          <Sparkles size={14} className="text-saffron-500" />
          <span className="text-xs text-primary font-medium">AI-Powered</span>
        </div>
        <h2 className="font-serif text-4xl font-bold mb-3 text-primary">
          AI <span className="gradient-text-saffron">Insights</span> & Summaries
        </h2>
        <p className="text-secondary max-w-2xl mx-auto">
          Ask questions, generate report cards, and get data-driven insights about India's global performance.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chat */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 flex flex-col" style={{ minHeight: '500px' }}>
          <div className="flex items-center gap-2 mb-4 pb-4 border-b" style={{ borderColor: 'var(--glass-border)' }}>
            <Bot size={20} className="text-saffron-500" />
            <h3 className="font-serif font-bold text-primary">Bharat AI</h3>
            <span className="ml-auto text-xs text-muted">India's Data Assistant</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2" style={{ maxHeight: '380px' }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-saffron-500/20 text-saffron-400' : 'bg-india-navy/30 text-blue-300'
                    }`}
                >
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div
                  className={`max-w-md rounded-2xl px-4 py-3 text-sm ${msg.role === 'user'
                    ? 'bg-saffron-500/20 text-primary rounded-tr-sm'
                    : 'glass text-secondary rounded-tl-sm'
                    }`}
                  style={msg.role === 'ai' ? { borderColor: 'var(--glass-border)' } : undefined}
                >
                  {msg.role === 'ai' ? (
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => (
                          <h1 className="mb-3 text-xl font-serif font-bold text-primary">{children}</h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="mb-3 mt-5 text-lg font-serif font-bold text-primary">{children}</h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="mb-2 mt-4 text-base font-semibold text-primary">{children}</h3>
                        ),
                        p: ({ children }) => (
                          <p className="mb-3 leading-6 text-secondary">{children}</p>
                        ),
                        ul: ({ children }) => (
                          <ul className="mb-3 list-disc space-y-1 pl-5 text-secondary">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="mb-3 list-decimal space-y-1 pl-5 text-secondary">{children}</ol>
                        ),
                        li: ({ children }) => <li>{children}</li>,
                        strong: ({ children }) => (
                          <strong className="font-semibold text-primary">{children}</strong>
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-india-navy/30 flex items-center justify-center">
                  <Bot size={16} className="text-blue-300" />
                </div>
                <div className="glass rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-white/40 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about India's rankings..."
              className="flex-1 px-4 py-3 rounded-xl glass text-primary text-sm placeholder:text-muted outline-none border focus:border-saffron-500/50 transition-all"
              style={{ borderColor: 'var(--input-border)' }}
            />
            <button
              ref={sendRef}
              onClick={handleSend}
              className="btn-shine magnetic px-5 py-3 rounded-xl font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #FF9933, #e67e00)' }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>

        {/* Insight cards */}
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={16} className="text-saffron-500" />
              <h3 className="font-serif font-bold text-primary text-sm">Report Cards</h3>
            </div>
            <p className="text-xs text-muted mb-3">
              AI-generated annual summaries for each category.
            </p>
            <div className="space-y-2">
              {categories.slice(0, 4).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setInput(`Generate a report card for ${cat.name}`);
                    handleSend();
                  }}
                  className="btn-shine w-full text-left px-3 py-2 rounded-lg glass text-xs text-secondary hover:text-primary transition-all border hover:border-saffron-500/20"
                  style={{ borderColor: 'var(--glass-border)' }}
                >
                  <span className="font-medium">{cat.name}</span> Report Card
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={16} className="text-saffron-500" />
              <h3 className="font-serif font-bold text-primary text-sm">Quick Insights</h3>
            </div>
            <div className="space-y-2 text-xs text-muted">
              <button
                onClick={() => { setInput('Where should India improve?'); handleSend(); }}
                className="btn-shine block w-full text-left p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              >
                <TrendingUp size={12} className="inline mr-1 text-saffron-500" />
                Where should India improve?
              </button>
              <button
                onClick={() => { setInput('What are India strengths?'); handleSend(); }}
                className="btn-shine block w-full text-left p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              >
                <Sparkles size={12} className="inline mr-1 text-saffron-500" />
                What are India's strengths?
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
