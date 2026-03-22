import { BrainCircuit, ChevronRight } from 'lucide-react';

export function RecommendationList({ items }) {
  return (
    <div className="glass-panel rounded-[28px] p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-accent/10 p-3 text-accent">
          <BrainCircuit className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">AI chart recommendations</h3>
          <p className="text-sm text-slate-400">Top 3 visuals selected by InsightAI based on shape, semantic intent, and explainability.</p>
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {items.map((item, index) => (
          <div key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Recommendation {index + 1}</p>
                <h4 className="text-base font-semibold text-white">{item.title}</h4>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-400">{item.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
