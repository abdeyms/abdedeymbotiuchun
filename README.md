# CineVault

CineVault is a movie and TV series collection manager with a responsive vanilla-JS frontend and a FastAPI backend. Locally it uses SQLite; a shared deployment uses PostgreSQL so every visitor sees the same collection.

## Requirements

- Python 3.10+
- A modern browser

## Run locally (Windows PowerShell)

Open two PowerShell terminals from the project root.

### 1. Start the API

```powershell
py -m venv backend\.venv
backend\.venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements.txt
$env:ADMIN_TOKEN = "use-a-long-random-secret"
Set-Location backend
python -m uvicorn main:app --reload
```

The API is at `http://127.0.0.1:8000`; interactive API documentation is at `http://127.0.0.1:8000/docs`.

### 2. Start the frontend

From the project root in the second terminal:

```powershell
py -m http.server 5500 --directory frontend
```

Open `http://127.0.0.1:5500`. To use the local API, set `window.CINEVAULT_API` in `frontend/js/config.js` to `http://127.0.0.1:8000/api`.

## Deploy a shared collection

GitHub Pages only hosts the frontend; it cannot run the API or share browser-local data. The local-storage mode remains available for development, but use the hosted API steps below to share one collection.

1. If your current browser has titles saved locally, export them from the collection page before switching modes.
2. Create a PostgreSQL database on Neon and copy its connection string, including `sslmode=require`.
3. In Render, create a Blueprint from this GitHub repository and provide `DATABASE_URL` and a long random `ADMIN_TOKEN` when prompted. Keep both values private. The Blueprint deploys the API; PostgreSQL keeps the collection persistent.
4. After Render deploys, open its `/api/health` URL and confirm it returns `{"status":"ok"}`.
5. Set `window.CINEVAULT_API` in `frontend/js/config.js` to the Render API URL followed by `/api` (for example, `https://cinevault-api.onrender.com/api`), then push that change to `main`. GitHub Actions publishes the frontend to GitHub Pages automatically.
6. Import the JSON export from step 1 on the collection page to copy your existing local titles into the shared collection.
7. To add or change titles in the shared collection, use the site's add/edit actions and enter the `ADMIN_TOKEN` when prompted. The token is kept in memory only for the current page; it is never stored in the repository. Visitors can read the shared collection but cannot modify it.

## Features

- Dashboard statistics, currently-watching card, recent titles, favorites, and watchlist summary.
- Search and filter by title/cast/genre, type, status, year, and personal rating.
- Read a shared collection; only requests with the server-side admin token can create, edit, import, favorite, or delete titles.
- Import/export JSON collections, responsive layout, light/dark appearance, and error feedback.
- API routes: `/api/titles`, `/api/titles/{id}`, `/api/favorites`, `/api/favorites/{id}`, `/api/statistics`, and `/api/watchlist`.

## Data and validation

For local development, SQLite is initialized automatically in `backend/database.db`. The first API start seeds four sample titles. On Render, startup requires PostgreSQL to avoid silently using an ephemeral SQLite database. Set `ADMIN_TOKEN` locally as well if you want to test write access; without it, write routes are disabled. Title fields are validated by Pydantic; poster URLs must be HTTP(S), ratings and year values are range-checked, and missing title IDs return 404.
