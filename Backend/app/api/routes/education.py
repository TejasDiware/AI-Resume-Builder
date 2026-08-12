from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.database.session import get_db
from app.models.education import Education
from app.models.resume import Resume
from app.models.user import User
from app.schemas.education import (
    EducationCreate,
    EducationResponse,
    EducationUpdate,
)


router = APIRouter(
    prefix="/resumes/{resume_id}/education",
    tags=["Education"],
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
    response_model=EducationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_education(
    resume_id: int,
    education_data: EducationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_user_resume(resume_id, current_user, db)

    education = Education(
        resume_id=resume_id,
        **education_data.model_dump(),
    )

    db.add(education)
    db.commit()
    db.refresh(education)

    return education



@router.get(
    "",
    response_model=list[EducationResponse],
)
def get_education(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_user_resume(resume_id, current_user, db)

    education_records = db.scalars(
        select(Education)
        .where(Education.resume_id == resume_id)
        .order_by(
            Education.start_date.desc().nullslast(),
            Education.id.desc(),
        )
    ).all()

    return education_records

@router.put(
    "/{education_id}",
    response_model=EducationResponse,
)
def update_education(
    resume_id: int,
    education_id: int,
    education_data: EducationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_user_resume(resume_id, current_user, db)

    education = db.scalar(
        select(Education).where(
            Education.id == education_id,
            Education.resume_id == resume_id,
        )
    )

    if education is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Education record not found",
        )

    update_data = education_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(education, field, value)

    db.commit()
    db.refresh(education)

    return education



@router.delete(
    "/{education_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_education(
    resume_id: int,
    education_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_user_resume(resume_id, current_user, db)

    education = db.scalar(
        select(Education).where(
            Education.id == education_id,
            Education.resume_id == resume_id,
        )
    )

    if education is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Education record not found",
        )

    db.delete(education)
    db.commit()