from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.database.session import get_db
from app.models.certification import Certification
from app.models.resume import Resume
from app.models.user import User
from app.schemas.certification import (
    CertificationCreate,
    CertificationResponse,
    CertificationUpdate,
)


router = APIRouter(
    prefix="/resumes/{resume_id}/certifications",
    tags=["Certifications"],
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


def normalize_certification_data(data: dict) -> dict:
    if data.get("credential_url") is not None:
        data["credential_url"] = str(data["credential_url"])

    return data


@router.post(
    "",
    response_model=CertificationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_certification(
    resume_id: int,
    certification_data: CertificationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_user_resume(resume_id, current_user, db)

    data = normalize_certification_data(
        certification_data.model_dump()
    )

    certification = Certification(
        resume_id=resume_id,
        **data,
    )

    db.add(certification)
    db.commit()
    db.refresh(certification)

    return certification

@router.get(
    "",
    response_model=list[CertificationResponse],
)
def get_certifications(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_user_resume(resume_id, current_user, db)

    certifications = db.scalars(
        select(Certification)
        .where(Certification.resume_id == resume_id)
        .order_by(
            Certification.issue_date.desc().nullslast(),
            Certification.id.desc(),
        )
    ).all()

    return certifications

@router.put(
    "/{certification_id}",
    response_model=CertificationResponse,
)
def update_certification(
    resume_id: int,
    certification_id: int,
    certification_data: CertificationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_user_resume(resume_id, current_user, db)

    certification = db.scalar(
        select(Certification).where(
            Certification.id == certification_id,
            Certification.resume_id == resume_id,
        )
    )

    if certification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certification not found",
        )

    update_data = certification_data.model_dump(exclude_unset=True)
    update_data = normalize_certification_data(update_data)

    for field, value in update_data.items():
        setattr(certification, field, value)

    db.commit()
    db.refresh(certification)

    return certification

@router.delete(
    "/{certification_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_certification(
    resume_id: int,
    certification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_user_resume(resume_id, current_user, db)

    certification = db.scalar(
        select(Certification).where(
            Certification.id == certification_id,
            Certification.resume_id == resume_id,
        )
    )

    if certification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certification not found",
        )

    db.delete(certification)
    db.commit()