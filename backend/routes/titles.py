from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from database import get_db
from models import Title
from schemas import ImportCollection, TitleCreate, TitleRead, TitleUpdate

router = APIRouter(prefix="/api/titles", tags=["titles"])


@router.get("", response_model=list[TitleRead])
def list_titles(
    search: str | None = None,
    media_type: str | None = None,
    genre: str | None = None,
    year: int | None = Query(default=None, ge=1888, le=2100),
    min_rating: float | None = Query(default=None, ge=0, le=10),
    status: str | None = None,
    sort: str = "newest",
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    query = select(Title)
    if search:
        pattern = f"%{search.strip()}%"
        query = query.where(
            or_(Title.title.ilike(pattern), Title.genre.ilike(pattern), Title.cast.ilike(pattern))
        )
    if media_type in ("Movie", "TV Series"):
        query = query.where(Title.media_type == media_type)
    if genre:
        query = query.where(Title.genre.ilike(f"%{genre.strip()}%"))
    if year is not None:
        query = query.where(Title.release_year == year)
    if min_rating is not None:
        query = query.where(Title.personal_rating >= min_rating)
    if status:
        query = query.where(Title.watch_status == status)

    orderings = {
        "newest": (Title.date_added.desc(), Title.id.desc()),
        "oldest": (Title.date_added.asc(), Title.id.asc()),
        "rating": (Title.personal_rating.desc().nullslast(), Title.title.asc()),
        "alphabetical": (func.lower(Title.title).asc(),),
        "year": (Title.release_year.desc(), Title.title.asc()),
    }
    query = query.order_by(*orderings.get(sort, orderings["newest"]))
    return db.scalars(query.offset(offset).limit(limit)).all()


@router.get("/export", response_model=list[TitleRead])
def export_titles(db: Session = Depends(get_db)):
    return db.scalars(select(Title).order_by(Title.id)).all()


@router.post("/import", response_model=list[TitleRead], status_code=201)
def import_titles(payload: ImportCollection, db: Session = Depends(get_db)):
    titles = [Title(**item.model_dump()) for item in payload.titles]
    db.add_all(titles)
    db.commit()
    for title in titles:
        db.refresh(title)
    return titles


@router.get("/{title_id}", response_model=TitleRead)
def get_title(title_id: int, db: Session = Depends(get_db)):
    title = db.get(Title, title_id)
    if title is None:
        raise HTTPException(status_code=404, detail="Title not found")
    return title


@router.post("", response_model=TitleRead, status_code=201)
def create_title(payload: TitleCreate, db: Session = Depends(get_db)):
    title = Title(**payload.model_dump())
    db.add(title)
    db.commit()
    db.refresh(title)
    return title


@router.put("/{title_id}", response_model=TitleRead)
def update_title(title_id: int, payload: TitleUpdate, db: Session = Depends(get_db)):
    title = db.get(Title, title_id)
    if title is None:
        raise HTTPException(status_code=404, detail="Title not found")
    for key, value in payload.model_dump().items():
        setattr(title, key, value)
    db.commit()
    db.refresh(title)
    return title


@router.delete("/{title_id}", status_code=204)
def delete_title(title_id: int, db: Session = Depends(get_db)):
    title = db.get(Title, title_id)
    if title is None:
        raise HTTPException(status_code=404, detail="Title not found")
    db.delete(title)
    db.commit()
    return Response(status_code=204)
