'use client';

import Link from 'next/link';
import { Menu, PanelLeftClose, Rocket, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { navigation } from '../lib/mock-data';

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="glass-panel fixed left-4 top-4 z-50 rounded-full p-3 lg:hidden"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <PanelLeftClose className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-white/10 bg-slate-950/80 p-6 backdrop-blur-2xl transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <Link href="/" className="glass-panel mb-8 rounded-3xl p-4">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-ember text-white shadow-glow">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold text-white">InsightAI</h2>
            <p className="mt-2 text-sm text-slate-400">Smart Data Visualization Copilot for modern analytics teams.</p>
          </Link>

          <nav className="space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
                onClick={() => setOpen(false)}
              >
                <span>{item.label}</span>
                <Rocket className="h-4 w-4 text-slate-500" />
              </Link>
            ))}
          </nav>

          <div className="glass-panel mt-auto rounded-3xl p-5">
            <p className="text-sm font-medium text-white">AI Insight Score</p>
            <div className="mt-4 flex items-end gap-3">
              <span className="text-4xl font-semibold text-white">96</span>
              <span className="mb-1 rounded-full bg-emerald-500/15 px-2 py-1 text-xs text-emerald-300">+8 this week</span>
            </div>
            <p className="mt-3 text-sm text-slate-400">Your datasets are well-structured and ready for predictive overlays.</p>
          </div>
        </div>
      </aside>
    </>
  );
}
