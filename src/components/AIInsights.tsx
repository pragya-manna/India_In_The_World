import { useState, useRef } from 'react';
import { Sparkles, Send, Bot, User, FileText, TrendingUp, Lightbulb } from 'lucide-react';
import type { AIInsight, Indicator, Category } from '@/lib/supabase';
import { useMagneticButton } from '@/hooks/useAnimations';

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
        "Namaste! I'm your AI insights assistant. Ask me about India's rankings, trends, or request an annual report card. Try: 'How is India doing on innovation?' or 'Generate a report card for Economy'.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const sendRef = useRef<HTMLButtonElement>(null);
  useMagneticButton(sendRef);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setMessages((m) => [...m, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    // Simulate AI response using available insights
    await new Promise((r) => setTimeout(r, 800));

    const lower = userMsg.toLowerCase();
    let response = '';

    // Match keywords to insights
    const matchedInsight = insights.find((ins) => {
      const ind = indicators.find((i) => i.id === ins.indicator_id);
      const cat = categories.find((c) => c.id === ins.category_id);
      const text = `${ind?.name || ''} ${cat?.name || ''} ${ins.content}`.toLowerCase();
      return lower.split(' ').some((w) => w.length > 3 && text.includes(w));
    });

    if (matchedInsight) {
      response = matchedInsight.content;
    } else if (lower.includes('report card') || lower.includes('annual')) {
      const cat = categories.find((c) => lower.includes(c.slug) || lower.includes(c.name.toLowerCase()));
      if (cat) {
        const catInsights = insights.filter((i) => i.category_id === cat.id);
        response = `📊 Annual Report Card: ${cat.name}\n\n${catInsights.map((i) => `• ${i.content}`).join('\n\n') || 'No specific insights available yet for this category.'}\n\nOverall: India shows mixed performance in ${cat.name}. See detailed indicators for more.`;
      } else {
        response = `📊 India Annual Report Card\n\n${insights.map((i) => `• ${i.content}`).join('\n\n')}`;
      }
    } else if (lower.includes('improve') || lower.includes('weak') || lower.includes('area')) {
      response = "India's key areas for improvement based on global rankings:\n\n• Environmental Performance (168th) - air quality and emissions need urgent attention\n• Gender Gap (129th) - women's economic participation is low\n• Happiness (126th) - quality of life and social support need strengthening\n• HDI (134th) - health and education access remain priorities\n\nIndia's strengths: GDP growth (#1), GDP PPP rank (#3), Innovation (#39 among emerging economies).";
    } else {
      response =
        "I can help you understand India's global rankings. Here are some things you can ask:\n\n• 'Show India's HDI trend'\n• 'How is India's innovation ranking?'\n• 'Generate a report card for Economy'\n• 'Where should India improve?'\n• 'Compare India with China'";
    }

    setMessages((m) => [...m, { role: 'ai', content: response }]);
    setLoading(false);
  };

  return (
    <section className="py-20 px-4 max-w-screen-xl mx-auto">
      <div className="text-center mb-12">
        <div className="reveal inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-saffron-500/30 mb-4">
          <Sparkles size={14} className="text-saffron-500" />
          <span className="text-xs text-primary font-medium">AI-Powered</span>
        </div>
        <h2 className="reveal font-serif text-4xl font-bold mb-3 text-primary">
          AI <span className="gradient-text-saffron">Insights</span> & Summaries
        </h2>
        <p className="reveal text-secondary max-w-2xl mx-auto">
          Ask questions, generate report cards, and get data-driven insights about India's global performance.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chat */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 flex flex-col" style={{ minHeight: '500px' }}>
          <div className="flex items-center gap-2 mb-4 pb-4 border-b" style={{ borderColor: 'var(--glass-border)' }}>
            <Bot size={20} className="text-saffron-500" />
            <h3 className="font-serif font-bold text-primary">AI Assistant</h3>
            <span className="ml-auto text-xs text-muted">Powered by AI</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2" style={{ maxHeight: '380px' }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-saffron-500/20 text-saffron-400' : 'bg-india-navy/30 text-blue-300'
                  }`}
                >
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div
                  className={`max-w-md rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-saffron-500/20 text-primary rounded-tr-sm'
                      : 'glass text-secondary rounded-tl-sm'
                  }`}
                  style={msg.role === 'ai' ? { borderColor: 'var(--glass-border)' } : undefined}
                >
                  {msg.content}
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
