'use client';

import { DownloadCloud, FileSpreadsheet, Filter, RefreshCcw, WandSparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { SmartChart } from '../charts';
import { InsightCard } from '../insight-card';
import { RecommendationList } from '../recommendation-list';
import { UploadDropzone } from '../upload-dropzone';
import { analyzeDatasetFile } from '../../lib/insight-engine';
import { aiSuggestions, insightCards, sampleSeries } from '../../lib/mock-data';

const fallbackAnalysis = {
  fileName: 'demo-growth.csv',
  rowCount: sampleSeries.length,
  column_types: { name: 'time-series', revenue: 'numeric', users: 'numeric', retention: 'numeric' },
  recommendations: aiSuggestions,
  insights: insightCards,
  sample: sampleSeries,
  chart_configs: [
    { type: 'line', title: 'Revenue over name', x: 'name', y: 'revenue', data: sampleSeries },
    { type: 'bar', title: 'Retention by name', x: 'name', y: 'retention', data: sampleSeries },
    { type: 'scatter', title: 'Users vs revenue', x: 'users', y: 'revenue', data: sampleSeries },
    { type: 'heatmap', title: 'Retention heatmap', x: 'name', y: 'retention', data: sampleSeries }
  ],
  insight_score: 96
};

function LoadingState() {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {[...Array(2)].map((_, index) => (
        <div key={index} className="rounded-[28px] border border-white/10 bg-slate-950/50 p-5">
          <div className="shimmer h-5 w-40 rounded-full" />
          <div className="mt-4 shimmer h-[280px] rounded-[24px]" />
        </div>
      ))}
    </div>
  );
}

export function DashboardWorkspace() {
  const [analysis, setAnalysis] = useState(fallbackAnalysis);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const columnBadges = useMemo(() => Object.entries(analysis.column_types || {}), [analysis]);

  const handleFileUpload = async (file) => {
    try {
      setLoading(true);
      setError('');
      const result = await analyzeDatasetFile(file);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to analyze the uploaded file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <UploadDropzone
        title="Upload data for instant visualization"
        description="Drag in CSV, XLSX, or JSON datasets. InsightAI will profile the schema, score quality, and build the strongest chart mix for the uploaded data."
        cta="Analyze dataset"
        accept=".csv,.xlsx,.xls,.json"
        onFileSelect={handleFileUpload}
        isLoading={loading}
        helperText={`Live file: ${analysis.fileName} • ${analysis.rowCount} rows analyzed`}
      />

      {error ? <div className="rounded-[24px] border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="glass-panel rounded-[32px] p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Visualization studio</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Interactive preview canvas</h2>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              {[
                { icon: Filter, label: 'Filter' },
                { icon: DownloadCloud, label: 'Download PNG' },
                { icon: RefreshCcw, label: 'Reset to demo', action: () => setAnalysis(fallbackAnalysis) }
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={action.action}
                    className="rounded-full border border-white/10 px-4 py-2 text-slate-300 transition hover:bg-white/10"
                  >
                    <Icon className="mr-2 inline h-4 w-4" />
                    {action.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 space-y-6">
            {loading ? (
              <LoadingState />
            ) : (
              <div className="grid gap-6 xl:grid-cols-2">
                {analysis.chart_configs.map((config, index) => (
                  <div key={`${config.type}-${index}`} className={`rounded-[28px] border border-white/10 bg-slate-950/50 p-5 ${index === 2 ? 'xl:col-span-2' : ''}`}>
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{config.title}</h3>
                        <p className="text-sm text-slate-400">{config.type} visualization</p>
                      </div>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">
                        {index === 0 ? 'Recommended' : index === 1 ? 'Explain this chart' : 'Interactive'}
                      </span>
                    </div>
                    <SmartChart config={config} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <RecommendationList items={analysis.recommendations} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {analysis.insights.map((insight) => (
          <InsightCard key={insight.title} insight={insight} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-panel rounded-[28px] p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 p-3 text-ember">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Schema detection</h3>
              <p className="text-sm text-slate-400">Columns are classified automatically from the uploaded file.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3">
            {columnBadges.map(([column, kind]) => (
              <div key={column} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                {column} → {kind}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-[28px] p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-accent/10 p-3 text-accent">
              <WandSparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">AI reasoning</h3>
              <p className="text-sm text-slate-400">Why InsightAI recommends these visuals.</p>
            </div>
          </div>
          <div className="mt-6 space-y-4 text-sm leading-7 text-slate-300">
            {analysis.recommendations.map((item) => (
              <p key={item.title}>{item.reason}</p>
            ))}
          </div>
          <div className="mt-6 rounded-[24px] border border-emerald-400/20 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-200">
            AI Insight Score: <span className="font-semibold">{analysis.insight_score}/100</span>
          </div>
        </div>
      </div>
    </div>
  );
}
