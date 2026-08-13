from fastapi import APIRouter, Depends

from app.ai.provider import MockLLMProvider
from app.ai.schemas import ImproveTextRequest, ImproveTextResponse
from app.ai.service import AIService
from app.api.dependencies import get_current_user
from app.models.user import User
from app.ai.provider import GroqProvider
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.project import Project
from app.models.resume import Resume
from app.models.experience import Experience
from app.models.candidate_profile import CandidateProfile
from app.ai.jd_schemas import JobDescriptionAnalysis
from app.models.job_description import JobDescription

from app.ai.context_builder import build_resume_ai_context
from app.ai.schemas import (
    GenerateResumeRequest,
    GeneratedResumeResponse,
)
from app.models.resume import Resume

from app.ai.schemas import (
    ImproveExperienceRequest,
    ImproveExperienceResponse,
    ImproveProjectRequest,
    ImproveProjectResponse,
    ImproveTextRequest,
    ImproveTextResponse,
    ImproveSummaryRequest,
    ImproveSummaryResponse,
)

from sqlalchemy import func, select

from app.models.resume_version import ResumeVersion
from app.ai.schemas import (
    GenerateAndSaveResumeResponse,
)


router = APIRouter(
    prefix="/ai",
    tags=["AI"],
)


def get_ai_service() -> AIService:
    return AIService(
        provider=GroqProvider()
    )


@router.post(
    "/improve-text",
    response_model=ImproveTextResponse,
)
def improve_text(
    request: ImproveTextRequest,
    current_user: User = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service),
):
    try:
        return ai_service.improve_text(request.text)
    except RuntimeError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is temporarily unavailable",
        )


@router.post(
    "/improve-project/{resume_id}/{project_id}",
    response_model=ImproveProjectResponse,
)
def improve_project(
    resume_id: int,
    project_id: int,
    request: ImproveProjectRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    ai_service: AIService = Depends(get_ai_service),
):
    project = db.scalar(
        select(Project)
        .join(Resume, Project.resume_id == Resume.id)
        .where(
            Project.id == project_id,
            Project.resume_id == resume_id,
            Resume.user_id == current_user.id,
        )
    )

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    try:
        return ai_service.improve_project(
            project_id=project.id,
            title=project.title,
            role=project.role,
            technologies=project.technologies,
            description=project.description,
            instruction=request.instruction,
        )
    except RuntimeError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is temporarily unavailable",
        )    
    


@router.post(
    "/improve-experience/{resume_id}/{experience_id}",
    response_model=ImproveExperienceResponse,
)
def improve_experience(
    resume_id: int,
    experience_id: int,
    request: ImproveExperienceRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    ai_service: AIService = Depends(get_ai_service),
):
    experience = db.scalar(
        select(Experience)
        .join(
            Resume,
            Experience.resume_id == Resume.id,
        )
        .where(
            Experience.id == experience_id,
            Experience.resume_id == resume_id,
            Resume.user_id == current_user.id,
        )
    )

    if experience is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experience not found",
        )

    try:
        return ai_service.improve_experience(
            experience_id=experience.id,
            company=experience.company,
            job_title=experience.job_title,
            employment_type=experience.employment_type,
            description=experience.description,
            instruction=request.instruction,
        )
    except RuntimeError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is temporarily unavailable",
        )



@router.post(
    "/improve-summary",
    response_model=ImproveSummaryResponse,
)
def improve_summary(
    request: ImproveSummaryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    ai_service: AIService = Depends(get_ai_service),
):
    profile = db.scalar(
        select(CandidateProfile).where(
            CandidateProfile.user_id == current_user.id
        )
    )

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate profile not found",
        )

    if not profile.summary:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Candidate profile has no summary",
        )

    try:
        return ai_service.improve_summary(
            professional_title=profile.professional_title,
            location=profile.location,
            summary=profile.summary,
            instruction=request.instruction,
        )
    except RuntimeError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is temporarily unavailable",
        )    


@router.post(
    "/generate-resume/{resume_id}",
    response_model=GeneratedResumeResponse,
)
def generate_resume(
    resume_id: int,
    request: GenerateResumeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    ai_service: AIService = Depends(get_ai_service),
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

        return ai_service.generate_resume(
            resume_id=resume.id,
            profile=context["profile"],
            education=context["education"],
            experience=context["experience"],
            skills=context["skills"],
            projects=context["projects"],
            certifications=context["certifications"],
            languages=context["languages"],
            achievements=context["achievements"],
            instruction=request.instruction,
        )

    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found",
        )

    except RuntimeError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is temporarily unavailable",
        )

@router.post(
    "/generate-resume/{resume_id}/save",
    response_model=GenerateAndSaveResumeResponse,
    status_code=status.HTTP_201_CREATED,
)
def generate_and_save_resume(
    resume_id: int,
    request: GenerateResumeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    ai_service: AIService = Depends(get_ai_service),
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

        generated = ai_service.generate_resume(
            resume_id=resume.id,
            profile=context["profile"],
            education=context["education"],
            experience=context["experience"],
            skills=context["skills"],
            projects=context["projects"],
            certifications=context["certifications"],
            languages=context["languages"],
            achievements=context["achievements"],
            instruction=request.instruction,
        )

        next_version = db.scalar(
            select(
                func.coalesce(
                    func.max(ResumeVersion.version_number),
                    0,
                ) + 1
            ).where(
                ResumeVersion.resume_id == resume.id
            )
        )

        version = ResumeVersion(
            resume_id=resume.id,
            version_number=next_version,
            content=generated.content,
        )

        db.add(version)
        db.commit()
        db.refresh(version)

        return GenerateAndSaveResumeResponse(
            resume_id=resume.id,
            version_id=version.id,
            version_number=version.version_number,
            content=version.content,
        )

    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found",
        )

    except RuntimeError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is temporarily unavailable",
        )


@router.post(
    "/analyze-job-description/{job_description_id}",
    response_model=JobDescriptionAnalysis,
)
def analyze_job_description(
    job_description_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    ai_service: AIService = Depends(get_ai_service),
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

    try:
        return ai_service.analyze_job_description(
            title=job_description.title,
            company=job_description.company,
            description=job_description.description,
        )

    except RuntimeError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service returned an invalid analysis",
        )