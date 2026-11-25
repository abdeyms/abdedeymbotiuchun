from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from database import get_db
from models import Title
from schemas import TitleRead

router = APIRouter(prefix="/api", tags=["statistics"])


@router.get("/statistics")
def statistics(db: Session = Depends(get_db)):
    rows = db.execute(
        select(Title.media_type, Title.watch_status, func.count(Title.id)).group_by(
            Title.media_type, Title.watch_status
        )
    ).all()
    counts = {(media_type, status): count for media_type, status, count in rows}
    total = sum(counts.values())
    return {
        "total": total,
        "movies": sum(value for (kind, _), value in counts.items() if kind == "Movie"),
        "series": sum(value for (kind, _), value in counts.items() if kind == "TV Series"),
        "currently_watching": sum(
            value for (_, status), value in counts.items() if status == "Currently Watching"
        ),
        "completed": sum(
            value for (_, status), value in counts.items() if status == "Completed"
        ),
        "completed_movies": counts.get(("Movie", "Completed"), 0),
        "completed_series": counts.get(("TV Series", "Completed"), 0),
        "watchlist": sum(
            value for (_, status), value in counts.items() if status == "Want to Watch"
        ),
        "favorites": db.scalar(
            select(func.count(Title.id)).where(Title.is_favorite.is_(True))
        ),
        "by_status": {
            status: sum(value for (_, key), value in counts.items() if key == status)
            for status in (
                "Want to Watch",
                "Currently Watching",
                "Completed",
                "On Hold",
                "Dropped",
            )
        },
        "average_rating": db.scalar(
            select(func.avg(Title.personal_rating)).where(
                Title.personal_rating.is_not(None)
            )
        ),
    }


@router.get("/watchlist", response_model=list[TitleRead])
def watchlist(db: Session = Depends(get_db)):
    return db.scalars(
        select(Title)
        .where(Title.watch_status == "Want to Watch")
        .order_by(Title.date_added.desc(), Title.id.desc())
    ).all()
