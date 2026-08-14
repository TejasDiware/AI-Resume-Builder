from __future__ import annotations

import re
from typing import Iterable


def format_resume_text(
    *,
    profile: dict[str, str],
    summary: str | None,
    education: Iterable[dict[str, str]],
    experience: Iterable[dict[str, str]],
    skills: Iterable[str],
    projects: Iterable[dict[str, str]],
    certifications: Iterable[dict[str, str]],
    languages: Iterable[str],
    achievements: Iterable[str],
) -> str:
    """
    Assemble the final resume from trusted structured data.

    Facts are rendered deterministically. AI-generated prose can be
    supplied for summary/description fields, but identity, dates,
    skills, companies, project names, and certification names remain
    controlled by the application.
    """

    sections: list[str] = []

    # ---------------------------------------------------------
    # Header
    # ---------------------------------------------------------

    header: list[str] = []

    name = " ".join(
        value.strip()
        for value in (
            profile.get("first_name", ""),
            profile.get("last_name", ""),
        )
        if value and value.strip()
    )

    if name:
        header.append(name)

    professional_title = (
        profile.get("professional_title") or ""
    ).strip()

    if professional_title:
        header.append(professional_title)

    contact: list[str] = []

    for key in (
        "email",
        "phone",
        "location",
    ):
        value = (
            profile.get(key) or ""
        ).strip()

        if value:
            contact.append(value)

    for key in (
        "linkedin_url",
        "github_url",
        "portfolio_url",
    ):
        value = (
            profile.get(key) or ""
        ).strip()

        if value:
            contact.append(value)

    if contact:
        header.append(" | ".join(contact))

    if header:
        sections.append(
            "\n".join(header)
        )

    # ---------------------------------------------------------
    # Summary
    # ---------------------------------------------------------

    if summary and summary.strip():
        sections.append(
            "SUMMARY\n"
            + summary.strip()
        )

    # ---------------------------------------------------------
    # Education
    # ---------------------------------------------------------

    education_lines: list[str] = []

    for item in education:
        institution = (
            item.get("institution") or ""
        ).strip()

        degree = (
            item.get("degree") or ""
        ).strip()

        field = (
            item.get("field_of_study") or ""
        ).strip()

        start_date = (
            item.get("start_date") or ""
        ).strip()

        end_date = (
            item.get("end_date") or ""
        ).strip()

        description = (
            item.get("description") or ""
        ).strip()

        if not institution and not degree:
            continue

        line = institution

        if degree:
            line += f" — {degree}"

        if field and field.lower() != degree.lower():
            line += f" in {field}"

        dates = " – ".join(
            value
            for value in (
                start_date,
                end_date,
            )
            if value
        )

        if dates:
            line += f" — {dates}"

        education_lines.append(line)

        if description:
            education_lines.append(
                f"  {description}"
            )

    if education_lines:
        sections.append(
            "EDUCATION\n"
            + "\n".join(education_lines)
        )

    # ---------------------------------------------------------
    # Experience
    # ---------------------------------------------------------

    experience_lines: list[str] = []

    for item in experience:
        company = (
            item.get("company") or ""
        ).strip()

        job_title = (
            item.get("job_title") or ""
        ).strip()

        location = (
            item.get("location") or ""
        ).strip()

        start_date = (
            item.get("start_date") or ""
        ).strip()

        end_date = (
            item.get("end_date") or ""
        ).strip()

        is_current = (
            item.get("is_current") == "True"
        )

        description = (
            item.get("description") or ""
        ).strip()

        if not company and not job_title:
            continue

        line = ""

        if company:
            line += company

        if job_title:
            line += (
                f" — {job_title}"
                if line
                else job_title
            )

        if location:
            line += f" — {location}"

        dates = " – ".join(
            value
            for value in (
                start_date,
                "Present"
                if is_current
                else end_date,
            )
            if value
        )

        if dates:
            line += f" — {dates}"

        experience_lines.append(line)

        if description:
            experience_lines.append(
                f"- {description}"
            )

    if experience_lines:
        sections.append(
            "EXPERIENCE\n"
            + "\n".join(experience_lines)
        )

    # ---------------------------------------------------------
    # Skills
    # ---------------------------------------------------------

    skill_lines = [
        f"- {skill.strip()}"
        for skill in skills
        if skill and skill.strip()
    ]

    if skill_lines:
        sections.append(
            "SKILLS\n"
            + "\n".join(skill_lines)
        )

    # ---------------------------------------------------------
    # Projects
    # ---------------------------------------------------------

    project_lines: list[str] = []

    for item in projects:
        title = (
            item.get("title") or ""
        ).strip()

        technologies = (
            item.get("technologies") or ""
        ).strip()

        description = (
            item.get("description") or ""
        ).strip()

        if not title:
            continue

        project_lines.append(
            f"{title}"
        )

        if technologies:
            project_lines.append(
                f"Technologies: {technologies}"
            )

        if description:
            project_lines.append(
                f"- {description}"
            )

        project_url = (
            item.get("project_url") or ""
        ).strip()

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

    # ---------------------------------------------------------
    # Certifications
    # ---------------------------------------------------------

    certification_lines: list[str] = []

    for item in certifications:
        name = (
            item.get("name") or ""
        ).strip()

        organization = (
            item.get("issuing_organization")
            or ""
        ).strip()

        if not name:
            continue

        line = name

        if organization:
            line += f" — {organization}"

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

    # ---------------------------------------------------------
    # Languages
    # ---------------------------------------------------------

    language_lines = [
        f"- {language.strip()}"
        for language in languages
        if language and language.strip()
    ]

    if language_lines:
        sections.append(
            "LANGUAGES\n"
            + "\n".join(language_lines)
        )

    # ---------------------------------------------------------
    # Achievements
    # ---------------------------------------------------------

    achievement_lines = [
        f"- {achievement.strip()}"
        for achievement in achievements
        if achievement and achievement.strip()
    ]

    if achievement_lines:
        sections.append(
            "ACHIEVEMENTS\n"
            + "\n".join(achievement_lines)
        )

    return "\n\n".join(
        section.strip()
        for section in sections
        if section.strip()
    ).strip()