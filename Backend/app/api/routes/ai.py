import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.ai.context_builder import (
    build_resume_ai_context,
    build_resume_generation_context,
)

from app.ai.jd_schemas import JobDescriptionAnalysis

from app.ai.provider import GroqProvider

from app.ai.schemas import (
    ApplyAIChangeRequest,
    ApplyTailoredResumeRequest,
    GenerateAndSaveResumeResponse,
    GenerateAndSaveTailoredResumeResponse,
    GenerateResumeContentRequest,
    GenerateResumeContentResponse,
    GenerateServiceHistoryRequest,
    GenerateServiceHistoryResponse,
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

from app.models.achievement import Achievement
from app.models.candidate_profile import CandidateProfile
from app.models.certification import Certification
from app.models.education import Education
from app.models.experience import Experience
from app.models.job_description import JobDescription
from app.models.job_description_analysis import (
    JobDescriptionAnalysis,
)
from app.models.language import Language
from app.models.project import Project
from app.models.resume import Resume
from app.models.skill import Skill
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
    "/generate-service-history/{resume_id}/{experience_id}",
    response_model=GenerateServiceHistoryResponse,
)
def generate_service_history(
    resume_id: int,
    experience_id: int,
    request: GenerateServiceHistoryRequest,
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

    profile = db.scalar(
        select(CandidateProfile).where(
            CandidateProfile.user_id == current_user.id,
        )
    )

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate profile not found",
        )

    try:
        context = build_resume_ai_context(
            resume=resume,
            current_user=current_user,
            db=db,
        )

        return ai_service.generate_service_history(
            experience_id=experience.id,
            company=experience.company,
            job_title=experience.job_title,
            employment_type=experience.employment_type,
            start_date=(
                experience.start_date.isoformat()
                if experience.start_date
                else None
            ),
            end_date=(
                experience.end_date.isoformat()
                if experience.end_date
                else None
            ),
            is_current=experience.is_current,
            description=experience.description,
            professional_title=profile.professional_title,
            summary=profile.summary,
            skills=context["skills"],
            projects=context["projects"],
            education=context["education"],
            instruction=request.instruction,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    except RuntimeError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is temporarily unavailable",
        )

@router.post(
    "/generate-resume-content/{resume_id}",
    response_model=GenerateResumeContentResponse,
)
def generate_resume_content(
    resume_id: int,
    request: GenerateResumeContentRequest,
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
        generation_context = build_resume_generation_context(
            resume=resume,
            current_user=current_user,
            db=db,
        )

        return ai_service.generate_resume_content(
            prompt_input=request.prompt,
            generation_context=generation_context,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

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
        generation_context = (
            build_resume_generation_context(
                resume=resume,
                current_user=current_user,
                db=db,
            )
        )

        return ai_service.generate_resume(
            resume_id=resume.id,
            generation_context=generation_context,
            instruction=request.instruction,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

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
        generation_context = (
            build_resume_generation_context(
                resume=resume,
                current_user=current_user,
                db=db,
            )
        )

        return ai_service.generate_tailored_resume(
            resume_id=resume.id,
            job_description_id=job_description.id,
            generation_context=generation_context,
            job_description=job_description.description,
            instruction=request.instruction,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    except RuntimeError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is temporarily unavailable",
        )





@router.post(
    "/apply-change/{resume_id}",
    status_code=status.HTTP_200_OK,
)
def apply_ai_change(
    resume_id: int,
    request: ApplyAIChangeRequest,
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
        action = request.action
        section = request.section

        # =========================================================
        # CREATE
        # =========================================================

        if action == "create":

            if request.data is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="data is required for create action",
                )

            data = request.data

            # -----------------------------------------------------
            # Create Project
            # -----------------------------------------------------

            if section == "project":

                title = str(
                    data.get("title", "")
                ).strip()

                if not title:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Project title is required",
                    )

                description = str(
                    data.get("description", "")
                ).strip()

                technologies = str(
                    data.get("technologies", "")
                ).strip()

                role = str(
                    data.get("role", "")
                ).strip()

                project = Project(
                    resume_id=resume.id,
                    title=title,
                    role=role or None,
                    technologies=technologies or None,
                    description=description or None,
                )

                db.add(project)

            # -----------------------------------------------------
            # Create Experience
            # -----------------------------------------------------

            elif section == "experience":

                company = str(
                    data.get("company", "")
                ).strip()

                job_title = str(
                    data.get("job_title", "")
                ).strip()

                if not company:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Company is required",
                    )

                if not job_title:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Job title is required",
                    )

                experience = Experience(
                    resume_id=resume.id,
                    company=company,
                    job_title=job_title,
                    location=(
                        str(data.get("location", "")).strip()
                        or None
                    ),
                    employment_type=(
                        str(
                            data.get(
                                "employment_type",
                                "",
                            )
                        ).strip()
                        or None
                    ),
                    description=(
                        str(
                            data.get(
                                "description",
                                "",
                            )
                        ).strip()
                        or None
                    ),
                    is_current=bool(
                        data.get(
                            "is_current",
                            False,
                        )
                    ),
                )

                db.add(experience)

            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Create action is not supported "
                        f"for section: {section}"
                    ),
                )

        # =========================================================
        # UPDATE
        # =========================================================

        else:

            if request.content is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="content is required for update action",
                )

            content = request.content

            # -----------------------------------------------------
            # Summary
            # -----------------------------------------------------

            if section == "summary":

                profile = db.scalar(
                    select(CandidateProfile).where(
                        CandidateProfile.user_id
                        == current_user.id
                    )
                )

                if profile is None:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Candidate profile not found",
                    )

                profile.summary = content

            # -----------------------------------------------------
            # Experience
            # -----------------------------------------------------

            elif section == "experience":

                if request.target_id is None:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=(
                            "target_id is required "
                            "for experience"
                        ),
                    )

                experience = db.scalar(
                    select(Experience)
                    .join(
                        Resume,
                        Experience.resume_id
                        == Resume.id,
                    )
                    .where(
                        Experience.id
                        == request.target_id,
                        Experience.resume_id
                        == resume.id,
                        Resume.user_id
                        == current_user.id,
                    )
                )

                if experience is None:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Experience not found",
                    )

                experience.description = content

            # -----------------------------------------------------
            # Project
            # -----------------------------------------------------

            elif section == "project":

                if request.target_id is None:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=(
                            "target_id is required "
                            "for project"
                        ),
                    )

                project = db.scalar(
                    select(Project)
                    .join(
                        Resume,
                        Project.resume_id
                        == Resume.id,
                    )
                    .where(
                        Project.id
                        == request.target_id,
                        Project.resume_id
                        == resume.id,
                        Resume.user_id
                        == current_user.id,
                    )
                )

                if project is None:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Project not found",
                    )

                project.description = content

            # -----------------------------------------------------
            # Skill
            # -----------------------------------------------------

            elif section == "skill":

                if request.target_id is None:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=(
                            "target_id is required "
                            "for skill"
                        ),
                    )

                skill = db.scalar(
                    select(Skill).where(
                        Skill.id == request.target_id,
                        Skill.resume_id == resume.id,
                    )
                )

                if skill is None:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Skill not found",
                    )

                skill.name = content

            # -----------------------------------------------------
            # Education
            # -----------------------------------------------------

            elif section == "education":

                if request.target_id is None:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=(
                            "target_id is required "
                            "for education"
                        ),
                    )

                education = db.scalar(
                    select(Education).where(
                        Education.id
                        == request.target_id,
                        Education.resume_id
                        == resume.id,
                    )
                )

                if education is None:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Education not found",
                    )

                education.description = content

            # -----------------------------------------------------
            # Certification
            # -----------------------------------------------------

            elif section == "certification":

                if request.target_id is None:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=(
                            "target_id is required "
                            "for certification"
                        ),
                    )

                certification = db.scalar(
                    select(Certification).where(
                        Certification.id
                        == request.target_id,
                        Certification.resume_id
                        == resume.id,
                    )
                )

                if certification is None:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Certification not found",
                    )

                certification.name = content

            # -----------------------------------------------------
            # Language
            # -----------------------------------------------------

            elif section == "language":

                if request.target_id is None:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=(
                            "target_id is required "
                            "for language"
                        ),
                    )

                language = db.scalar(
                    select(Language).where(
                        Language.id == request.target_id,
                        Language.resume_id == resume.id,
                    )
                )

                if language is None:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Language not found",
                    )

                language.name = content

            # -----------------------------------------------------
            # Achievement
            # -----------------------------------------------------

            elif section == "achievement":

                if request.target_id is None:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=(
                            "target_id is required "
                            "for achievement"
                        ),
                    )

                achievement = db.scalar(
                    select(Achievement).where(
                        Achievement.id
                        == request.target_id,
                        Achievement.resume_id
                        == resume.id,
                    )
                )

                if achievement is None:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Achievement not found",
                    )

                achievement.description = content

            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Unsupported section: {section}"
                    ),
                )

        db.commit()

        return {
            "message": "AI change applied successfully",
            "resume_id": resume.id,
            "action": action,
            "section": section,
            "target_id": request.target_id,
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to apply AI change",
        ) from exc



@router.post(
    "/apply-tailored-resume/{resume_id}",
)
def apply_tailored_resume(
    resume_id: int,
    request: ApplyTailoredResumeRequest,
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
        # -----------------------------------------------------
        # Summary
        # -----------------------------------------------------

        if request.summary is not None:
            profile = db.scalar(
                select(CandidateProfile).where(
                    CandidateProfile.user_id
                    == current_user.id
                )
            )

            if profile is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Candidate profile not found",
                )

            profile.summary = request.summary

        # -----------------------------------------------------
        # Projects
        # -----------------------------------------------------

        for project_id, description in (
            request.project_updates.items()
        ):
            project = db.scalar(
                select(Project).where(
                    Project.id == int(project_id),
                    Project.resume_id == resume.id,
                )
            )

            if project is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=(
                        f"Project {project_id} not found"
                    ),
                )

            project.description = description

        # -----------------------------------------------------
        # Experience
        # -----------------------------------------------------

        for experience_id, description in (
            request.experience_updates.items()
        ):
            experience = db.scalar(
                select(Experience).where(
                    Experience.id == int(experience_id),
                    Experience.resume_id == resume.id,
                )
            )

            if experience is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=(
                        f"Experience {experience_id} not found"
                    ),
                )

            experience.description = description

        # -----------------------------------------------------
        # Skills
        #
        # Keep this empty for now unless the application
        # explicitly supports changing skills through tailored
        # resume application.
        # -----------------------------------------------------

        db.commit()

        return {
            "message": "Tailored resume changes applied successfully",
            "resume_id": resume.id,
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to apply tailored resume changes",
        ) from exc