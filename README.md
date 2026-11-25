# CineVault

CineVault is a personal movie and TV series collection manager with a responsive vanilla-JS frontend and a FastAPI/SQLite backend. Collection data is stored in `backend/database.db` and persists across restarts. On first startup, four sample titles are added automatically.

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
Set-Location backend
python -m uvicorn main:app --reload
```

The API is at `http://127.0.0.1:8000`; interactive API documentation is at `http://127.0.0.1:8000/docs`.

### 2. Start the frontend

From the project root in the second terminal:

```powershell
py -m http.server 5500 --directory frontend
```

Open `http://127.0.0.1:5500`. The frontend calls the API at `http://127.0.0.1:8000/api`. To use another API address, set `window.CINEVAULT_API` before loading `js/api.js`.

## Features

- Dashboard statistics, currently-watching pick-up card, recently added titles, favorites, and watchlist summary.
- Search and filter the collection by title/cast/genre, type, genre, status, year, and personal rating. Sort and switch between grid/list layouts.
- Create, view, edit, rate, favorite, change status, and delete movies and series.
- Import/export JSON collections, responsive layout, light/dark appearance, and toast/error feedback.
- API routes: `/api/titles`, `/api/titles/{id}`, `/api/favorites`, `/api/favorites/{id}`, `/api/statistics`, and `/api/watchlist`. OpenAPI docs include the additional JSON import/export and health routes.

## Data and validation

SQLite is initialized automatically in `backend/database.db`. Deleting that file resets the collection and causes the sample collection to be seeded again on the next API start. Title fields are validated by Pydantic; poster URLs must be HTTP(S), ratings and year values are range-checked, and missing title IDs return 404.
