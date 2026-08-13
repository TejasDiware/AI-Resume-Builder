import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ai.context_builder import build_resume_ai_context
from app.ai.jd_schemas import JobDescriptionAnalysis

from app.api.dependencies import get_current_user

from app.ats.service import calculate_ats_score
from app.database.session import get_db
from app.dashboard.schemas import DashboardResponse
from app.models.job_description import JobDescription
from app.models.job_description_analysis import (
    JobDescriptionAnalysis as JobDescriptionAnalysisModel,
)
from app.models.resume import Resume
from app.models.user import User
from app.quality.service import calculate_resume_quality


router = APIRouter(
    prefix="/dashboard",
    tags=["Candidate Dashboard"],
)


@router.get(
    "/{resume_id}",
    response_model=DashboardResponse,
)
def get_candidate_dashboard(
    resume_id: int,
    job_description_id: int | None = None,
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

    response = DashboardResponse(
        resume_id=resume.id,
        resume_quality_score=quality.overall_score,
        completeness_score=quality.completeness_score,
        issues=quality.issues,
        recommendations=quality.recommendations,
    )

    if job_description_id is None:
        return response

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

    analysis = db.scalar(
        select(JobDescriptionAnalysisModel).where(
            JobDescriptionAnalysisModel.job_description_id
            == job_description.id
        )
    )

    if analysis is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job description has not been analyzed yet",
        )

    parsed_analysis = JobDescriptionAnalysis(
        job_title=analysis.job_title,
        required_skills=json.loads(
            analysis.required_skills or "[]"
        ),
        preferred_skills=json.loads(
            analysis.preferred_skills or "[]"
        ),
        experience_requirements=json.loads(
            analysis.experience_requirements or "[]"
        ),
        education_requirements=json.loads(
            analysis.education_requirements or "[]"
        ),
        keywords=json.loads(
            analysis.keywords or "[]"
        ),
    )

    resume_skills = [
        line.split("|")[0]
        .replace("-", "")
        .strip()
        for line in context["skills"].splitlines()
        if line.strip()
    ]

    ats_result = calculate_ats_score(
        resume_id=resume.id,
        job_description_id=job_description.id,
        profile_text=context["profile"],
        resume_skills=resume_skills,
        experience_text=context["experience"],
        project_text=context["projects"],
        education_text=context["education"],
        analysis=parsed_analysis,
    )

    response.ats_score = ats_result.overall_score
    response.skills_score = ats_result.skills_score
    response.keywords_score = ats_result.keywords_score
    response.matched_skills = ats_result.matched_skills
    response.missing_skills = ats_result.missing_skills
    response.matched_keywords = ats_result.matched_keywords
    response.missing_keywords = ats_result.missing_keywords

    return response