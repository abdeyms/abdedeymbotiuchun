from contextlib import asynccontextmanager
from datetime import date

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy import inspect, text

from database import Base, SessionLocal, engine
from models import Title
from routes import favorites, statistics, titles


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    columns = {column["name"] for column in inspect(engine).get_columns("titles")}
    if "trailer_url" not in columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE titles ADD COLUMN trailer_url VARCHAR(1000) NOT NULL DEFAULT ''"))
    if "stream_url" not in columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE titles ADD COLUMN stream_url VARCHAR(1000) NOT NULL DEFAULT ''"))
    with SessionLocal() as db:
        if db.scalar(select(Title.id).limit(1)) is None:
            samples = [
                Title(
                    title="Dune: Part Two",
                    poster_url="https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
                    description="Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
                    release_year=2024,
                    genre="Sci-Fi",
                    media_type="Movie",
                    director="Denis Villeneuve",
                    cast="Timothée Chalamet, Zendaya, Rebecca Ferguson",
                    imdb_rating=8.5,
                    personal_rating=9,
                    watch_status="Completed",
                    is_favorite=True,
                    date_added=date.today(),
                ),
                Title(
                    title="The Bear",
                    poster_url="https://image.tmdb.org/t/p/w500/sHFlbKS3WLqMnp9t2ghADIJFnuQ.jpg",
                    description="A young chef returns to Chicago to run his family's sandwich shop.",
                    release_year=2022,
                    genre="Drama",
                    media_type="TV Series",
                    director="Christopher Storer",
                    cast="Jeremy Allen White, Ayo Edebiri, Ebon Moss-Bachrach",
                    imdb_rating=8.6,
                    personal_rating=8,
                    watch_status="Currently Watching",
                    seasons=3,
                    episodes=28,
                    date_added=date.today(),
                ),
                Title(
                    title="Blade Runner 2049",
                    poster_url="https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
                    description="A young blade runner discovers a secret that could plunge what's left of society into chaos.",
                    release_year=2017,
                    genre="Sci-Fi",
                    media_type="Movie",
                    director="Denis Villeneuve",
                    cast="Ryan Gosling, Harrison Ford, Ana de Armas",
                    imdb_rating=8.0,
                    personal_rating=9,
                    watch_status="Want to Watch",
                    date_added=date.today(),
                ),
                Title(
                    title="Severance",
                    poster_url="https://image.tmdb.org/t/p/w500/lFf6LLrQjYldcZItzOkGmMMigP7.jpg",
                    description="Employees at a company undergo a procedure that separates their work and personal memories.",
                    release_year=2022,
                    genre="Thriller",
                    media_type="TV Series",
                    director="Ben Stiller",
                    cast="Adam Scott, Britt Lower, Patricia Arquette",
                    imdb_rating=8.7,
                    personal_rating=10,
                    watch_status="Want to Watch",
                    seasons=2,
                    episodes=19,
                    is_favorite=True,
                    date_added=date.today(),
                ),
            ]
            db.add_all(samples)
            db.commit()
    yield


app = FastAPI(title="CineVault API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(titles.router)
app.include_router(favorites.router)
app.include_router(statistics.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
