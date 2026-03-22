'use client';

import { BarChart3, BrainCircuit, SendHorizontal, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SmartChart } from '../charts';
import { RecommendationList } from '../recommendation-list';
import { aiSuggestions, chatHistory, sampleSeries } from '../../lib/mock-data';
import { getCachedAnalysis, queryInsightAI } from '../../lib/insight-engine';

const fallbackChart = { type: 'line', title: 'Revenue over name', x: 'name', y: 'revenue', data: sampleSeries };

export function AskDataWorkspace() {
  const [messages, setMessages] = useState(chatHistory);
  const [input, setInput] = useState('Show trend of sales over time');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState({
    chart_config: fallbackChart,
    insight_score: 96,
    insights: []
  });

  useEffect(() => {
    const cached = getCachedAnalysis();
    if (cached?.chart_configs?.[0]) {
      setAnswer((current) => ({ ...current, chart_config: cached.chart_configs[0], insight_score: cached.insight_score }));
    }
  }, []);

  const submitPrompt = async () => {
    try {
      setLoading(true);
      const userMessage = { role: 'user', content: input };
      setMessages((current) => [...current, userMessage]);
      const response = await queryInsightAI(input);
      setMessages((current) => [...current, { role: 'assistant', content: response.answer }]);
      setAnswer(response);
      setInput('Explain the outliers and tell me which chart is best next');
    } catch (error) {
      setMessages((current) => [...current, { role: 'assistant', content: error instanceof Error ? error.message : 'InsightAI ran into a problem.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <div className="glass-panel rounded-[28px] p-6">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-2xl rounded-[24px] px-5 py-4 text-sm leading-6 ${message.role === 'user' ? 'bg-gradient-to-r from-accent to-ember text-white' : 'border border-white/10 bg-white/5 text-slate-300'}`}>
                  {message.content}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-col gap-4 rounded-[24px] border border-white/10 bg-slate-950/60 p-4 lg:flex-row lg:items-center">
            <input
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              placeholder="Ask InsightAI: Show trend of sales over time"
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
            <button onClick={submitPrompt} disabled={loading || !input.trim()} className="rounded-full bg-gradient-to-r from-accent to-ember px-5 py-3 text-sm font-medium text-white shadow-glow transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
              <SendHorizontal className={`mr-2 inline h-4 w-4 ${loading ? 'animate-pulse' : ''}`} />
              {loading ? 'Thinking…' : 'Generate answer'}
            </button>
          </div>
        </div>

        <div className="glass-panel rounded-[28px] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Answer preview</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Generated chart response</h2>
            </div>
            <button className="rounded-full bg-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/15">
              <Sparkles className="mr-2 inline h-4 w-4 text-ember" />
              Explain this chart
            </button>
          </div>
          <div className="mt-6 rounded-[28px] border border-white/10 bg-slate-950/50 p-5">
            <SmartChart config={answer.chart_config} />
          </div>
          <div className="mt-4 rounded-[22px] border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            AI Insight Score: <span className="font-semibold">{answer.insight_score}/100</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <RecommendationList items={aiSuggestions} />
        <div className="glass-panel rounded-[28px] p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 p-3 text-accent">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Suggested prompts</h3>
              <p className="text-sm text-slate-400">Kick off analysis with intent-aware commands.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3">
            {[
              'Compare monthly revenue vs. active users',
              'Highlight any outliers in conversion rate',
              'Show a heatmap of engagement by cohort',
              'Summarize the story behind the latest trend'
            ].map((prompt) => (
              <button key={prompt} onClick={() => setInput(prompt)} className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-white/10">
                <BarChart3 className="mr-2 inline h-4 w-4 text-ember" />
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
