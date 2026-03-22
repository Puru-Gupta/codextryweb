'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const palette = ['#4F7CFF', '#FF8A3D', '#35D6A3', '#A78BFA', '#38BDF8'];

function ChartTooltip() {
  return <Tooltip contentStyle={{ background: '#08101f', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16 }} />;
}

export function SmartChart({ config }) {
  if (!config?.data?.length) {
    return <div className="flex h-[280px] items-center justify-center rounded-[24px] border border-dashed border-white/10 text-sm text-slate-500">Upload data to render a chart.</div>;
  }

  if (config.type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={config.data}>
          <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
          <XAxis dataKey={config.x} stroke="#94A3B8" tickLine={false} axisLine={false} />
          <YAxis stroke="#94A3B8" tickLine={false} axisLine={false} />
          <ChartTooltip />
          <Legend />
          <Line type="monotone" dataKey={config.y} stroke="#4F7CFF" strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (config.type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={config.data}>
          <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
          <XAxis dataKey={config.x} stroke="#94A3B8" tickLine={false} axisLine={false} />
          <YAxis stroke="#94A3B8" tickLine={false} axisLine={false} />
          <ChartTooltip />
          <Bar dataKey={config.y} radius={[12, 12, 0, 0]}>
            {config.data.map((entry, index) => (
              <Cell key={`${config.x}-${index}-${entry[config.x]}`} fill={palette[index % palette.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (config.type === 'scatter') {
    return (
      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart>
          <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" />
          <XAxis type="number" dataKey={config.x} name={config.x} stroke="#94A3B8" tickLine={false} axisLine={false} />
          <YAxis type="number" dataKey={config.y} name={config.y} stroke="#94A3B8" tickLine={false} axisLine={false} />
          <ChartTooltip />
          <Scatter data={config.data} fill="#4F7CFF" />
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  return <HeatmapChart config={config} />;
}

export function HeatmapChart({ config }) {
  const max = Math.max(...config.data.map((row) => Number(row[config.y]) || 0), 1);

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {config.data.slice(0, 9).map((row, index) => {
        const value = Number(row[config.y]) || 0;
        const opacity = 0.15 + ((value / max) * 0.85);
        return (
          <div
            key={`${config.x}-${index}`}
            className="rounded-[22px] border border-white/10 p-4"
            style={{ background: `linear-gradient(135deg, rgba(79,124,255,${opacity}), rgba(255,138,61,${Math.max(0.12, opacity - 0.15)}))` }}
          >
            <p className="text-xs uppercase tracking-[0.24em] text-slate-100/80">{row[config.x]}</p>
            <p className="mt-3 text-2xl font-semibold text-white">{row[config.y]}</p>
          </div>
        );
      })}
    </div>
  );
}

export function ExtractionChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
        <XAxis dataKey="x" stroke="#94A3B8" tickLine={false} axisLine={false} />
        <YAxis stroke="#94A3B8" tickLine={false} axisLine={false} />
        <ChartTooltip />
        <Line type="monotone" dataKey="y" stroke="#FF8A3D" strokeWidth={3} dot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
