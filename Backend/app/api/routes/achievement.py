from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.database.session import get_db
from app.models.achievement import Achievement
from app.models.resume import Resume
from app.models.user import User
from app.schemas.achievement import (
    AchievementCreate,
    AchievementResponse,
    AchievementUpdate,
)


router = APIRouter(
    prefix="/resumes/{resume_id}/achievements",
    tags=["Achievements"],
)


def get_user_resume(
    resume_id: int,
    current_user: User,
    db: Session,
) -> Resume:
    resume = db.scalar(
        select(Resume).where(
            Resume.id == resume_id,
            Resume.user_id == current_user.id,
        )
    )

    if resume is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found",
        )

    return resume


@router.post(
    "",
    response_model=AchievementResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_achievement(
    resume_id: int,
    achievement_data: AchievementCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_user_resume(resume_id, current_user, db)

    achievement = Achievement(
        resume_id=resume_id,
        **achievement_data.model_dump(),
    )

    db.add(achievement)
    db.commit()
    db.refresh(achievement)

    return achievement


@router.get(
    "",
    response_model=list[AchievementResponse],
)
def get_achievements(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_user_resume(resume_id, current_user, db)

    achievements = db.scalars(
        select(Achievement)
        .where(Achievement.resume_id == resume_id)
        .order_by(
            Achievement.year.desc().nullslast(),
            Achievement.id.desc(),
        )
    ).all()

    return achievements


@router.put(
    "/{achievement_id}",
    response_model=AchievementResponse,
)
def update_achievement(
    resume_id: int,
    achievement_id: int,
    achievement_data: AchievementUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_user_resume(resume_id, current_user, db)

    achievement = db.scalar(
        select(Achievement).where(
            Achievement.id == achievement_id,
            Achievement.resume_id == resume_id,
        )
    )

    if achievement is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Achievement not found",
        )

    update_data = achievement_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(achievement, field, value)

    db.commit()
    db.refresh(achievement)

    return achievement


@router.delete(
    "/{achievement_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_achievement(
    resume_id: int,
    achievement_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_user_resume(resume_id, current_user, db)

    achievement = db.scalar(
        select(Achievement).where(
            Achievement.id == achievement_id,
            Achievement.resume_id == resume_id,
        )
    )

    if achievement is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Achievement not found",
        )

    db.delete(achievement)
    db.commit()