import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.ai.context_builder import build_resume_ai_context
from app.ai.jd_schemas import JobDescriptionAnalysis
from app.ai.provider import GroqProvider
from app.ai.schemas import (
    GenerateAndSaveResumeResponse,
    GenerateResumeRequest,
    GeneratedResumeResponse,
    ImproveExperienceRequest,
    ImproveExperienceResponse,
    ImproveProjectRequest,
    ImproveProjectResponse,
    ImproveSummaryRequest,
    ImproveSummaryResponse,
    ImproveTextRequest,
    ImproveTextResponse,
    TailoredResumeRequest,
    TailoredResumeResponse,
)
from app.ai.service import AIService
from app.api.dependencies import get_current_user
from app.database.session import get_db
from app.models.candidate_profile import CandidateProfile
from app.models.experience import Experience
from app.models.job_description import JobDescription
from app.models.job_description_analysis import JobDescriptionAnalysis
from app.models.project import Project
from app.models.resume import Resume
from app.models.resume_version import ResumeVersion
from app.models.user import User
from app.schemas.job_description_analysis import (
    JobDescriptionAnalysisResponse,
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
    response_model=JobDescriptionAnalysisResponse,
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
        analysis = ai_service.analyze_job_description(
            title=job_description.title,
            company=job_description.company,
            description=job_description.description,
        )

        existing_analysis = db.scalar(
            select(JobDescriptionAnalysis).where(
                JobDescriptionAnalysis.job_description_id
                == job_description.id
            )
        )

        analysis_data = {
            "job_description_id": job_description.id,
            "job_title": analysis.job_title,
            "required_skills": json.dumps(
                analysis.required_skills
            ),
            "preferred_skills": json.dumps(
                analysis.preferred_skills
            ),
            "experience_requirements": json.dumps(
                analysis.experience_requirements
            ),
            "education_requirements": json.dumps(
                analysis.education_requirements
            ),
            "keywords": json.dumps(
                analysis.keywords
            ),
        }

        if existing_analysis:
            for field, value in analysis_data.items():
                if field != "job_description_id":
                    setattr(existing_analysis, field, value)
        else:
            existing_analysis = JobDescriptionAnalysis(
                **analysis_data
            )
            db.add(existing_analysis)

        db.commit()
        db.refresh(existing_analysis)

        return JobDescriptionAnalysisResponse(
            id=existing_analysis.id,
            job_description_id=existing_analysis.job_description_id,
            job_title=existing_analysis.job_title,
            required_skills=json.loads(
                existing_analysis.required_skills or "[]"
            ),
            preferred_skills=json.loads(
                existing_analysis.preferred_skills or "[]"
            ),
            experience_requirements=json.loads(
                existing_analysis.experience_requirements or "[]"
            ),
            education_requirements=json.loads(
                existing_analysis.education_requirements or "[]"
            ),
            keywords=json.loads(
                existing_analysis.keywords or "[]"
            ),
            created_at=existing_analysis.created_at,
            updated_at=existing_analysis.updated_at,
        )

    except RuntimeError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service returned an invalid analysis",
        )

@router.get(
    "/job-description-analysis/{job_description_id}",
    response_model=JobDescriptionAnalysisResponse,
)
def get_job_description_analysis(
    job_description_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    analysis = db.scalar(
        select(JobDescriptionAnalysis)
        .join(
            JobDescription,
            JobDescriptionAnalysis.job_description_id
            == JobDescription.id,
        )
        .where(
            JobDescriptionAnalysis.job_description_id
            == job_description_id,
            JobDescription.user_id == current_user.id,
        )
    )

    if analysis is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job description analysis not found",
        )

    return JobDescriptionAnalysisResponse(
        id=analysis.id,
        job_description_id=analysis.job_description_id,
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
        created_at=analysis.created_at,
        updated_at=analysis.updated_at,
    )



@router.post(
    "/generate-tailored-resume/{resume_id}/{job_description_id}",
    response_model=TailoredResumeResponse,
)
def generate_tailored_resume(
    resume_id: int,
    job_description_id: int,
    request: TailoredResumeRequest,
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
        context = build_resume_ai_context(
            resume=resume,
            current_user=current_user,
            db=db,
        )

        return ai_service.generate_tailored_resume(
            resume_id=resume.id,
            job_description_id=job_description.id,
            profile=context["profile"],
            education=context["education"],
            experience=context["experience"],
            skills=context["skills"],
            projects=context["projects"],
            certifications=context["certifications"],
            languages=context["languages"],
            achievements=context["achievements"],
            job_description=job_description.description,
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