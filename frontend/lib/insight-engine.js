import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const STORAGE_KEY = 'insightai-last-analysis';

export function bufferToRows(filename, buffer) {
  const lower = filename.toLowerCase();

  if (lower.endsWith('.csv')) {
    const text = buffer.toString('utf-8');
    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true
    });

    if (parsed.errors.length) {
      throw new Error(parsed.errors[0].message);
    }

    return parsed.data;
  }

  if (lower.endsWith('.json')) {
    const text = buffer.toString('utf-8');
    const data = JSON.parse(text);
    if (Array.isArray(data)) {
      return data;
    }
    if (Array.isArray(data?.rows)) {
      return data.rows;
    }
    return [data];
  }

  if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const firstSheet = workbook.SheetNames[0];
    return XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet], { defval: '' });
  }

  throw new Error('Unsupported file type. Use CSV, Excel, or JSON.');
}

export function inferColumnTypes(rows) {
  const first = rows[0] || {};
  const result = {};

  Object.keys(first).forEach((column) => {
    const values = rows.map((row) => row[column]).filter((value) => value !== '' && value !== null && value !== undefined);

    if (!values.length) {
      result[column] = 'categorical';
      return;
    }

    const numericRatio = values.filter((value) => typeof value === 'number' || (!Number.isNaN(Number(value)) && value !== '')).length / values.length;
    const dateRatio = values.filter((value) => !Number.isNaN(Date.parse(String(value)))).length / values.length;

    if (numericRatio > 0.8) {
      result[column] = 'numeric';
    } else if (dateRatio > 0.7) {
      result[column] = 'time-series';
    } else {
      result[column] = 'categorical';
    }
  });

  return result;
}

export function insightScore(rows, columnTypes) {
  const diversity = Object.values(columnTypes).length ? new Set(Object.values(columnTypes)).size * 12 : 0;
  const completeness = rows.length
    ? Math.round(
        rows.reduce((acc, row) => {
          const values = Object.values(row);
          const filled = values.filter((value) => value !== '' && value !== null && value !== undefined).length;
          return acc + filled / Math.max(values.length, 1);
        }, 0) / rows.length * 35
      )
    : 0;
  const richness = Math.min((Object.keys(columnTypes).length * 5) + rows.length, 41);
  return Math.max(55, Math.min(99, diversity + completeness + richness));
}

export function buildRecommendations(columnTypes) {
  const entries = Object.entries(columnTypes);
  const numeric = entries.filter(([, kind]) => kind === 'numeric').map(([name]) => name);
  const categorical = entries.filter(([, kind]) => kind === 'categorical').map(([name]) => name);
  const temporal = entries.filter(([, kind]) => kind === 'time-series').map(([name]) => name);

  const recommendations = [];

  if (temporal.length && numeric.length) {
    recommendations.push({
      title: 'Line chart',
      reason: `Line chart recommended for trend analysis over time because ${temporal[0]} behaves like a time axis and ${numeric[0]} is numeric.`
    });
  }

  if (numeric.length >= 2) {
    recommendations.push({
      title: 'Scatter plot',
      reason: `Scatter plot recommended to evaluate the relationship between ${numeric[0]} and ${numeric[1]}.`
    });
  }

  if (categorical.length && numeric.length) {
    recommendations.push({
      title: 'Bar chart',
      reason: `Bar chart recommended for comparing ${numeric[0]} across ${categorical[0]} categories.`
    });
  }

  recommendations.push({
    title: 'Heatmap',
    reason: 'Heatmap recommended when you want to compare intensity across multiple segments or periods at once.'
  });

  return recommendations.slice(0, 3);
}

export function buildInsights(rows, columnTypes) {
  const numeric = Object.entries(columnTypes)
    .filter(([, kind]) => kind === 'numeric')
    .map(([name]) => name);

  if (!numeric.length || rows.length < 2) {
    return [
      {
        title: 'Dataset profiled successfully',
        body: 'InsightAI detected the schema and is ready to recommend visualizations and explain trends.',
        tone: 'accent'
      }
    ];
  }

  const primary = numeric[0];
  const values = rows
    .map((row) => Number(row[primary]))
    .filter((value) => !Number.isNaN(value));

  const first = values[0];
  const last = values[values.length - 1];
  const direction = last >= first ? 'upward' : 'downward';
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / Math.max(values.length - 1, 1);
  const std = Math.sqrt(variance) || 1;
  const maxIndex = values.reduce((best, value, index) => (Math.abs(value - mean) > Math.abs(values[best] - mean) ? index : best), 0);

  const insights = [
    {
      title: `${primary} shows an ${direction} trend`,
      body: `${primary} moves from ${first.toFixed(2)} to ${last.toFixed(2)}, indicating a clear ${direction} direction across the uploaded sample.`,
      tone: last >= first ? 'positive' : 'warning'
    }
  ];

  if (Math.abs(values[maxIndex] - mean) / std > 1.6) {
    insights.push({
      title: 'Outlier candidate detected',
      body: `A potential anomaly appears around row ${maxIndex + 1}, where ${primary} differs meaningfully from the dataset baseline.`,
      tone: 'warning'
    });
  }

  if (numeric.length >= 2) {
    const secondary = numeric[1];
    const xs = rows.map((row) => Number(row[primary]));
    const ys = rows.map((row) => Number(row[secondary]));
    const pairs = xs.map((x, index) => [x, ys[index]]).filter(([x, y]) => !Number.isNaN(x) && !Number.isNaN(y));
    const corr = pearson(pairs.map(([x]) => x), pairs.map(([, y]) => y));
    insights.push({
      title: 'Correlation opportunity found',
      body: `${primary} and ${secondary} have an estimated Pearson correlation of ${corr.toFixed(2)}, making them strong candidates for relationship analysis.`,
      tone: 'accent'
    });
  }

  return insights.slice(0, 3);
}

function pearson(xs, ys) {
  const meanX = xs.reduce((sum, value) => sum + value, 0) / xs.length;
  const meanY = ys.reduce((sum, value) => sum + value, 0) / ys.length;
  const numerator = xs.reduce((sum, value, index) => sum + ((value - meanX) * (ys[index] - meanY)), 0);
  const denominator = Math.sqrt(
    xs.reduce((sum, value) => sum + ((value - meanX) ** 2), 0) *
      ys.reduce((sum, value) => sum + ((value - meanY) ** 2), 0)
  );
  return denominator ? numerator / denominator : 0;
}

export function buildChartConfigs(rows, columnTypes) {
  const numeric = Object.entries(columnTypes)
    .filter(([, kind]) => kind === 'numeric')
    .map(([name]) => name);
  const categorical = Object.entries(columnTypes)
    .filter(([, kind]) => kind === 'categorical')
    .map(([name]) => name);
  const temporal = Object.entries(columnTypes)
    .filter(([, kind]) => kind === 'time-series')
    .map(([name]) => name);
  const sample = rows.slice(0, 24);
  const charts = [];

  if (temporal.length && numeric.length) {
    charts.push({ type: 'line', title: `${numeric[0]} over ${temporal[0]}`, x: temporal[0], y: numeric[0], data: sample });
  }
  if (categorical.length && numeric.length) {
    charts.push({ type: 'bar', title: `${numeric[0]} by ${categorical[0]}`, x: categorical[0], y: numeric[0], data: sample });
  }
  if (numeric.length >= 2) {
    charts.push({ type: 'scatter', title: `${numeric[0]} vs ${numeric[1]}`, x: numeric[0], y: numeric[1], data: sample });
  }

  charts.push({
    type: 'heatmap',
    title: 'Pattern intensity heatmap',
    x: categorical[0] || temporal[0] || Object.keys(columnTypes)[0],
    y: numeric[0] || Object.keys(columnTypes)[1],
    data: sample
  });

  return charts.slice(0, 4);
}

export async function analyzeDatasetFile(file) {
  const form = new FormData();
  form.append('file', file);
  const response = await fetch('/api/analyze', { method: 'POST', body: form });
  if (!response.ok) {
    throw new Error((await response.json()).error || 'Failed to analyze dataset.');
  }
  const payload = await response.json();
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }
  return payload;
}

export async function extractChartFromImage(file) {
  const form = new FormData();
  form.append('file', file);
  const response = await fetch('/api/extract-chart', { method: 'POST', body: form });
  if (!response.ok) {
    throw new Error((await response.json()).error || 'Failed to extract chart data.');
  }
  return response.json();
}

export async function queryInsightAI(prompt) {
  const cached = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
  const rows = cached ? JSON.parse(cached).sample || [] : [];
  const response = await fetch('/api/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, rows })
  });
  if (!response.ok) {
    throw new Error((await response.json()).error || 'Failed to query InsightAI.');
  }
  return response.json();
}

export function getCachedAnalysis() {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}
