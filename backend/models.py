from datetime import date

from sqlalchemy import Boolean, Date, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class Title(Base):
    __tablename__ = "titles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    poster_url: Mapped[str] = mapped_column(String(1000), default="")
    trailer_url: Mapped[str] = mapped_column(String(1000), default="")
    stream_url: Mapped[str] = mapped_column(String(1000), default="")
    description: Mapped[str] = mapped_column(Text, default="")
    release_year: Mapped[int] = mapped_column(Integer, nullable=False)
    genre: Mapped[str] = mapped_column(String(120), default="Uncategorized")
    media_type: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    director: Mapped[str] = mapped_column(String(200), default="")
    cast: Mapped[str] = mapped_column(Text, default="")
    imdb_rating: Mapped[float | None] = mapped_column(nullable=True)
    personal_rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    watch_status: Mapped[str] = mapped_column(
        String(30), default="Want to Watch", index=True
    )
    seasons: Mapped[int | None] = mapped_column(Integer, nullable=True)
    episodes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    personal_notes: Mapped[str] = mapped_column(Text, default="")
    is_favorite: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    date_added: Mapped[date] = mapped_column(Date, default=date.today, index=True)
