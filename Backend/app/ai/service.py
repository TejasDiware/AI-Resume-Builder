from app.ai.prompts import (
    PROJECT_IMPROVEMENT_PROMPT,
    RESUME_TEXT_IMPROVEMENT_PROMPT,
)
from app.ai.provider import LLMProvider
from app.ai.schemas import (
    ImproveProjectResponse,
    ImproveTextResponse,
    ImproveExperienceResponse,
    ImproveSummaryResponse,
    GeneratedResumeResponse,
)

from app.ai.prompts import (
    EXPERIENCE_IMPROVEMENT_PROMPT,
    PROJECT_IMPROVEMENT_PROMPT,
    RESUME_TEXT_IMPROVEMENT_PROMPT,
    SUMMARY_IMPROVEMENT_PROMPT,
    FULL_RESUME_PROMPT,

)


class AIService:
    """Business logic for AI-powered resume operations."""

    def __init__(self, provider: LLMProvider):
        self.provider = provider

    def improve_text(self, text: str) -> ImproveTextResponse:
        prompt = RESUME_TEXT_IMPROVEMENT_PROMPT.format(
            text=text
        )

        improved_text = self.provider.generate(prompt)

        return ImproveTextResponse(
            original_text=text,
            improved_text=improved_text,
        )

    def improve_project(
        self,
        project_id: int,
        title: str,
        role: str | None,
        technologies: str | None,
        description: str | None,
        instruction: str | None,
    ) -> ImproveProjectResponse:
        prompt = PROJECT_IMPROVEMENT_PROMPT.format(
            title=title,
            role=role or "",
            technologies=technologies or "",
            description=description or "",
            instruction=instruction or "",
        )

        improved_description = self.provider.generate(prompt)

        return ImproveProjectResponse(
            project_id=project_id,
            original_description=description,
            improved_description=improved_description,
        )

    def improve_experience(
        self,
        experience_id: int,
        company: str,
        job_title: str,
        employment_type: str | None,
        description: str | None,
        instruction: str | None,
    ) -> ImproveExperienceResponse:
        prompt = EXPERIENCE_IMPROVEMENT_PROMPT.format(
            company=company,
            job_title=job_title,
            employment_type=employment_type or "",
            description=description or "",
            instruction=instruction or "",
        )

        improved_description = self.provider.generate(prompt)

        return ImproveExperienceResponse(
            experience_id=experience_id,
            original_description=description,
            improved_description=improved_description,
        )

    def improve_summary(
        self,
        professional_title: str | None,
        location: str | None,
        summary: str | None,
        instruction: str | None,
    ) -> ImproveSummaryResponse:
        prompt = SUMMARY_IMPROVEMENT_PROMPT.format(
            professional_title=professional_title or "",
            location=location or "",
            summary=summary or "",
            instruction=instruction or "",
        )

        improved_summary = self.provider.generate(prompt)

        return ImproveSummaryResponse(
            original_summary=summary,
            improved_summary=improved_summary,
        )



    def generate_resume(
        self,
        resume_id: int,
        profile: str,
        education: str,
        experience: str,
        skills: str,
        projects: str,
        certifications: str,
        languages: str,
        achievements: str,
        instruction: str | None,
    ) -> GeneratedResumeResponse:
        prompt = FULL_RESUME_PROMPT.format(
            profile=profile,
            education=education,
            experience=experience,
            skills=skills,
            projects=projects,
            certifications=certifications,
            languages=languages,
            achievements=achievements,
            instruction=instruction or "",
        )

        generated_content = self.provider.generate(prompt)

        return GeneratedResumeResponse(
            resume_id=resume_id,
            content=generated_content,
        )