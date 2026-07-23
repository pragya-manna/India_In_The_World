import { Link } from 'react-router-dom';
import {
  TrendingUp, Users, Landmark, Cpu, GraduationCap,
  HeartPulse, Leaf, Shield, Scale, Globe,
  ArrowRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Category } from '@/lib/supabase';

const iconMap: Record<string, LucideIcon> = {
  TrendingUp, Users, Landmark, Cpu, GraduationCap,
  HeartPulse, Leaf, Shield, Scale, Globe,
};

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section className="py-20 px-4 max-w-screen-xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="reveal font-serif text-4xl font-bold mb-3 text-primary">
          Explore by <span className="gradient-text-saffron">Category</span>
        </h2>
        <p className="reveal text-secondary max-w-2xl mx-auto">
          Ten thematic areas covering economy, society, governance, technology, and more.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {categories.map((cat, i) => {
          const Icon = iconMap[cat.icon] || Globe;
          return (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="reveal-scale flip-card group h-44"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flip-card-inner">
                {/* Front */}
                <div
                  className="flip-card-front glass-card rounded-2xl p-6 flex flex-col justify-between"
                  style={{ borderColor: `${cat.color}40` }}
                >
                  <div>
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110"
                      style={{ background: `${cat.color}20`, color: cat.color }}
                    >
                      <Icon size={24} />
                    </div>
                    <h3 className="font-serif font-bold text-lg text-primary">{cat.name}</h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted uppercase tracking-wider">Explore</span>
                    <ArrowRight size={16} className="text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </div>

                {/* Back */}
                <div
                  className="flip-card-back rounded-2xl p-6 flex flex-col justify-center"
                  style={{ background: `linear-gradient(135deg, ${cat.color}30, ${cat.color}10)` }}
                >
                  <p className="text-sm text-secondary leading-relaxed">{cat.description}</p>
                  <div className="mt-3 text-xs font-medium" style={{ color: cat.color }}>
                    View indicators →
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
