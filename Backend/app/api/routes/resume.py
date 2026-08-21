from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from app.models.job_description import JobDescription
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.database.session import get_db
from app.models.resume import Resume
from app.models.user import User
from app.services.resume_canonicalization_service import (
    find_canonical_resume_id,
)
from app.schemas.resume import (
    ResumeCreate,
    ResumeCanonicalizationResponse,
    ResumeResponse,
    ResumeUpdate,
)


router = APIRouter(
    prefix="/resumes",
    tags=["Resumes"],
)


# ==========================================================
# CREATE RESUME
# ==========================================================

@router.post(
    "",
    response_model=ResumeResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_resume(
    resume_data: ResumeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = Resume(
        user_id=current_user.id,
        title=resume_data.title,
        job_description_id=resume_data.job_description_id,
        template_id=resume_data.template_id,
        template=resume_data.template,
    )

    db.add(resume)
    db.commit()
    db.refresh(resume)

    return resume


# ==========================================================
# GET CURRENT USER'S RESUMES
# ==========================================================

@router.get(
    "",
    response_model=list[ResumeResponse],
)
def get_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resumes = db.scalars(
        select(Resume)
        .where(
            Resume.user_id == current_user.id
        )
        .order_by(
            Resume.created_at.desc(),
            Resume.id.desc(),
        )
    ).all()

    unique_resumes = {}
    for resume in resumes:
        unique_resumes.setdefault(resume.id, resume)

    return list(unique_resumes.values())


# ==========================================================
# CANONICALIZE PERSISTED RESUME CONTENT
# ==========================================================

@router.post(
    "/{resume_id}/canonicalize",
    response_model=ResumeCanonicalizationResponse,
)
def canonicalize_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
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

    return ResumeCanonicalizationResponse(
        canonical_resume_id=find_canonical_resume_id(db, resume),
    )


# ==========================================================
# GET SINGLE RESUME
# ==========================================================

@router.get(
    "/{resume_id}",
    response_model=ResumeResponse,
)
def get_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
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


# ==========================================================
# UPDATE RESUME
# ==========================================================

@router.put(
    "/{resume_id}",
    response_model=ResumeResponse,
)
def update_resume(
    resume_id: int,
    resume_data: ResumeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
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

    update_data = resume_data.model_dump(
        exclude_unset=True
    )

    # Validate Job Description ownership
    if "job_description_id" in update_data:
        job_description_id = update_data["job_description_id"]

        if job_description_id is not None:
            job_description = db.scalar(
                select(JobDescription).where(
                    JobDescription.id == job_description_id,
                    JobDescription.user_id == current_user.id,
                )
            )

            if job_description is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Job description not found",
                )

    # Apply updates
    for field, value in update_data.items():
        setattr(resume, field, value)

    db.commit()
    db.refresh(resume)

    return resume


# ==========================================================
# DELETE RESUME
# ==========================================================

@router.delete(
    "/{resume_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
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

    db.delete(resume)
    db.commit()

    return None