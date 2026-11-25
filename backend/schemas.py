from datetime import date
from typing import Literal
from urllib.parse import urlsplit

from pydantic import BaseModel, ConfigDict, Field, field_validator


MediaType = Literal["Movie", "TV Series"]
WatchStatus = Literal[
    "Want to Watch", "Currently Watching", "Completed", "On Hold", "Dropped"
]


class TitleBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    poster_url: str = Field(default="", max_length=1000)
    trailer_url: str = Field(default="", max_length=1000)
    stream_url: str = Field(default="", max_length=1000)
    description: str = Field(default="", max_length=10000)
    release_year: int = Field(ge=1888, le=2100)
    genre: str = Field(default="Uncategorized", max_length=120)
    media_type: MediaType
    director: str = Field(default="", max_length=200)
    cast: str = Field(default="", max_length=2000)
    imdb_rating: float | None = Field(default=None, ge=0, le=10)
    personal_rating: int | None = Field(default=None, ge=1, le=10)
    watch_status: WatchStatus = "Want to Watch"
    seasons: int | None = Field(default=None, ge=0, le=1000)
    episodes: int | None = Field(default=None, ge=0, le=10000)
    personal_notes: str = Field(default="", max_length=10000)
    date_added: date = Field(default_factory=date.today)

    @field_validator("title")
    @classmethod
    def title_must_not_be_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Title cannot be blank")
        return value

    @field_validator("poster_url")
    @classmethod
    def poster_url_must_be_http(cls, value: str) -> str:
        value = value.strip()
        parsed = urlsplit(value) if value else None
        if value and (parsed.scheme not in ("http", "https") or not parsed.hostname):
            raise ValueError("Poster URL must use HTTP or HTTPS")
        return value

    @field_validator("trailer_url")
    @classmethod
    def trailer_url_must_be_youtube(cls, value: str) -> str:
        value = value.strip()
        if not value:
            return value
        parsed = urlsplit(value)
        hostname = (parsed.hostname or "").lower().replace("www.", "")
        if parsed.scheme not in ("http", "https") or hostname not in ("youtube.com", "m.youtube.com", "youtu.be"):
            raise ValueError("Trailer URL must be a YouTube URL")
        return value

    @field_validator("stream_url")
    @classmethod
    def stream_url_must_be_http(cls, value: str) -> str:
        value = value.strip()
        if not value:
            return value
        parsed = urlsplit(value)
        if parsed.scheme not in ("http", "https") or not parsed.hostname:
            raise ValueError("Video URL must use HTTP or HTTPS")
        return value


class TitleCreate(TitleBase):
    pass


class TitleUpdate(TitleBase):
    pass


class TitleRead(TitleBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_favorite: bool


class ImportCollection(BaseModel):
    titles: list[TitleCreate] = Field(max_length=1000)
