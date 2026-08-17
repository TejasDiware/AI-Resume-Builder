import json
import re

from app.ai.jd_schemas import JobDescriptionAnalysis

from app.ai.prompts import (
    AI_RESUME_QUALITY_PROMPT,
    ATS_OPTIMIZATION_PROMPT,
    EXPERIENCE_IMPROVEMENT_PROMPT,
    FULL_RESUME_PROMPT,
    GENERATE_RESUME_CONTENT_PROMPT,
    JOB_DESCRIPTION_ANALYSIS_PROMPT,
    PROJECT_IMPROVEMENT_PROMPT,
    RESUME_TEXT_IMPROVEMENT_PROMPT,
    SECTION_OPTIMIZATION_PROMPT,
    SERVICE_HISTORY_GENERATION_PROMPT,
    STRUCTURED_RESUME_GENERATION_PROMPT,
    STRUCTURED_TAILORED_RESUME_PROMPT,
    SUMMARY_IMPROVEMENT_PROMPT,
    TAILORED_RESUME_PROMPT,
)

from app.ai.provider import LLMProvider

from app.ai.resume_formatter import format_resume_text

from app.ai.schemas import (
    AIChange,
    GeneratedResumeContent,
    GeneratedResumeProject,
    GeneratedResumeResponse,
    GeneratedTailoredContent,
    GenerateResumeContentResponse,
    GenerateServiceHistoryResponse,
    ImproveExperienceResponse,
    ImproveProjectResponse,
    ImproveSummaryResponse,
    ImproveTextResponse,
    TailoredResumeResponse,
)

from app.ats.schemas import (
    ATSOptimizationResponse,
    OptimizeSectionResponse,
)

from app.quality.schemas import AIResumeQualityResponse

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

    def generate_resume_content(
            self,
            prompt_input: str,
            generation_context: dict | None = None,
        ) -> GenerateResumeContentResponse:


        generation_context = generation_context or {}

        prompt = GENERATE_RESUME_CONTENT_PROMPT.format(
            prompt=prompt_input,
        )

        raw_response = self.provider.generate(prompt)

        try:
            data = parse_json_response(raw_response)

            project_data = data.get(
                "project",
                {},
            )

            if not isinstance(project_data, dict):
                raise ValueError(
                    "project must be an object"
                )

            technologies = project_data.get(
                "technologies",
                [],
            )

            description = project_data.get(
                "description",
                [],
            )

            service_history = data.get(
                "service_history",
                [],
            )

            if not isinstance(technologies, list):
                raise ValueError(
                    "project technologies must be a list"
                )

            if not isinstance(description, list):
                raise ValueError(
                    "project description must be a list"
                )

            if not isinstance(service_history, list):
                raise ValueError(
                    "service_history must be a list"
                )

            summary = str(
                data.get(
                    "summary",
                    "",
                )
            ).strip()

            service_history = [
                str(item).strip()
                for item in service_history
                if str(item).strip()
            ]

            technologies = [
                str(item).strip()
                for item in technologies
                if str(item).strip()
            ]

            description = [
                str(item).strip()
                for item in description
                if str(item).strip()
            ]

            if not summary:
                raise ValueError(
                    "AI returned empty summary"
                )

            if not service_history:
                raise ValueError(
                    "AI returned empty service history"
                )

            if not project_data.get("title"):
                raise ValueError(
                    "AI returned empty project title"
                )

            if not description:
                raise ValueError(
                    "AI returned empty project description"
                )

            project = GeneratedResumeProject(
                title=str(
                    project_data["title"]
                ).strip(),
                technologies=technologies,
                description=description,
            )

            # ---------------------------------------------------------
            # Build reviewable AI changes.
            #
            # Nothing is saved to the database here.
            # These are only proposals for the user to review.
            # ---------------------------------------------------------

            changes = []

            # ---------------------------------------------------------
            # SUMMARY CHANGE
            # ---------------------------------------------------------

            current_summary = (
                generation_context
                .get("profile", {})
                .get("summary", "")
            )

            current_summary = (
                current_summary.strip()
                if current_summary
                else ""
            )

            if summary != current_summary:
                changes.append(
                    AIChange(
                        id="generate_summary_001",
                        action="update",
                        section="summary",
                        target_id=None,
                        old_content=current_summary,
                        new_content=summary,
                        reason=(
                            "AI generated a new professional summary "
                            "based on the user's request."
                        ),
                    )
                )

            # ---------------------------------------------------------
            # EXPERIENCE / SERVICE HISTORY CHANGE
            # ---------------------------------------------------------

            experience_records = generation_context.get(
                "experience",
                []
            )

            if experience_records:
                # The current Generate Resume Content API does not
                # specify an experience ID, so the first existing
                # experience is used as the proposal target.
                #
                # We can make this target explicit later if the
                # frontend allows the user to select an experience.
                experience = experience_records[0]

                experience_id = experience.get("id")

                current_description = (
                    experience.get(
                        "description",
                        "",
                    )
                    or ""
                ).strip()

                generated_description = "\n".join(
                    service_history
                ).strip()

                if (
                    experience_id is not None
                    and generated_description
                    != current_description
                ):
                    changes.append(
                        AIChange(
                            id=(
                                f"generate_experience_"
                                f"{experience_id}_001"
                            ),
                            action="update",
                            section="experience",
                            target_id=experience_id,
                            old_content=current_description,
                            new_content=generated_description,
                            reason=(
                                "AI generated service history "
                                "based on the user's request."
                            ),
                        )
                    )

            # ---------------------------------------------------------
            # PROJECT CREATE CHANGE
            # ---------------------------------------------------------

            project_description = "\n".join(
                description
            ).strip()

            project_data_for_change = {
                "title": project.title,
                "role": "",
                "technologies": ", ".join(
                    project.technologies
                ),
                "description": project_description,
            }

            changes.append(
                AIChange(
                    id="generate_project_001",
                    action="create",
                    section="project",
                    target_id=None,
                    old_content=None,
                    new_content=project_description,
                    data=project_data_for_change,
                    reason=(
                        "AI generated a new project based "
                        "on the user's request."
                    ),
                )
            )

            return GenerateResumeContentResponse(
                summary=summary,
                service_history=service_history,
                project=project,
                changes=changes,
            )

        except (ValueError, TypeError, KeyError) as exc:
            raise RuntimeError(
                "AI returned invalid resume content"
            ) from exc


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
        generation_context: dict | None = None,
    ) -> ATSOptimizationResponse:

        import json

        generation_context = (
            generation_context
            if generation_context is not None
            else {}
        )

        prompt = ATS_OPTIMIZATION_PROMPT.format(
            score=score,
            matched_skills=json.dumps(
                matched_skills,
                ensure_ascii=False,
            ),
            missing_skills=json.dumps(
                missing_skills,
                ensure_ascii=False,
            ),
            matched_keywords=json.dumps(
                matched_keywords,
                ensure_ascii=False,
            ),
            missing_keywords=json.dumps(
                missing_keywords,
                ensure_ascii=False,
            ),
            profile=profile,
            experience=experience,
            projects=projects,
            job_description=job_description,
            structured_resume=json.dumps(
                {
                    "profile": generation_context.get(
                        "profile",
                        {},
                    ),
                    "experience": generation_context.get(
                        "experience",
                        [],
                    ),
                    "projects": generation_context.get(
                        "projects",
                        [],
                    ),
                    "skills": generation_context.get(
                        "skills",
                        [],
                    ),
                },
                ensure_ascii=False,
                indent=2,
            ),
        )

        raw_response = self.provider.generate(prompt)

        try:
            data = parse_json_response(raw_response)

        except ValueError as exc:
            raise RuntimeError(
                "AI returned invalid ATS optimization JSON"
            ) from exc

        priority = data.get(
            "priority",
            [],
        )

        recommendations = data.get(
            "recommendations",
            [],
        )

        raw_changes = data.get(
            "changes",
            [],
        )

        if not isinstance(priority, list):
            priority = []

        if not isinstance(recommendations, list):
            recommendations = []

        if not isinstance(raw_changes, list):
            raw_changes = []

        # ---------------------------------------------------------
        # Validate AI changes against the actual resume.
        #
        # AI is NOT trusted to invent IDs.
        # ---------------------------------------------------------

        valid_experience_ids = {
            item["id"]
            for item in generation_context.get(
                "experience",
                [],
            )
            if item.get("id") is not None
        }

        valid_project_ids = {
            item["id"]
            for item in generation_context.get(
                "projects",
                [],
            )
            if item.get("id") is not None
        }

        valid_changes: list[AIChange] = []

        for index, change in enumerate(raw_changes):
            if not isinstance(change, dict):
                continue

            action = change.get("action")

            section = change.get("section")

            target_id = change.get("target_id")

            new_content = (
                change.get("new_content")
                or ""
            ).strip()

            old_content = (
                change.get("old_content")
                or ""
            ).strip()

            reason = (
                change.get("reason")
                or "AI suggested this improvement."
            ).strip()

            # -----------------------------------------------------
            # Only update existing experience records.
            # -----------------------------------------------------

            if section == "experience":
                if action != "update":
                    continue

                if target_id not in valid_experience_ids:
                    continue

            # -----------------------------------------------------
            # Only update existing project records.
            # -----------------------------------------------------

            elif section == "project":
                if action != "update":
                    continue

                if target_id not in valid_project_ids:
                    continue

            # -----------------------------------------------------
            # Summary has no target ID.
            # -----------------------------------------------------

            elif section == "summary":
                if action != "update":
                    continue

                target_id = None

            else:
                continue

            if not new_content:
                continue

            if old_content == new_content:
                continue

            change_id = (
                change.get("id")
                or (
                    f"ats_"
                    f"{section}_"
                    f"{target_id if target_id is not None else 'summary'}_"
                    f"{job_description_id}_"
                    f"{index}"
                )
            )

            try:
                valid_changes.append(
                    AIChange(
                        id=str(change_id),
                        action=action,
                        section=section,
                        target_id=target_id,
                        old_content=old_content,
                        new_content=new_content,
                        data=change.get("data"),
                        reason=reason,
                    )
                )

            except ValueError:
                continue

        return ATSOptimizationResponse(
            resume_id=resume_id,
            job_description_id=job_description_id,
            current_score=score,
            priority=[
                str(item)
                for item in priority
                if str(item).strip()
            ],
            recommendations=[
                str(item)
                for item in recommendations
                if str(item).strip()
            ],
            changes=valid_changes,
        )


    def optimize_section(
        self,
        resume_id: int,
        section: str,
        original_content: str,
        job_description: str,
        missing_skills: list[str],
        missing_keywords: list[str],
        instruction: str | None,
        generation_context: dict | None = None,
    ) -> OptimizeSectionResponse:

        import json

        generation_context = (
            generation_context
            if generation_context is not None
            else {}
        )

        prompt = OPTIMIZE_SECTION_PROMPT.format(
            section=section,
            original_content=original_content,
            job_description=job_description,
            missing_skills=json.dumps(
                missing_skills,
                ensure_ascii=False,
            ),
            missing_keywords=json.dumps(
                missing_keywords,
                ensure_ascii=False,
            ),
            instruction=instruction or "",
            structured_resume=json.dumps(
                {
                    "profile": generation_context.get(
                        "profile",
                        {},
                    ),
                    "experience": generation_context.get(
                        "experience",
                        [],
                    ),
                    "projects": generation_context.get(
                        "projects",
                        [],
                    ),
                    "skills": generation_context.get(
                        "skills",
                        [],
                    ),
                },
                ensure_ascii=False,
                indent=2,
            ),
        )

        raw_response = self.provider.generate(prompt)

        try:
            data = parse_json_response(raw_response)

        except ValueError as exc:
            raise RuntimeError(
                "AI returned invalid section optimization JSON"
            ) from exc

        optimized_content = (
            data.get("optimized_content")
            or original_content
        ).strip()

        raw_changes = data.get(
            "changes",
            [],
        )

        if not isinstance(raw_changes, list):
            raw_changes = []

        # ---------------------------------------------------------
        # Resolve valid database IDs.
        # ---------------------------------------------------------

        experience_map = {
            item["id"]: item
            for item in generation_context.get(
                "experience",
                [],
            )
            if item.get("id") is not None
        }

        project_map = {
            item["id"]: item
            for item in generation_context.get(
                "projects",
                [],
            )
            if item.get("id") is not None
        }

        valid_changes: list[AIChange] = []

        for index, change in enumerate(raw_changes):
            if not isinstance(change, dict):
                continue

            action = change.get("action")

            change_section = change.get(
                "section",
                section,
            )

            target_id = change.get(
                "target_id"
            )

            new_content = (
                change.get("new_content")
                or ""
            ).strip()

            old_content = (
                change.get("old_content")
                or ""
            ).strip()

            reason = (
                change.get("reason")
                or "AI suggested this section improvement."
            ).strip()

            if action not in {
                "create",
                "update",
            }:
                continue

            # -----------------------------------------------------
            # Experience
            # -----------------------------------------------------

            if change_section == "experience":
                if action != "update":
                    continue

                if target_id not in experience_map:
                    continue

            # -----------------------------------------------------
            # Project
            # -----------------------------------------------------

            elif change_section == "project":
                if action != "update":
                    continue

                if target_id not in project_map:
                    continue

            # -----------------------------------------------------
            # Summary
            # -----------------------------------------------------

            elif change_section == "summary":
                if action != "update":
                    continue

                target_id = None

            else:
                continue

            if not new_content:
                continue

            if old_content == new_content:
                continue

            change_id = (
                change.get("id")
                or (
                    f"ats_section_"
                    f"{change_section}_"
                    f"{target_id if target_id is not None else 'summary'}_"
                    f"{resume_id}_"
                    f"{index}"
                )
            )

            try:
                valid_changes.append(
                    AIChange(
                        id=str(change_id),
                        action=action,
                        section=change_section,
                        target_id=target_id,
                        old_content=old_content,
                        new_content=new_content,
                        data=change.get("data"),
                        reason=reason,
                    )
                )

            except ValueError:
                continue

        # ---------------------------------------------------------
        # If the AI did not explicitly return changes but produced
        # different content for summary, create a reviewable change.
        # ---------------------------------------------------------

        if (
            not valid_changes
            and section == "summary"
            and optimized_content
            and optimized_content != original_content.strip()
        ):
            valid_changes.append(
                AIChange(
                    id=f"ats_section_summary_{resume_id}",
                    action="update",
                    section="summary",
                    target_id=None,
                    old_content=original_content.strip(),
                    new_content=optimized_content,
                    reason=(
                        "AI optimized the resume summary "
                        "for the selected job description."
                    ),
                )
            )

        return OptimizeSectionResponse(
            resume_id=resume_id,
            section=section,
            original_content=original_content,
            optimized_content=optimized_content,
            changes=valid_changes,
        )


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

        raw_response = self.provider.generate(prompt)

        try:
            data = parse_json_response(raw_response)

            tailored = GeneratedTailoredContent.model_validate(
                data
            )

        except ValueError as exc:
            raise RuntimeError(
                "AI returned invalid structured tailored resume content"
            ) from exc

        # ---------------------------------------------------------
        # Existing resume records
        # ---------------------------------------------------------

        experience_map = {
            item["id"]: item
            for item in generation_context["experience"]
        }

        project_map = {
            item["id"]: item
            for item in generation_context["projects"]
        }

        # ---------------------------------------------------------
        # AI-generated experience updates
        # ---------------------------------------------------------

        updated_experience = {
            item.id: item.description.strip()
            for item in tailored.experience
            if item.id in experience_map
            and item.description.strip()
        }

        # ---------------------------------------------------------
        # AI-generated project updates
        # ---------------------------------------------------------

        updated_projects = {
            item.id: item.description.strip()
            for item in tailored.projects
            if item.id in project_map
            and item.description.strip()
        }

        # ---------------------------------------------------------
        # Build formatted experience records
        # ---------------------------------------------------------

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

        # ---------------------------------------------------------
        # Build formatted project records
        # ---------------------------------------------------------

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

        # ---------------------------------------------------------
        # Summary
        # ---------------------------------------------------------

        current_summary = (
            generation_context["profile"].get(
                "summary",
                "",
            )
            or ""
        ).strip()

        summary = (
            tailored.summary.strip()
            if tailored.summary.strip()
            else current_summary
        )

        # ---------------------------------------------------------
        # Build reviewable AI changes
        #
        # IMPORTANT:
        # Nothing is saved here.
        #
        # These are proposals only.
        # The frontend will display them to the user.
        # ---------------------------------------------------------

        changes: list[AIChange] = []

        # =========================================================
        # SUMMARY CHANGE
        # =========================================================

        if summary and summary != current_summary:
            changes.append(
                AIChange(
                    id=(
                        f"tailored_summary_"
                        f"{resume_id}_"
                        f"{job_description_id}"
                    ),
                    action="update",
                    section="summary",
                    target_id=None,
                    old_content=current_summary,
                    new_content=summary,
                    reason=(
                        "AI tailored the resume summary to better "
                        "match the selected job description."
                    ),
                )
            )

        # =========================================================
        # EXPERIENCE CHANGES
        # =========================================================

        for experience_id, new_description in (
            updated_experience.items()
        ):
            original = experience_map[experience_id]

            old_description = (
                original.get(
                    "description",
                    "",
                )
                or ""
            ).strip()

            if new_description == old_description:
                continue

            changes.append(
                AIChange(
                    id=(
                        f"tailored_experience_"
                        f"{experience_id}_"
                        f"{job_description_id}"
                    ),
                    action="update",
                    section="experience",
                    target_id=experience_id,
                    old_content=old_description,
                    new_content=new_description,
                    reason=(
                        "AI tailored the service history to emphasize "
                        "experience relevant to the selected job description."
                    ),
                )
            )

        # =========================================================
        # PROJECT CHANGES
        # =========================================================

        for project_id, new_description in (
            updated_projects.items()
        ):
            original = project_map[project_id]

            old_description = (
                original.get(
                    "description",
                    "",
                )
                or ""
            ).strip()

            if new_description == old_description:
                continue

            changes.append(
                AIChange(
                    id=(
                        f"tailored_project_"
                        f"{project_id}_"
                        f"{job_description_id}"
                    ),
                    action="update",
                    section="project",
                    target_id=project_id,
                    old_content=old_description,
                    new_content=new_description,
                    reason=(
                        "AI tailored the project description to better "
                        "align with the selected job description."
                    ),
                )
            )

        # ---------------------------------------------------------
        # Format final preview
        # ---------------------------------------------------------

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
                    f"{item['name']} "
                    f"({item['proficiency']})"
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

        if not content.strip():
            raise RuntimeError(
                "Generated tailored resume content is empty"
            )

        return TailoredResumeResponse(
            resume_id=resume_id,
            job_description_id=job_description_id,
            content=content,
            structured=TailoredResumeContent(
                summary=summary,
                skills=generation_context["skills"],
                experience=[
                    item["description"]
                    for item in experience_records
                    if item["description"]
                ],
                projects=[
                    item["description"]
                    for item in project_records
                    if item["description"]
                ],
            ),
            changes=changes,
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


    def generate_service_history(
    self,
    experience_id: int,
    company: str,
    job_title: str,
    employment_type: str | None,
    start_date: str | None,
    end_date: str | None,
    is_current: bool,
    description: str | None,
    professional_title: str | None,
    summary: str | None,
    skills: str,
    projects: str,
    education: str,
    instruction: str | None,
    ) -> GenerateServiceHistoryResponse:

        prompt = SERVICE_HISTORY_GENERATION_PROMPT.format(
            company=company,
            job_title=job_title,
            employment_type=employment_type or "",
            start_date=start_date or "",
            end_date=end_date or "",
            is_current=str(is_current),
            description=description or "",
            professional_title=professional_title or "",
            summary=summary or "",
            skills=skills,
            projects=projects,
            education=education,
            instruction=instruction or "",
        )

        raw_response = self.provider.generate(prompt)

        try:
            data = parse_json_response(raw_response)

            service_history = data.get(
                "service_history",
                [],
            )

            if not isinstance(service_history, list):
                raise ValueError(
                    "service_history must be a list"
                )

            service_history = [
                str(item).strip()
                for item in service_history
                if str(item).strip()
            ]

            if not service_history:
                raise ValueError(
                    "AI returned empty service history"
                )

            return GenerateServiceHistoryResponse(
                experience_id=experience_id,
                service_history=service_history,
            )

        except (ValueError, TypeError) as exc:
            raise RuntimeError(
                "AI returned invalid service history"
            ) from exc