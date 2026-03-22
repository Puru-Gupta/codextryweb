import { NextResponse } from 'next/server';
import {
  bufferToRows,
  buildChartConfigs,
  buildInsights,
  buildRecommendations,
  inferColumnTypes,
  insightScore
} from '../../../lib/insight-engine';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const rows = bufferToRows(file.name, buffer);

    if (!rows.length) {
      return NextResponse.json({ error: 'The uploaded file did not contain any rows.' }, { status: 400 });
    }

    const columnTypes = inferColumnTypes(rows);
    const payload = {
      fileName: file.name,
      rowCount: rows.length,
      column_types: columnTypes,
      recommendations: buildRecommendations(columnTypes),
      insights: buildInsights(rows, columnTypes),
      sample: rows.slice(0, 12),
      chart_configs: buildChartConfigs(rows, columnTypes),
      insight_score: insightScore(rows, columnTypes)
    };

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected analysis error.' },
      { status: 500 }
    );
  }
}
