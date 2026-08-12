from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.database.session import get_db
from app.models.language import Language
from app.models.resume import Resume
from app.models.user import User
from app.schemas.language import (
    LanguageCreate,
    LanguageResponse,
    LanguageUpdate,
)


router = APIRouter(
    prefix="/resumes/{resume_id}/languages",
    tags=["Languages"],
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
    response_model=LanguageResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_language(
    resume_id: int,
    language_data: LanguageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_user_resume(resume_id, current_user, db)

    language = Language(
        resume_id=resume_id,
        **language_data.model_dump(),
    )

    db.add(language)
    db.commit()
    db.refresh(language)

    return language


@router.get(
    "",
    response_model=list[LanguageResponse],
)
def get_languages(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_user_resume(resume_id, current_user, db)

    languages = db.scalars(
        select(Language)
        .where(Language.resume_id == resume_id)
        .order_by(
            Language.name.asc(),
            Language.id.asc(),
        )
    ).all()

    return languages


@router.put(
    "/{language_id}",
    response_model=LanguageResponse,
)
def update_language(
    resume_id: int,
    language_id: int,
    language_data: LanguageUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_user_resume(resume_id, current_user, db)

    language = db.scalar(
        select(Language).where(
            Language.id == language_id,
            Language.resume_id == resume_id,
        )
    )

    if language is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Language not found",
        )

    update_data = language_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(language, field, value)

    db.commit()
    db.refresh(language)

    return language


@router.delete(
    "/{language_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_language(
    resume_id: int,
    language_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_user_resume(resume_id, current_user, db)

    language = db.scalar(
        select(Language).where(
            Language.id == language_id,
            Language.resume_id == resume_id,
        )
    )

    if language is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Language not found",
        )

    db.delete(language)
    db.commit()