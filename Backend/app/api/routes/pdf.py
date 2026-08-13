from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.ai.context_builder import build_resume_ai_context
from app.database.session import get_db
from app.models.resume import Resume
from app.models.user import User
from app.pdf.generator import generate_resume_pdf


router = APIRouter(
    prefix="/resumes",
    tags=["Resume PDF"],
)


@router.get("/{resume_id}/pdf")
def download_resume_pdf(
    resume_id: int,
    template: str = "classic",
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

    try:
        context = build_resume_ai_context(
            resume=resume,
            current_user=current_user,
            db=db,
        )

        content = "\n\n".join(
            [
                context["profile"],
                context["experience"],
                context["education"],
                context["skills"],
                context["projects"],
                context["certifications"],
                context["languages"],
                context["achievements"],
            ]
        )

        pdf_buffer, filename = generate_resume_pdf(
            content=content,
            filename=f"resume_{resume.id}_{template}.pdf",
            template=template,
        )

        return Response(
            content=pdf_buffer.getvalue(),
            media_type="application/pdf",
            headers={
                "Content-Disposition": (
                    f'attachment; filename="{filename}"'
                ),
            },
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )