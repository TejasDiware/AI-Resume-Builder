from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.database.session import get_db
from app.models.resume import Resume
from app.models.skill import Skill
from app.models.user import User
from app.schemas.skill import (
    SkillCreate,
    SkillResponse,
    SkillUpdate,
)


router = APIRouter(
    prefix="/resumes/{resume_id}/skills",
    tags=["Skills"],
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
    response_model=SkillResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_skill(
    resume_id: int,
    skill_data: SkillCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_user_resume(resume_id, current_user, db)

    skill = Skill(
        resume_id=resume_id,
        **skill_data.model_dump(),
    )

    db.add(skill)
    db.commit()
    db.refresh(skill)

    return skill


@router.get(
    "",
    response_model=list[SkillResponse],
)
def get_skills(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_user_resume(resume_id, current_user, db)

    skills = db.scalars(
        select(Skill)
        .where(Skill.resume_id == resume_id)
        .order_by(
            Skill.name.asc(),
            Skill.id.asc(),
        )
    ).all()

    return skills


@router.put(
    "/{skill_id}",
    response_model=SkillResponse,
)
def update_skill(
    resume_id: int,
    skill_id: int,
    skill_data: SkillUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_user_resume(resume_id, current_user, db)

    skill = db.scalar(
        select(Skill).where(
            Skill.id == skill_id,
            Skill.resume_id == resume_id,
        )
    )

    if skill is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found",
        )

    update_data = skill_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(skill, field, value)

    db.commit()
    db.refresh(skill)

    return skill


@router.delete(
    "/{skill_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_skill(
    resume_id: int,
    skill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_user_resume(resume_id, current_user, db)

    skill = db.scalar(
        select(Skill).where(
            Skill.id == skill_id,
            Skill.resume_id == resume_id,
        )
    )

    if skill is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found",
        )

    db.delete(skill)
    db.commit()