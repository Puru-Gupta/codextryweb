import { AlertTriangle, Sparkles, TrendingUp } from 'lucide-react';

const toneMap = {
  positive: {
    icon: TrendingUp,
    badge: 'Trend',
    className: 'text-emerald-300 bg-emerald-500/10'
  },
  warning: {
    icon: AlertTriangle,
    badge: 'Outlier',
    className: 'text-amber-300 bg-amber-500/10'
  },
  accent: {
    icon: Sparkles,
    badge: 'Correlation',
    className: 'text-accent bg-accent/10'
  }
};

export function InsightCard({ insight }) {
  const config = toneMap[insight.tone] || toneMap.accent;
  const Icon = config.icon;

  return (
    <div className="glass-panel rounded-[28px] p-5 transition hover:-translate-y-1 hover:bg-white/10">
      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${config.className}`}>
        <Icon className="h-3.5 w-3.5" />
        {config.badge}
      </span>
      <h3 className="mt-4 text-lg font-semibold text-white">{insight.title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-400">{insight.body}</p>
    </div>
  );
}
