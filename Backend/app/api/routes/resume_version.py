from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.database.session import get_db
from app.models.resume import Resume
from app.models.resume_version import ResumeVersion
from app.models.user import User
from app.schemas.resume_version import (
    ResumeVersionCreate,
    ResumeVersionResponse,
)


router = APIRouter(
    prefix="/resumes/{resume_id}/versions",
    tags=["Resume Versions"],
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
    response_model=ResumeVersionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_resume_version(
    resume_id: int,
    version_data: ResumeVersionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_user_resume(resume_id, current_user, db)

    next_version = db.scalar(
        select(
            func.coalesce(
                func.max(ResumeVersion.version_number),
                0,
            ) + 1
        ).where(
            ResumeVersion.resume_id == resume_id
        )
    )

    version = ResumeVersion(
        resume_id=resume_id,
        version_number=next_version,
        content=version_data.content,
    )

    db.add(version)
    db.commit()
    db.refresh(version)

    return version


@router.get(
    "",
    response_model=list[ResumeVersionResponse],
)
def get_resume_versions(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_user_resume(resume_id, current_user, db)

    versions = db.scalars(
        select(ResumeVersion)
        .where(
            ResumeVersion.resume_id == resume_id
        )
        .order_by(
            ResumeVersion.version_number.desc()
        )
    ).all()

    return versions


@router.get(
    "/{version_id}",
    response_model=ResumeVersionResponse,
)
def get_resume_version(
    resume_id: int,
    version_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_user_resume(resume_id, current_user, db)

    version = db.scalar(
        select(ResumeVersion).where(
            ResumeVersion.id == version_id,
            ResumeVersion.resume_id == resume_id,
        )
    )

    if version is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume version not found",
        )

    return version