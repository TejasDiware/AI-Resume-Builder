from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ai.provider import GroqProvider
from app.ai.service import AIService
from app.quality.schemas import (
    AIResumeQualityResponse,
)

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



@router.get(
    "/{resume_id}/ai-recommendations",
    response_model=AIResumeQualityResponse,
)
def get_ai_resume_quality_recommendations(
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

    quality = calculate_resume_quality(
        resume_id=resume.id,
        summary=context["profile"],
        experience=context["experience"],
        skills=context["skills"],
        projects=context["projects"],
        education=context["education"],
    )

    resume_context = "\n\n".join(
        [
            context["profile"],
            context["experience"],
            context["skills"],
            context["projects"],
            context["education"],
        ]
    )

    ai_service = AIService(
        provider=GroqProvider()
    )

    try:
        return ai_service.generate_quality_recommendations(
            resume_id=resume.id,
            overall_score=quality.overall_score,
            completeness_score=quality.completeness_score,
            content_quality_score=quality.content_quality_score,
            ats_readiness_score=quality.ats_readiness_score,
            sections=quality.sections.model_dump_json(),
            issues=quality.issues,
            resume_context=resume_context,
        )

    except RuntimeError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI recommendation service is temporarily unavailable",
        )