from app.ai.prompts import (
    PROJECT_IMPROVEMENT_PROMPT,
    RESUME_TEXT_IMPROVEMENT_PROMPT,
)

import json
from app.quality.schemas import AIResumeQualityResponse


from app.ai.resume_formatter import format_resume_text
from app.ai.prompts import (
    STRUCTURED_RESUME_GENERATION_PROMPT,
)

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
    GeneratedResumeContent,
    GeneratedTailoredContent,
    TailoredResumeResponse,
)

from app.ai.prompts import (
    EXPERIENCE_IMPROVEMENT_PROMPT,
    PROJECT_IMPROVEMENT_PROMPT,
    RESUME_TEXT_IMPROVEMENT_PROMPT,
    SUMMARY_IMPROVEMENT_PROMPT,
    FULL_RESUME_PROMPT,
    TAILORED_RESUME_PROMPT,
    STRUCTURED_TAILORED_RESUME_PROMPT,
    STRUCTURED_RESUME_GENERATION_PROMPT,

)

import json
import re

FORBIDDEN_RESUME_PLACEHOLDERS = (
    "https://example.com/",
    "https://example.com",
    "example.com",
    "example@example.com",
    "[location]",
    "[company]",
    "[job title]",
    "[phone]",
    "[email]",
    "[linkedin]",
    "[github]",
    "[portfolio]",
)


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



def validate_generated_resume(
    content: str,
) -> str:
    """
    Reject generated resumes containing obvious placeholder
    or example values.
    """

    if not content or not content.strip():
        raise RuntimeError(
            "AI returned an empty resume."
        )

    lowered = content.lower()

    for forbidden in FORBIDDEN_RESUME_PLACEHOLDERS:
        if forbidden in lowered:
            raise RuntimeError(
                f"AI generated forbidden placeholder: {forbidden}"
            )

    # Catch obvious generic placeholder values such as:
    # Name: string
    # Phone: string
    # Location: string
    if re.search(
        r"(?im)^\s*(name|phone|location|email|professional title)"
        r"\s*:\s*string\b",
        content,
    ):
        raise RuntimeError(
            "AI generated placeholder field values."
        )

    return content.strip()


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
        generation_context: dict,
        instruction: str | None,
    ) -> GeneratedResumeResponse:

        import json

        prompt = STRUCTURED_RESUME_GENERATION_PROMPT.format(
            profile=json.dumps(
                generation_context["profile"],
                ensure_ascii=False,
                indent=2,
            ),
            experience=json.dumps(
                generation_context["experience"],
                ensure_ascii=False,
                indent=2,
            ),
            projects=json.dumps(
                generation_context["projects"],
                ensure_ascii=False,
                indent=2,
            ),
            instruction=instruction or "",
        )

        raw_response = self.provider.generate(
            prompt
        )

        try:
            data = parse_json_response(
                raw_response
            )

            generated = (
                GeneratedResumeContent.model_validate(
                    data
                )
            )

        except ValueError as exc:
            raise RuntimeError(
                "AI returned invalid structured resume content"
            ) from exc

        # ---------------------------------------------------------
        # Only accept IDs that actually belong to this resume.
        # ---------------------------------------------------------

        experience_map = {
            item["id"]: item
            for item in generation_context["experience"]
        }

        project_map = {
            item["id"]: item
            for item in generation_context["projects"]
        }

        generated_experience = {
            item.id: item.description.strip()
            for item in generated.experience
            if item.id in experience_map
            and item.description.strip()
        }

        generated_projects = {
            item.id: item.description.strip()
            for item in generated.projects
            if item.id in project_map
            and item.description.strip()
        }

        # ---------------------------------------------------------
        # Preserve original factual data.
        # AI can improve prose only.
        # ---------------------------------------------------------

        experience_records = []

        for item in generation_context["experience"]:
            experience_records.append(
                {
                    **item,
                    "description": (
                        generated_experience.get(
                            item["id"],
                            item["description"],
                        )
                    ),
                }
            )

        project_records = []

        for item in generation_context["projects"]:
            project_records.append(
                {
                    **item,
                    "description": (
                        generated_projects.get(
                            item["id"],
                            item["description"],
                        )
                    ),
                }
            )

        summary = (
            generated.summary.strip()
            if generated.summary.strip()
            else generation_context[
                "profile"
            ].get("summary", "")
        )

        content = format_resume_text(
            profile=generation_context["profile"],
            summary=summary,
            education=generation_context[
                "education"
            ],
            experience=experience_records,
            skills=generation_context[
                "skills"
            ],
            projects=project_records,
            certifications=generation_context[
                "certifications"
            ],
            languages=[
                (
                    f"{item['name']} "
                    f"({item['proficiency']})"
                    if item["proficiency"]
                    else item["name"]
                )
                for item in generation_context[
                    "languages"
                ]
            ],
            achievements=[
                item["description"]
                for item in generation_context[
                    "achievements"
                ]
                if item["description"]
            ],
        )

        if not content.strip():
            raise RuntimeError(
                "Generated resume content is empty"
            )

        return GeneratedResumeResponse(
            resume_id=resume_id,
            content=content,
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
        generation_context: dict,
        job_description: str,
        instruction: str | None,
    ) -> TailoredResumeResponse:

        import json

        prompt = STRUCTURED_TAILORED_RESUME_PROMPT.format(
            profile=json.dumps(
                generation_context["profile"],
                ensure_ascii=False,
                indent=2,
            ),
            experience=json.dumps(
                generation_context["experience"],
                ensure_ascii=False,
                indent=2,
            ),
            projects=json.dumps(
                generation_context["projects"],
                ensure_ascii=False,
                indent=2,
            ),
            job_description=job_description,
            instruction=instruction or "",
        )

        raw_response = self.provider.generate(
            prompt
        )

        try:
            data = parse_json_response(
                raw_response
            )

            tailored = (
                GeneratedTailoredContent.model_validate(
                    data
                )
            )

        except ValueError as exc:
            raise RuntimeError(
                "AI returned invalid structured tailored resume content"
            ) from exc

        experience_map = {
            item["id"]: item
            for item in generation_context["experience"]
        }

        project_map = {
            item["id"]: item
            for item in generation_context["projects"]
        }

        updated_experience = {
            item.id: item.description.strip()
            for item in tailored.experience
            if item.id in experience_map
            and item.description.strip()
        }

        updated_projects = {
            item.id: item.description.strip()
            for item in tailored.projects
            if item.id in project_map
            and item.description.strip()
        }

        experience_records = []

        for item in generation_context["experience"]:
            experience_records.append(
                {
                    **item,
                    "description": updated_experience.get(
                        item["id"],
                        item["description"],
                    ),
                }
            )

        project_records = []

        for item in generation_context["projects"]:
            project_records.append(
                {
                    **item,
                    "description": updated_projects.get(
                        item["id"],
                        item["description"],
                    ),
                }
            )

        summary = (
            tailored.summary.strip()
            if tailored.summary.strip()
            else generation_context["profile"].get(
                "summary",
                "",
            )
        )

        content = format_resume_text(
            profile=generation_context["profile"],
            summary=summary,
            education=generation_context["education"],
            experience=experience_records,
            skills=generation_context["skills"],
            projects=project_records,
            certifications=generation_context[
                "certifications"
            ],
            languages=[
                (
                    f"{item['name']} ({item['proficiency']})"
                    if item["proficiency"]
                    else item["name"]
                )
                for item in generation_context["languages"]
            ],
            achievements=[
                item["description"]
                for item in generation_context["achievements"]
                if item["description"]
            ],
        )

        return TailoredResumeResponse(
            resume_id=resume_id,
            job_description_id=job_description_id,
            content=content,
            structured=None,
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