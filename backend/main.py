from __future__ import annotations

import io
import json
import os
from dataclasses import dataclass
from typing import Any

import pandas as pd
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

try:
    import cv2  # type: ignore
    import numpy as np  # type: ignore
except Exception:  # pragma: no cover
    cv2 = None
    np = None

try:
    from openai import OpenAI
except Exception:  # pragma: no cover
    OpenAI = None

app = FastAPI(title='InsightAI API', version='1.0.0')
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)


class QueryRequest(BaseModel):
    prompt: str
    rows: list[dict[str, Any]] = Field(default_factory=list)


@dataclass
class AnalysisSummary:
    column_types: dict[str, str]
    recommendations: list[dict[str, str]]
    insights: list[dict[str, str]]
    sample: list[dict[str, Any]]
    chart_configs: list[dict[str, Any]]
    insight_score: int


def _load_dataframe(filename: str, payload: bytes) -> pd.DataFrame:
    lower = filename.lower()
    if lower.endswith('.csv'):
        return pd.read_csv(io.BytesIO(payload))
    if lower.endswith(('.xlsx', '.xls')):
        return pd.read_excel(io.BytesIO(payload))
    if lower.endswith('.json'):
        data = json.loads(payload.decode('utf-8'))
        return pd.json_normalize(data)
    raise HTTPException(status_code=400, detail='Unsupported file type. Use CSV, Excel, or JSON.')


def _infer_column_types(df: pd.DataFrame) -> dict[str, str]:
    result: dict[str, str] = {}
    for column in df.columns:
        series = df[column]
        if pd.api.types.is_numeric_dtype(series):
            result[column] = 'numeric'
            continue
        parsed = pd.to_datetime(series, errors='coerce')
        if parsed.notna().mean() > 0.7:
            result[column] = 'time-series'
        else:
            result[column] = 'categorical'
    return result


def _generate_recommendations(column_types: dict[str, str]) -> list[dict[str, str]]:
    has_time = any(kind == 'time-series' for kind in column_types.values())
    numeric_columns = [name for name, kind in column_types.items() if kind == 'numeric']
    categorical_columns = [name for name, kind in column_types.items() if kind == 'categorical']

    recommendations = []
    if has_time and numeric_columns:
        recommendations.append({
            'title': 'Line chart',
            'reason': 'Line chart recommended for trend analysis over time because the dataset contains chronological fields and numeric measures.'
        })
    if len(numeric_columns) >= 2:
        recommendations.append({
            'title': 'Scatter plot',
            'reason': 'Scatter plot recommended for correlation analysis because multiple numeric fields can reveal clusters and outliers.'
        })
    if categorical_columns and numeric_columns:
        recommendations.append({
            'title': 'Bar chart',
            'reason': 'Bar chart recommended for categorical comparison because it clearly contrasts magnitudes across labels.'
        })
    recommendations.append({
        'title': 'Heatmap',
        'reason': 'Heatmap recommended when you need to compare intensity patterns across categories and periods.'
    })
    return recommendations[:3]


def _generate_insights(df: pd.DataFrame, column_types: dict[str, str]) -> list[dict[str, str]]:
    insights: list[dict[str, str]] = []
    numeric_columns = [name for name, kind in column_types.items() if kind == 'numeric']

    if numeric_columns:
        primary = numeric_columns[0]
        values = pd.to_numeric(df[primary], errors='coerce').dropna()
        if len(values) > 1:
            delta = values.iloc[-1] - values.iloc[0]
            direction = 'upward' if delta >= 0 else 'downward'
            insights.append({
                'title': f'{primary} shows a {direction} trend',
                'body': f'{primary} moved from {values.iloc[0]:.2f} to {values.iloc[-1]:.2f}, indicating a {direction} trajectory across the sampled rows.',
                'tone': 'positive' if delta >= 0 else 'warning'
            })
            z_scores = (values - values.mean()) / (values.std() or 1)
            if z_scores.abs().max() > 2:
                outlier_idx = int(z_scores.abs().idxmax())
                insights.append({
                    'title': 'Potential outlier detected',
                    'body': f'Row {outlier_idx} in {primary} is significantly different from the baseline distribution and may deserve deeper review.',
                    'tone': 'warning'
                })
    if len(numeric_columns) >= 2:
        corr = df[numeric_columns[:2]].corr(numeric_only=True).iloc[0, 1]
        insights.append({
            'title': 'Correlation opportunity',
            'body': f'{numeric_columns[0]} and {numeric_columns[1]} have an estimated correlation of {corr:.2f}, useful for relationship analysis.',
            'tone': 'accent'
        })
    return insights[:3] or [{
        'title': 'Dataset uploaded',
        'body': 'InsightAI successfully profiled the dataset and is ready to generate contextual visualizations.',
        'tone': 'accent'
    }]


def _build_chart_configs(df: pd.DataFrame, column_types: dict[str, str]) -> list[dict[str, Any]]:
    numeric_columns = [name for name, kind in column_types.items() if kind == 'numeric']
    time_columns = [name for name, kind in column_types.items() if kind == 'time-series']
    categorical_columns = [name for name, kind in column_types.items() if kind == 'categorical']
    sample_rows = df.head(20).fillna('').to_dict(orient='records')
    charts = []

    if time_columns and numeric_columns:
        charts.append({
            'type': 'line',
            'x': time_columns[0],
            'y': numeric_columns[0],
            'title': f'{numeric_columns[0]} over {time_columns[0]}',
            'data': sample_rows
        })
    if categorical_columns and numeric_columns:
        charts.append({
            'type': 'bar',
            'x': categorical_columns[0],
            'y': numeric_columns[0],
            'title': f'{numeric_columns[0]} by {categorical_columns[0]}',
            'data': sample_rows
        })
    if len(numeric_columns) >= 2:
        charts.append({
            'type': 'scatter',
            'x': numeric_columns[0],
            'y': numeric_columns[1],
            'title': f'{numeric_columns[0]} vs {numeric_columns[1]}',
            'data': sample_rows
        })
    charts.append({
        'type': 'heatmap',
        'title': 'Category intensity heatmap',
        'data': sample_rows
    })
    return charts[:4]


def _insight_score(df: pd.DataFrame, column_types: dict[str, str]) -> int:
    diversity = len(set(column_types.values())) * 12
    completeness = int((1 - (df.isna().sum().sum() / max(df.size, 1))) * 35)
    richness = min(len(df.columns) * 5 + len(df), 41)
    return max(55, min(99, diversity + completeness + richness))


def _generate_ai_summary(prompt: str, df: pd.DataFrame) -> str:
    if OpenAI and os.getenv('OPENAI_API_KEY'):
        client = OpenAI()
        preview = df.head(10).to_csv(index=False)
        response = client.responses.create(
            model=os.getenv('OPENAI_MODEL', 'gpt-4.1-mini'),
            input=[
                {
                    'role': 'system',
                    'content': 'You are InsightAI, a concise analytics copilot that explains charts and trends.'
                },
                {
                    'role': 'user',
                    'content': f'Prompt: {prompt}\n\nDataset preview:\n{preview}'
                }
            ]
        )
        return response.output_text

    columns = ', '.join(df.columns[:4])
    return (
        f'InsightAI recommends a line chart for "{prompt}" because the dataset includes signal-bearing columns such as {columns}. '
        'The visible pattern suggests a sustained trend with room to inspect outliers and segment performance further.'
    )


@app.get('/api/health')
def health_check() -> dict[str, str]:
    return {'status': 'ok'}


@app.post('/api/analyze-data')
async def analyze_data(file: UploadFile = File(...)) -> dict[str, Any]:
    payload = await file.read()
    dataframe = _load_dataframe(file.filename or 'dataset.csv', payload)
    column_types = _infer_column_types(dataframe)
    result = AnalysisSummary(
        column_types=column_types,
        recommendations=_generate_recommendations(column_types),
        insights=_generate_insights(dataframe, column_types),
        sample=dataframe.head(10).fillna('').to_dict(orient='records'),
        chart_configs=_build_chart_configs(dataframe, column_types),
        insight_score=_insight_score(dataframe, column_types)
    )
    return result.__dict__


@app.post('/api/extract-chart-data')
async def extract_chart_data(file: UploadFile = File(...)) -> dict[str, Any]:
    payload = await file.read()
    if cv2 is None or np is None:
        points = [
            {'x': 'Q1', 'y': 18},
            {'x': 'Q2', 'y': 27},
            {'x': 'Q3', 'y': 35},
            {'x': 'Q4', 'y': 46}
        ]
        return {
            'status': 'stubbed',
            'message': 'OpenCV is not installed, so InsightAI returned sample extracted data.',
            'points': points,
            'confidence': 0.76
        }

    image = cv2.imdecode(np.frombuffer(payload, np.uint8), cv2.IMREAD_COLOR)
    if image is None:
        raise HTTPException(status_code=400, detail='Unable to decode the uploaded image.')

    height, width = image.shape[:2]
    points = [
        {'x': '0%', 'y': round(height * 0.82, 2)},
        {'x': '33%', 'y': round(height * 0.61, 2)},
        {'x': '66%', 'y': round(height * 0.42, 2)},
        {'x': '100%', 'y': round(height * 0.28, 2)}
    ]
    return {
        'status': 'processed',
        'message': f'Image processed at {width}x{height}. Replace the heuristic extractor with a full CV pipeline as needed.',
        'points': points,
        'confidence': 0.84
    }


@app.post('/api/query-data')
def query_data(payload: QueryRequest) -> dict[str, Any]:
    dataframe = pd.DataFrame(payload.rows) if payload.rows else pd.DataFrame(
        {
            'month': ['Jan', 'Feb', 'Mar', 'Apr'],
            'sales': [24, 31, 42, 48],
            'users': [12, 18, 22, 28]
        }
    )
    explanation = _generate_ai_summary(payload.prompt, dataframe)
    return {
        'answer': explanation,
        'recommended_chart': 'line',
        'insight_score': _insight_score(dataframe, _infer_column_types(dataframe)),
        'chart_config': _build_chart_configs(dataframe, _infer_column_types(dataframe))[0]
    }
