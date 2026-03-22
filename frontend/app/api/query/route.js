import { NextResponse } from 'next/server';
import { buildChartConfigs, buildInsights, inferColumnTypes, insightScore } from '../../../lib/insight-engine';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const body = await request.json();
    const prompt = body.prompt?.trim();
    const rows = Array.isArray(body.rows) && body.rows.length
      ? body.rows
      : [
          { month: 'Jan', sales: 24, users: 12 },
          { month: 'Feb', sales: 31, users: 18 },
          { month: 'Mar', sales: 42, users: 24 },
          { month: 'Apr', sales: 51, users: 31 }
        ];

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
    }

    const columnTypes = inferColumnTypes(rows);
    const charts = buildChartConfigs(rows, columnTypes);
    const insights = buildInsights(rows, columnTypes);

    const primaryChart = charts[0];
    const answer = `${prompt} → InsightAI recommends a ${primaryChart.type} because it best matches the detected schema. ${insights[0].body}`;

    return NextResponse.json({
      answer,
      recommended_chart: primaryChart.type,
      chart_config: primaryChart,
      insights,
      insight_score: insightScore(rows, columnTypes)
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected query error.' },
      { status: 500 }
    );
  }
}
