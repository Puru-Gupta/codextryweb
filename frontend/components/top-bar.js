import { Bell, Search, Sparkles } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

export function TopBar({ title, subtitle }) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.28em] text-accent">
          <Sparkles className="h-3.5 w-3.5" />
          AI Visualization Copilot
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">{subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="glass-panel flex min-w-[240px] items-center gap-3 rounded-full px-4 py-3 text-sm text-slate-400">
          <Search className="h-4 w-4" />
          Search charts, datasets, and AI suggestions
        </div>
        <button className="glass-panel rounded-full p-3 text-slate-300 transition hover:border-white/20 hover:bg-white/10">
          <Bell className="h-4 w-4" />
        </button>
        <ThemeToggle />
      </div>
    </div>
  );
}
