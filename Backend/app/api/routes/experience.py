from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.database.session import get_db
from app.models.experience import Experience
from app.models.resume import Resume
from app.models.user import User
from app.schemas.experience import (
    ExperienceCreate,
    ExperienceResponse,
    ExperienceUpdate,
)


router = APIRouter(
    prefix="/resumes/{resume_id}/experience",
    tags=["Experience"],
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
    response_model=ExperienceResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_experience(
    resume_id: int,
    experience_data: ExperienceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_user_resume(resume_id, current_user, db)

    experience = Experience(
        resume_id=resume_id,
        **experience_data.model_dump(),
    )

    db.add(experience)
    db.commit()
    db.refresh(experience)

    return experience

@router.get(
    "",
    response_model=list[ExperienceResponse],
)
def get_experience(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_user_resume(resume_id, current_user, db)

    experiences = db.scalars(
        select(Experience)
        .where(Experience.resume_id == resume_id)
        .order_by(
            Experience.start_date.desc().nullslast(),
            Experience.id.desc(),
        )
    ).all()

    return experiences


@router.put(
    "/{experience_id}",
    response_model=ExperienceResponse,
)
def update_experience(
    resume_id: int,
    experience_id: int,
    experience_data: ExperienceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_user_resume(resume_id, current_user, db)

    experience = db.scalar(
        select(Experience).where(
            Experience.id == experience_id,
            Experience.resume_id == resume_id,
        )
    )

    if experience is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experience record not found",
        )

    update_data = experience_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(experience, field, value)

    db.commit()
    db.refresh(experience)

    return experience



@router.delete(
    "/{experience_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_experience(
    resume_id: int,
    experience_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_user_resume(resume_id, current_user, db)

    experience = db.scalar(
        select(Experience).where(
            Experience.id == experience_id,
            Experience.resume_id == resume_id,
        )
    )

    if experience is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experience record not found",
        )

    db.delete(experience)
    db.commit()