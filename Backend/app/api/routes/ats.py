import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ai.provider import GroqProvider
from app.ai.service import AIService
from app.ats.schemas import (
    ATSOptimizationResponse,
    ATSScoreResponse,
    OptimizeSectionRequest,
    OptimizeSectionResponse,
)

from app.ai.jd_schemas import JobDescriptionAnalysis
from app.ai.service import AIService
from app.api.dependencies import get_current_user
from app.ai.context_builder import build_resume_ai_context
from app.ats.schemas import (
    ATSOptimizationResponse,
    ATSScoreResponse,
)
from app.ats.service import calculate_ats_score
from app.database.session import get_db
from app.models.job_description import JobDescription
from app.models.job_description_analysis import (
    JobDescriptionAnalysis as JobDescriptionAnalysisModel,
)
from app.models.resume import Resume
from app.models.user import User
from app.ai.provider import GroqProvider




router = APIRouter(
    prefix="/ats",
    tags=["ATS"],
)


@router.post(
    "/score/{resume_id}/{job_description_id}",
    response_model=ATSScoreResponse,
)
def calculate_resume_ats_score(
    resume_id: int,
    job_description_id: int,
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

    context = build_resume_ai_context(
        resume=resume,
        current_user=current_user,
        db=db,
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
        line.split("|")[0].replace("-", "").strip()
        for line in context["skills"].splitlines()
        if line.strip()
    ]

    return calculate_ats_score(
        resume_id=resume.id,
        job_description_id=job_description.id,
        profile_text=context["profile"],
        resume_skills=resume_skills,
        experience_text=context["experience"],
        project_text=context["projects"],
        education_text=context["education"],
        analysis=parsed_analysis,
    )



@router.post(
    "/optimize/{resume_id}/{job_description_id}",
    response_model=ATSOptimizationResponse,
)
def optimize_resume_for_job(
    resume_id: int,
    job_description_id: int,
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

    context = build_resume_ai_context(
        resume=resume,
        current_user=current_user,
        db=db,
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

    # Use the existing Groq service.
    ai_service = AIService(
        provider=GroqProvider()
    )

    try:
        return ai_service.optimize_resume_for_job(
            resume_id=resume.id,
            job_description_id=job_description.id,
            score=ats_result.overall_score,
            matched_skills=ats_result.matched_skills,
            missing_skills=ats_result.missing_skills,
            matched_keywords=ats_result.matched_keywords,
            missing_keywords=ats_result.missing_keywords,
            profile=context["profile"],
            experience=context["experience"],
            projects=context["projects"],
            job_description=job_description.description,
        )

    except RuntimeError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI optimization service is temporarily unavailable",
        )

@router.post(
    "/optimize-section/{resume_id}/{job_description_id}",
    response_model=OptimizeSectionResponse,
)
def optimize_resume_section(
    resume_id: int,
    job_description_id: int,
    request: OptimizeSectionRequest,
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

    section = request.section.strip().lower()

    context = build_resume_ai_context(
        resume=resume,
        current_user=current_user,
        db=db,
    )

    section_map = {
        "summary": context["profile"],
        "experience": context["experience"],
        "projects": context["projects"],
        "skills": context["skills"],
    }

    if section not in section_map:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Unsupported section. "
                "Use summary, experience, projects, or skills."
            ),
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

    missing_skills = json.loads(
        analysis.required_skills or "[]"
    )

    missing_keywords = json.loads(
        analysis.keywords or "[]"
    )

    ai_service = AIService(
        provider=GroqProvider()
    )

    try:
        return ai_service.optimize_section(
            resume_id=resume.id,
            section=section,
            original_content=section_map[section],
            job_description=job_description.description,
            missing_skills=missing_skills,
            missing_keywords=missing_keywords,
            instruction=request.instruction,
        )

    except RuntimeError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI optimization service is temporarily unavailable",
        )