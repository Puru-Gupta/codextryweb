import Link from 'next/link';
import { ArrowRight, BrainCircuit, ImageUp, MessageSquareText, Sparkles } from 'lucide-react';
import { heroStats } from '../lib/mock-data';
import { FadeIn } from '../components/fade-in';

const features = [
  {
    icon: BrainCircuit,
    title: 'AI chart recommendations',
    body: 'Get the top 3 best-fit chart types with reasoning tailored to your dataset and business question.'
  },
  {
    icon: ImageUp,
    title: 'Image to data extraction',
    body: 'Upload a chart screenshot and turn it into an editable, structured dataset you can re-plot instantly.'
  },
  {
    icon: MessageSquareText,
    title: 'Ask your data naturally',
    body: 'Type prompts like “Show trend of sales over time” and receive a chart, explanation, and AI insight score.'
  }
];

export default function LandingPage() {
  return (
    <main className="relative overflow-hidden px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="glass-panel rounded-[36px] px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-accent to-ember p-3 text-white shadow-glow">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-semibold text-white">InsightAI</p>
                <p className="text-sm text-slate-400">Smart Data Visualization Copilot</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard" className="rounded-full border border-white/10 px-5 py-3 text-sm text-slate-300 transition hover:bg-white/10">
                Live dashboard
              </Link>
              <Link href="/ask-data" className="rounded-full bg-gradient-to-r from-accent to-ember px-5 py-3 text-sm font-medium text-white shadow-glow transition hover:opacity-90">
                Ask your data
              </Link>
            </div>
          </div>
        </div>

        <FadeIn delay={0.05}><section className="relative mt-8 overflow-hidden rounded-[40px] border border-white/10 bg-mesh px-6 py-14 shadow-glow sm:px-8 lg:px-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,124,255,0.2),transparent_18%),radial-gradient(circle_at_80%_10%,rgba(255,138,61,0.14),transparent_16%)]" />
          <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-300">
                <Sparkles className="h-3.5 w-3.5 text-ember" />
                Premium analytics workspace
              </p>
              <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                Turn Data Into Insights Instantly
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                Upload datasets or chart images, let AI recommend the best visualization, extract structured data, and surface the trends that matter in one calm, modern workspace.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/dashboard" className="rounded-full bg-gradient-to-r from-accent to-ember px-6 py-3 text-sm font-medium text-white shadow-glow transition hover:opacity-90">
                  Upload data
                </Link>
                <Link href="/image-extraction" className="rounded-full border border-white/10 px-6 py-3 text-sm text-slate-300 transition hover:bg-white/10">
                  Extract chart image
                </Link>
              </div>
            </div>

            <div className="glass-panel rounded-[32px] p-6">
              <div className="grid gap-4 sm:grid-cols-3">
                {heroStats.map((item) => (
                  <div key={item.label} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                    <p className="text-3xl font-semibold text-white">{item.value}</p>
                    <p className="mt-2 text-sm text-slate-400">{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-[28px] border border-white/10 bg-slate-950/60 p-6">
                <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Workflow preview</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {['Upload & detect schema', 'Generate adaptive charts', 'Extract chart image data', 'Ask questions in plain English'].map((step) => (
                    <div key={step} className="rounded-[24px] bg-white/5 p-4 text-sm text-slate-300">
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section></FadeIn>

        <FadeIn delay={0.12}><section className="mt-10 grid gap-6 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="glass-panel rounded-[32px] p-6 transition hover:-translate-y-1 hover:bg-white/10">
                <div className="w-fit rounded-2xl bg-white/10 p-3 text-accent">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-xl font-semibold text-white">{feature.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-400">{feature.body}</p>
              </div>
            );
          })}
        </section></FadeIn>

        <FadeIn delay={0.18}><section className="mt-10 glass-panel rounded-[36px] p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Ready to launch</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">An analytics co-pilot designed for teams who care about clarity.</h2>
            </div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-ember px-6 py-3 text-sm font-medium text-white shadow-glow transition hover:opacity-90">
              Open dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section></FadeIn>
      </div>
    </main>
  );
}
