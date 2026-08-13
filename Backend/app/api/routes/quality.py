from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.ai.context_builder import build_resume_ai_context
from app.database.session import get_db
from app.models.resume import Resume
from app.models.user import User
from app.quality.schemas import ResumeQualityResponse
from app.quality.service import calculate_resume_quality


router = APIRouter(
    prefix="/resume-quality",
    tags=["Resume Quality"],
)


@router.get(
    "/{resume_id}",
    response_model=ResumeQualityResponse,
)
def get_resume_quality(
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

    context = build_resume_ai_context(
        resume=resume,
        current_user=current_user,
        db=db,
    )

    return calculate_resume_quality(
        resume_id=resume.id,
        summary=context["profile"],
        experience=context["experience"],
        skills=context["skills"],
        projects=context["projects"],
        education=context["education"],
    )