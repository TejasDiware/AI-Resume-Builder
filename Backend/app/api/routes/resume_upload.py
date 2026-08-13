from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.database.session import get_db
from app.models.resume import Resume
from app.models.user import User
from app.services.resume_upload_service import (
    replace_resume_from_upload,
)


router = APIRouter(
    prefix="/resumes",
    tags=["Resume Upload"],
)


@router.post(
    "/{resume_id}/upload",
)
def upload_resume(
    resume_id: int,
    file: UploadFile,
    current_user: User = Depends(
        get_current_user
    ),
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

    return replace_resume_from_upload(
        db=db,
        resume=resume,
        current_user_id=current_user.id,
        file=file,
    )