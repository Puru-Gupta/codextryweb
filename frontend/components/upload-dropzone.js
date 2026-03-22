'use client';

import { Download, FileUp, ImageUp, LoaderCircle, WandSparkles } from 'lucide-react';
import { useRef, useState } from 'react';

export function UploadDropzone({ title, description, cta, icon = 'file', accept, onFileSelect, isLoading = false, helperText }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const Icon = icon === 'image' ? ImageUp : FileUp;

  const handleFiles = async (files) => {
    const [file] = Array.from(files || []);
    if (!file) {
      return;
    }
    setFileName(file.name);
    await onFileSelect?.(file);
  };

  return (
    <div
      className={`glass-panel rounded-[28px] border border-dashed p-6 transition ${dragging ? 'border-accent/60 bg-white/10' : 'border-white/15 hover:border-accent/50 hover:bg-white/10'}`}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={async (event) => {
        event.preventDefault();
        setDragging(false);
        await handleFiles(event.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={async (event) => {
          await handleFiles(event.target.files);
          event.target.value = '';
        }}
      />

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-white/10 p-4 text-accent transition group-hover:scale-105 group-hover:bg-accent/10">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="mt-2 max-w-xl text-sm text-slate-400">{description}</p>
            {fileName ? <p className="mt-3 text-sm text-emerald-300">Selected: {fileName}</p> : null}
            {helperText ? <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-500">{helperText}</p> : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => inputRef.current?.click()}
            className="rounded-full bg-gradient-to-r from-accent to-ember px-5 py-3 text-sm font-medium text-white shadow-glow transition hover:opacity-90"
          >
            {isLoading ? <LoaderCircle className="mr-2 inline h-4 w-4 animate-spin" /> : null}
            {cta}
          </button>
          <button className="glass-panel rounded-full px-5 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10">
            <Download className="mr-2 inline h-4 w-4" />
            Sample template
          </button>
        </div>
      </div>
      <div className="mt-6 rounded-[24px] border border-white/8 bg-slate-950/40 p-10 text-center text-sm text-slate-500">
        <WandSparkles className="mx-auto mb-4 h-8 w-8 text-ember" />
        Drag & drop files here — InsightAI will auto-detect schema, generate chart options, extract structure, and build clean narratives from your uploads.
      </div>
    </div>
  );
}
