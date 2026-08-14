from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.ai.context_builder import (
    build_resume_generation_context,
)
from app.database.session import get_db
from app.models.resume import Resume
from app.models.user import User
from app.pdf.generator import generate_resume_pdf


router = APIRouter(
    prefix="/resumes",
    tags=["Resume PDF"],
)


def format_resume_date(value: str) -> str:
    """
    Convert ISO dates such as 2024-01-01 into
    resume-friendly dates such as Jan 2024.
    """
    if not value:
        return ""

    try:
        parsed = date.fromisoformat(value)
        return parsed.strftime("%b %Y")

    except ValueError:
        return value


@router.get("/{resume_id}/pdf")
def download_resume_pdf(
    resume_id: int,
    template: str = "classic",
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
        context = build_resume_generation_context(
            resume=resume,
            current_user=current_user,
            db=db,
        )

        profile = context["profile"]

        # =====================================================
        # HEADER
        # =====================================================

        name = " ".join(
            value.strip()
            for value in (
                profile.get("first_name", ""),
                profile.get("last_name", ""),
            )
            if value and value.strip()
        )

        header_lines: list[str] = []

        if name:
            header_lines.append(name)

        contact_values: list[str] = []

        for key in (
            "email",
            "phone",
            "location",
        ):
            value = (
                profile.get(key, "")
                or ""
            ).strip()

            if value:
                contact_values.append(value)

        for key in (
            "linkedin_url",
            "github_url",
            "portfolio_url",
        ):
            value = (
                profile.get(key, "")
                or ""
            ).strip()

            if value:
                contact_values.append(value)

        if contact_values:
            header_lines.append(
                " | ".join(contact_values)
            )

        sections: list[str] = []

        if header_lines:
            sections.append(
                "\n".join(header_lines)
            )

        # =====================================================
        # SUMMARY
        # =====================================================

        summary = (
            profile.get("summary", "")
            or ""
        ).strip()

        if summary:
            sections.append(
                "SUMMARY\n"
                + summary
            )

        # =====================================================
        # EDUCATION
        # =====================================================

        education_lines: list[str] = []

        education_records = sorted(
            context["education"],
            key=lambda item: (
                item.get("start_date")
                or "0000-00-00"
            ),
            reverse=True,
        )

        for item in education_records:
            institution = (
                item.get("institution", "")
                or ""
            ).strip()

            degree = (
                item.get("degree", "")
                or ""
            ).strip()

            field = (
                item.get("field_of_study", "")
                or ""
            ).strip()

            start_date = format_resume_date(
                item.get("start_date", "")
            )

            end_date = format_resume_date(
                item.get("end_date", "")
            )

            # -------------------------------------------------
            # Degree
            # -------------------------------------------------

            education_line = degree

            # Avoid:
            # HSC in HSC
            # SSC in SSC
            # B.E. in Electronics and Telecommunication
            # when degree already contains the field.
            if (
                field
                and degree
                and field.lower()
                not in degree.lower()
                and field.lower()
                != degree.lower()
            ):
                education_line += (
                    f" in {field}"
                )

            elif field and not degree:
                education_line = field

            # -------------------------------------------------
            # Institution
            # -------------------------------------------------

            if institution:
                if education_line:
                    education_line += (
                        f" — {institution}"
                    )
                else:
                    education_line = institution

            # -------------------------------------------------
            # Dates
            # -------------------------------------------------

            dates = " – ".join(
                value
                for value in (
                    start_date,
                    end_date,
                )
                if value
            )

            if dates:
                education_line += (
                    f" | {dates}"
                )

            if education_line:
                education_lines.append(
                    education_line
                )

            description = (
                item.get("description", "")
                or ""
            ).strip()

            if description:
                education_lines.append(
                    description
                )

        if education_lines:
            sections.append(
                "EDUCATION\n"
                + "\n".join(
                    education_lines
                )
            )

        # =====================================================
        # EXPERIENCE
        # =====================================================

        experience_lines: list[str] = []

        for item in context["experience"]:
            company = (
                item.get("company", "")
                or ""
            ).strip()

            job_title = (
                item.get("job_title", "")
                or ""
            ).strip()

            location = (
                item.get("location", "")
                or ""
            ).strip()

            start_date = format_resume_date(
                item.get("start_date", "")
            )

            if item.get("is_current"):
                end_date = "Present"
            else:
                end_date = format_resume_date(
                    item.get("end_date", "")
                )

            experience_line = ""

            if company:
                experience_line = company

            if job_title:
                experience_line += (
                    f" — {job_title}"
                    if experience_line
                    else job_title
                )

            if location:
                experience_line += (
                    f" — {location}"
                    if experience_line
                    else location
                )

            dates = " – ".join(
                value
                for value in (
                    start_date,
                    end_date,
                )
                if value
            )

            if dates:
                experience_line += (
                    f" | {dates}"
                )

            if experience_line:
                experience_lines.append(
                    experience_line
                )

            description = (
                item.get("description", "")
                or ""
            ).strip()

            if description:
                experience_lines.append(
                    f"- {description}"
                )

        if experience_lines:
            sections.append(
                "EXPERIENCE\n"
                + "\n".join(
                    experience_lines
                )
            )

        # =====================================================
        # SKILLS
        # =====================================================

        skill_lines = [
            f"- {skill.strip()}"
            for skill in context["skills"]
            if skill
            and skill.strip()
        ]

        if skill_lines:
            sections.append(
                "SKILLS\n"
                + "\n".join(
                    skill_lines
                )
            )

        # =====================================================
        # PROJECTS
        # =====================================================

        project_lines: list[str] = []

        for item in context["projects"]:
            title = (
                item.get("title", "")
                or ""
            ).strip()

            technologies = (
                item.get("technologies", "")
                or ""
            ).strip()

            description = (
                item.get("description", "")
                or ""
            ).strip()

            project_url = (
                item.get("project_url", "")
                or ""
            ).strip()

            if not title:
                continue

            project_lines.append(title)

            if technologies:
                project_lines.append(
                    f"Technologies: {technologies}"
                )

            if description:
                project_lines.append(
                    f"- {description}"
                )

            if project_url:
                project_lines.append(
                    f"URL: {project_url}"
                )

            project_lines.append("")

        if project_lines:
            sections.append(
                "PROJECTS\n"
                + "\n".join(
                    project_lines
                ).strip()
            )

        # =====================================================
        # CERTIFICATIONS
        # =====================================================

        certification_lines: list[str] = []

        for item in context[
            "certifications"
        ]:
            name = (
                item.get("name", "")
                or ""
            ).strip()

            organization = (
                item.get(
                    "issuing_organization",
                    "",
                )
                or ""
            ).strip()

            if not name:
                continue

            line = name

            if organization:
                line += (
                    f" — {organization}"
                )

            certification_lines.append(
                f"- {line}"
            )

        if certification_lines:
            sections.append(
                "CERTIFICATIONS\n"
                + "\n".join(
                    certification_lines
                )
            )

        # =====================================================
        # LANGUAGES
        # =====================================================

        language_lines: list[str] = []

        for item in context["languages"]:
            name = (
                item.get("name", "")
                or ""
            ).strip()

            proficiency = (
                item.get("proficiency", "")
                or ""
            ).strip()

            if not name:
                continue

            line = name

            if proficiency:
                line += (
                    f" — {proficiency}"
                )

            language_lines.append(
                f"- {line}"
            )

        if language_lines:
            sections.append(
                "LANGUAGES\n"
                + "\n".join(
                    language_lines
                )
            )

        # =====================================================
        # ACHIEVEMENTS
        # =====================================================

        achievement_lines: list[str] = []

        for item in context[
            "achievements"
        ]:
            description = (
                item.get(
                    "description",
                    "",
                )
                or ""
            ).strip()

            if description:
                achievement_lines.append(
                    f"- {description}"
                )

        if achievement_lines:
            sections.append(
                "ACHIEVEMENTS\n"
                + "\n".join(
                    achievement_lines
                )
            )

        # =====================================================
        # FINAL CONTENT
        # =====================================================

        content = "\n\n".join(
            section.strip()
            for section in sections
            if section.strip()
        )

        if not content:
            raise ValueError(
                "No resume content available."
            )

        pdf_buffer, filename = (
            generate_resume_pdf(
                content=content,
                filename=(
                    f"resume_{resume.id}_"
                    f"{template}.pdf"
                ),
                template=template,
            )
        )

        return Response(
            content=pdf_buffer.getvalue(),
            media_type="application/pdf",
            headers={
                "Content-Disposition": (
                    f'attachment; filename="{filename}"'
                ),
            },
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )