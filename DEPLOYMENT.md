# Deployment

This project is configured for a Vercel frontend and a Render backend.

## Backend on Render

Create a new Render Blueprint from this repository, or create a Web Service manually with these settings:

- Runtime: Python
- Build command: `pip install -r backend/requirements.txt`
- Start command: `uvicorn backend.app:app --host 0.0.0.0 --port $PORT`
- Health check path: `/health`

Set these Render environment variables:

- `PYTHON_VERSION=3.11.9`
- `GEMINI_API_KEY=your_gemini_api_key`
- `FRONTEND_URL=https://your-vercel-app.vercel.app`
- `CORS_ORIGINS=https://your-vercel-app.vercel.app`
- `CORS_ALLOW_ORIGIN_REGEX=^https://.*\.vercel\.app$`

After Render deploys, copy the service URL, for example:

```text
https://emotional-chatbot-backend.onrender.com
```

## Frontend on Vercel

Import the same repository into Vercel. The root `vercel.json` builds the `frontend` folder automatically.

Set this Vercel environment variable:

- `VITE_API_URL=https://your-render-service.onrender.com`

Redeploy the frontend after setting `VITE_API_URL`.

## Local Examples

Copy `frontend/.env.example` to `frontend/.env.local` for local frontend settings.
Copy `backend/.env.example` to `backend/.env` or keep using the root `.env` for local backend settings.
