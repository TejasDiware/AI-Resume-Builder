from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.database.session import get_db
from app.models.job_description import JobDescription
from app.models.user import User
from app.schemas.job_description import (
    JobDescriptionCreate,
    JobDescriptionResponse,
    JobDescriptionUpdate,
)


router = APIRouter(
    prefix="/job-descriptions",
    tags=["Job Descriptions"],
)


@router.post(
    "",
    response_model=JobDescriptionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_job_description(
    jd_data: JobDescriptionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    job_description = JobDescription(
        user_id=current_user.id,
        **jd_data.model_dump(),
    )

    db.add(job_description)
    db.commit()
    db.refresh(job_description)

    return job_description


@router.get(
    "",
    response_model=list[JobDescriptionResponse],
)
def get_job_descriptions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    job_descriptions = db.scalars(
        select(JobDescription)
        .where(
            JobDescription.user_id == current_user.id
        )
        .order_by(
            JobDescription.created_at.desc(),
            JobDescription.id.desc(),
        )
    ).all()

    return job_descriptions


@router.get(
    "/{job_description_id}",
    response_model=JobDescriptionResponse,
)
def get_job_description(
    job_description_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
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

    return job_description


@router.put(
    "/{job_description_id}",
    response_model=JobDescriptionResponse,
)
def update_job_description(
    job_description_id: int,
    jd_data: JobDescriptionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
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

    update_data = jd_data.model_dump(
        exclude_unset=True,
    )

    for field, value in update_data.items():
        setattr(job_description, field, value)

    db.commit()
    db.refresh(job_description)

    return job_description


@router.delete(
    "/{job_description_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_job_description(
    job_description_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
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

    db.delete(job_description)
    db.commit()