from app.ai.prompts import (
    PROJECT_IMPROVEMENT_PROMPT,
    RESUME_TEXT_IMPROVEMENT_PROMPT,
)

import json
from app.quality.schemas import AIResumeQualityResponse

from app.ai.prompts import AI_RESUME_QUALITY_PROMPT
from app.ai.jd_schemas import JobDescriptionAnalysis
from app.ai.prompts import JOB_DESCRIPTION_ANALYSIS_PROMPT
from app.ats.schemas import ATSOptimizationResponse
from app.ai.prompts import ATS_OPTIMIZATION_PROMPT

from app.ats.schemas import OptimizeSectionResponse
from app.ai.prompts import SECTION_OPTIMIZATION_PROMPT


from app.ai.provider import LLMProvider
from app.ai.schemas import (
    ImproveProjectResponse,
    ImproveTextResponse,
    ImproveExperienceResponse,
    ImproveSummaryResponse,
    GeneratedResumeResponse,
    TailoredResumeResponse,
   
)

from app.ai.prompts import (
    EXPERIENCE_IMPROVEMENT_PROMPT,
    PROJECT_IMPROVEMENT_PROMPT,
    RESUME_TEXT_IMPROVEMENT_PROMPT,
    SUMMARY_IMPROVEMENT_PROMPT,
    FULL_RESUME_PROMPT,
    TAILORED_RESUME_PROMPT,

)

import json
import re


def parse_json_response(raw_response: str) -> dict:
    """
    Parse JSON returned by an LLM.

    Handles both plain JSON and JSON wrapped in markdown fences.
    """
    cleaned = raw_response.strip()

    if cleaned.startswith("```"):
        cleaned = re.sub(
            r"^```(?:json)?\s*",
            "",
            cleaned,
            flags=re.IGNORECASE,
        )
        cleaned = re.sub(
            r"\s*```$",
            "",
            cleaned,
        )

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise RuntimeError(
            "AI returned invalid JSON"
        ) from exc


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

    def analyze_job_description(
        self,
        title: str,
        company: str | None,
        description: str,
    ) -> JobDescriptionAnalysis:
        prompt = JOB_DESCRIPTION_ANALYSIS_PROMPT.format(
            title=title,
            company=company or "",
            description=description,
        )

        raw_response = self.provider.generate(prompt)

        try:
            data = parse_json_response(raw_response)
            return JobDescriptionAnalysis.model_validate(data)

        except ValueError as exc:
            raise RuntimeError(
                "AI returned an invalid job description analysis"
            ) from exc


    def optimize_resume_for_job(
        self,
        resume_id: int,
        job_description_id: int,
        score: float,
        matched_skills: list[str],
        missing_skills: list[str],
        matched_keywords: list[str],
        missing_keywords: list[str],
        profile: str,
        experience: str,
        projects: str,
        job_description: str,
    ) -> ATSOptimizationResponse:

        prompt = ATS_OPTIMIZATION_PROMPT.format(
            score=score,
            matched_skills=", ".join(matched_skills),
            missing_skills=", ".join(missing_skills),
            matched_keywords=", ".join(matched_keywords),
            missing_keywords=", ".join(missing_keywords),
            profile=profile,
            experience=experience,
            projects=projects,
            job_description=job_description,
        )

        raw_response = self.provider.generate(prompt)

        try:
            data = json.loads(raw_response)

            return ATSOptimizationResponse(
                resume_id=resume_id,
                job_description_id=job_description_id,
                current_score=score,
                priority=data.get("priority", []),
                recommendations=data.get(
                    "recommendations",
                    [],
                ),
            )

        except (json.JSONDecodeError, ValueError) as exc:
            raise RuntimeError(
                "AI returned an invalid ATS optimization response"
            ) from exc


    def optimize_section(
        self,
        resume_id: int,
        section: str,
        original_content: str,
        job_description: str,
        missing_skills: list[str],
        missing_keywords: list[str],
        instruction: str | None,
    ) -> OptimizeSectionResponse:

        prompt = SECTION_OPTIMIZATION_PROMPT.format(
            section=section,
            original_content=original_content,
            job_description=job_description,
            missing_skills=", ".join(missing_skills),
            missing_keywords=", ".join(missing_keywords),
            instruction=instruction or "",
        )

        raw_response = self.provider.generate(prompt)

        try:
            data = json.loads(raw_response)

            return OptimizeSectionResponse(
                resume_id=resume_id,
                section=section,
                original_content=original_content,
                optimized_content=data["optimized_content"],
                changes=data.get("changes", []),
            )

        except (json.JSONDecodeError, KeyError, ValueError) as exc:
            raise RuntimeError(
                "AI returned an invalid section optimization response"
            ) from exc


    def generate_tailored_resume(
        self,
        resume_id: int,
        job_description_id: int,
        profile: str,
        education: str,
        experience: str,
        skills: str,
        projects: str,
        certifications: str,
        languages: str,
        achievements: str,
        job_description: str,
        instruction: str | None,
    ) -> TailoredResumeResponse:

        prompt = TAILORED_RESUME_PROMPT.format(
            profile=profile,
            education=education,
            experience=experience,
            skills=skills,
            projects=projects,
            certifications=certifications,
            languages=languages,
            achievements=achievements,
            job_description=job_description,
            instruction=instruction or "",
        )

        content = self.provider.generate(prompt)

        return TailoredResumeResponse(
            resume_id=resume_id,
            job_description_id=job_description_id,
            content=content,
        )





    def generate_quality_recommendations(
        self,
        resume_id: int,
        overall_score: float,
        completeness_score: float,
        content_quality_score: float,
        ats_readiness_score: float,
        sections: str,
        issues: list[str],
        resume_context: str,
    ) -> AIResumeQualityResponse:

        prompt = AI_RESUME_QUALITY_PROMPT.format(
            overall_score=overall_score,
            completeness_score=completeness_score,
            content_quality_score=content_quality_score,
            ats_readiness_score=ats_readiness_score,
            sections=sections,
            issues="\n".join(issues),
            resume_context=resume_context,
        )

        raw_response = self.provider.generate(prompt)

        try:
            data = parse_json_response(raw_response)

            return AIResumeQualityResponse(
                resume_id=resume_id,
                overall_score=overall_score,
                priority=data.get("priority", []),
                recommendations=data.get(
                    "recommendations",
                    [],
                ),
            )

        except (ValueError, KeyError) as exc:
            raise RuntimeError(
                "AI returned invalid resume quality recommendations"
            ) from exc