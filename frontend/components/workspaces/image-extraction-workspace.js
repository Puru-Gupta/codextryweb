'use client';

import { Aperture, Download, ScanSearch } from 'lucide-react';
import { useState } from 'react';
import { ExtractionChart } from '../charts';
import { DataTable } from '../data-table';
import { UploadDropzone } from '../upload-dropzone';
import { extractChartFromImage } from '../../lib/insight-engine';
import { extractedData } from '../../lib/mock-data';

const fallback = {
  fileName: 'quarterly-chart.png',
  points: extractedData,
  confidence: 0.81,
  message: 'Axis regions and trend points were inferred from the uploaded image.'
};

export function ImageExtractionWorkspace() {
  const [result, setResult] = useState(fallback);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (file) => {
    try {
      setLoading(true);
      setError('');
      const response = await extractChartFromImage(file);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to extract data from image.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <UploadDropzone
        title="Upload a chart image"
        description="Drop in PNG or JPG charts to detect axes, infer data points, and convert a visual into a structured dataset that can be re-plotted immediately."
        cta="Extract chart data"
        icon="image"
        accept=".png,.jpg,.jpeg"
        onFileSelect={handleUpload}
        isLoading={loading}
        helperText={`Latest image: ${result.fileName} • confidence ${Math.round(result.confidence * 100)}%`}
      />

      {error ? <div className="rounded-[24px] border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="glass-panel rounded-[32px] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Computer vision</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Extraction workflow</h2>
            </div>
            <div className="rounded-full bg-accent/10 px-3 py-1 text-xs text-accent">CV + AI</div>
          </div>
          <div className="mt-6 grid gap-4">
            {[
              ['Axis detection', 'Locate x/y guides and calibrate regions for accurate chart digitization.'],
              ['Point extraction', 'Infer line turning points or bar heights directly from image patterns.'],
              ['Reconstruction', 'Map chart geometry into x-y rows that can be edited or exported.'],
              ['Verification', 'Report confidence and allow a human to correct uncertain points.']
            ].map(([title, body]) => (
              <div key={title} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-base font-semibold text-white">{title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-[32px] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Extracted preview</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Reconstructed trend chart</h2>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <button onClick={() => setResult(fallback)} className="rounded-full border border-white/10 px-4 py-2 text-slate-300 transition hover:bg-white/10">
                <ScanSearch className="mr-2 inline h-4 w-4" />
                Reset sample
              </button>
              <button className="rounded-full bg-gradient-to-r from-accent to-ember px-4 py-2 text-white transition hover:opacity-90">
                <Download className="mr-2 inline h-4 w-4" />
                Export CSV
              </button>
            </div>
          </div>
          <div className="mt-6 rounded-[28px] border border-white/10 bg-slate-950/50 p-5">
            <ExtractionChart data={result.points} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <DataTable rows={result.points} />
        <div className="glass-panel rounded-[28px] p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-ember/10 p-3 text-ember">
              <Aperture className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">AI verification notes</h3>
              <p className="text-sm text-slate-400">Confidence signals for extracted values.</p>
            </div>
          </div>
          <div className="mt-6 space-y-4 text-sm leading-7 text-slate-300">
            <p>{result.message}</p>
            <p>Confidence is currently <span className="font-semibold text-white">{Math.round(result.confidence * 100)}%</span>, so InsightAI suggests manually reviewing the first and last points before exporting.</p>
            <p>Suggested next step: re-plot the extracted dataset, then ask InsightAI to explain the slope changes across the recovered series.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
