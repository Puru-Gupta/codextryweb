'use client';

import { MoonStar, SunMedium } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark((value) => !value)}
      className="glass-panel flex items-center gap-2 rounded-full px-4 py-2 text-sm text-slate-200 transition hover:border-white/20 hover:bg-white/10"
    >
      {isDark ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
      {isDark ? 'Dark mode' : 'Light mode'}
    </button>
  );
}
