# InsightAI – Smart Data Visualization Copilot

InsightAI is a premium AI-powered analytics workspace that helps teams upload datasets, generate interactive visualizations, recommend the best chart types, extract data from chart images, and query data using natural language.

## Project structure

```text
.
├── backend
│   ├── .env.example
│   ├── main.py
│   └── requirements.txt
├── frontend
│   ├── app
│   │   ├── api
│   │   └── ...
│   ├── components
│   ├── lib
│   ├── package.json
│   ├── postcss.config.js
│   └── tailwind.config.js
└── README.md
```

## Features

- Drag-and-drop upload for CSV, Excel, JSON, PNG, and JPG files.
- Live dataset analysis in the frontend with schema detection, AI chart recommendations, and insight cards.
- Interactive chart rendering for line, bar, scatter, and heatmap-style views.
- Image-to-data extraction workflow with editable table preview and re-plotting.
- Natural-language “Ask Data” experience with generated chart responses.
- Dark-mode-first glassmorphism UI with responsive sidebar and bento dashboard layout.

## Frontend setup (Next.js + Tailwind)

```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:3000` by default.

### Frontend API routes

The Next.js app includes deployable API routes for Vercel-hosted usage:
- `POST /api/analyze`
- `POST /api/extract-chart`
- `POST /api/query`

These routes power the live upload/chat experiences used by the dashboard pages.

## Backend setup (FastAPI + Pandas)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

The API runs on `http://localhost:8000`.

## Backend API overview

### `POST /api/analyze-data`
Upload a CSV, Excel, or JSON file to receive:
- inferred column types
- recommended chart types
- auto-generated insights
- sample rows
- chart configs
- AI insight score

### `POST /api/extract-chart-data`
Upload a PNG or JPG chart to receive extracted x-y pairs and a confidence score. The current implementation includes a stubbed fallback and a heuristic OpenCV-ready path so it can be extended safely.

### `POST /api/query-data`
Submit a natural-language prompt with optional rows to receive an AI-generated explanation, recommended chart type, insight score, and chart config.

## Deploying to Vercel

Deploy the `frontend/` directory as the project root in Vercel so the Next.js UI and API routes ship together:

```bash
cd frontend
npx vercel
```

For production deployment:

```bash
cd frontend
npx vercel --prod
```

If you want the separate FastAPI backend in production as well, deploy `backend/` independently (for example on Railway, Render, Fly.io, or another Python-friendly host) and point the frontend at that service later.

## Environment variables

Backend env variables are documented in `backend/.env.example`:
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

If no OpenAI key is provided, the backend uses deterministic heuristic responses so the app still works locally.

## Notes

- The frontend now performs real file upload analysis through Next.js API routes instead of relying only on static mock content.
- The backend endpoints remain available as a separate production-oriented scaffold for teams that want a dedicated Python analytics service.
- Replace the image extraction heuristic with a specialized CV pipeline for higher-fidelity chart digitization in production.
