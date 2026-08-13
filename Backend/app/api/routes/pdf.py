from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.database.session import get_db
from app.models.resume import Resume
from app.models.resume_version import ResumeVersion
from app.models.user import User
from app.pdf.generator import generate_resume_pdf


router = APIRouter(
    prefix="/resumes",
    tags=["Resume PDF"],
)


@router.get(
    "/{resume_id}/versions/{version_id}/pdf",
)
def download_resume_pdf(
    resume_id: int,
    version_id: int,
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

    pdf_buffer, filename = generate_resume_pdf(
        content=version.content,
        filename=f"resume_v{version.version_number}.pdf",
    )

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                f'attachment; filename="{filename}"'
            )
        },
    )