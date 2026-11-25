from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from auth import require_admin
from database import get_db
from models import Title
from schemas import TitleRead

router = APIRouter(prefix="/api/favorites", tags=["favorites"])


@router.get("", response_model=list[TitleRead])
def list_favorites(db: Session = Depends(get_db)):
    return db.scalars(
        select(Title).where(Title.is_favorite.is_(True)).order_by(Title.title)
    ).all()


@router.post(
    "/{title_id}",
    response_model=TitleRead,
    dependencies=[Depends(require_admin)],
)
def add_favorite(title_id: int, db: Session = Depends(get_db)):
    title = db.get(Title, title_id)
    if title is None:
        raise HTTPException(status_code=404, detail="Title not found")
    title.is_favorite = True
    db.commit()
    db.refresh(title)
    return title


@router.delete(
    "/{title_id}",
    response_model=TitleRead,
    dependencies=[Depends(require_admin)],
)
def remove_favorite(title_id: int, db: Session = Depends(get_db)):
    title = db.get(Title, title_id)
    if title is None:
        raise HTTPException(status_code=404, detail="Title not found")
    title.is_favorite = False
    db.commit()
    db.refresh(title)
    return title
