from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.achievement import Achievement
from app.models.candidate_profile import CandidateProfile
from app.models.certification import Certification
from app.models.education import Education
from app.models.experience import Experience
from app.models.language import Language
from app.models.project import Project
from app.models.resume import Resume
from app.models.skill import Skill
from app.models.user import User


def build_resume_ai_context(
    resume: Resume | None,
    current_user: User,
    db: Session,
) -> dict[str, str]:
    """
    Build a structured, human-readable context for AI resume generation.

    Only data belonging to the authenticated user's resume is included.
    """

    if resume is None:
        raise ValueError("Resume not found for the current user.")

    # Candidate profile belongs to the authenticated user.
    profile = db.scalar(
        select(CandidateProfile).where(
            CandidateProfile.user_id == current_user.id
        )
    )

    # Education
    education = db.scalars(
        select(Education)
        .where(Education.resume_id == resume.id)
        .order_by(
            Education.start_date.desc().nullslast(),
            Education.id.desc(),
        )
    ).all()

    # Experience
    experience = db.scalars(
        select(Experience)
        .where(Experience.resume_id == resume.id)
        .order_by(
            Experience.start_date.desc().nullslast(),
            Experience.id.desc(),
        )
    ).all()

    # Skills
    skills = db.scalars(
        select(Skill)
        .where(Skill.resume_id == resume.id)
        .order_by(
            Skill.name.asc(),
            Skill.id.asc(),
        )
    ).all()

    # Projects
    projects = db.scalars(
        select(Project)
        .where(Project.resume_id == resume.id)
        .order_by(
            Project.start_date.desc().nullslast(),
            Project.id.desc(),
        )
    ).all()

    # Certifications
    certifications = db.scalars(
        select(Certification)
        .where(Certification.resume_id == resume.id)
        .order_by(
            Certification.issue_date.desc().nullslast(),
            Certification.id.desc(),
        )
    ).all()

    # Languages
    languages = db.scalars(
        select(Language)
        .where(Language.resume_id == resume.id)
        .order_by(
            Language.name.asc(),
            Language.id.asc(),
        )
    ).all()

    # Achievements
    achievements = db.scalars(
        select(Achievement)
        .where(Achievement.resume_id == resume.id)
        .order_by(
            Achievement.year.desc().nullslast(),
            Achievement.id.desc(),
        )
    ).all()

    # Return all data in AI-friendly text form.
    return {
        "profile": format_profile(profile),
        "education": format_education(education),
        "experience": format_experience(experience),
        "skills": format_skills(skills),
        "projects": format_projects(projects),
        "certifications": format_certifications(certifications),
        "languages": format_languages(languages),
        "achievements": format_achievements(achievements),
    }


def format_profile(
    profile: CandidateProfile | None,
) -> str:
    if profile is None:
        return "No candidate profile available."

    return (
        f"Name: {profile.first_name} {profile.last_name}\n"
        f"Professional Title: {profile.professional_title or 'N/A'}\n"
        f"Phone: {profile.phone or 'N/A'}\n"
        f"Location: {profile.location or 'N/A'}\n"
        f"Summary: {profile.summary or 'N/A'}\n"
        f"LinkedIn: {profile.linkedin_url or 'N/A'}\n"
        f"GitHub: {profile.github_url or 'N/A'}\n"
        f"Portfolio: {profile.portfolio_url or 'N/A'}"
    )


def format_education(
    records: list[Education],
) -> str:
    if not records:
        return "No education records available."

    return "\n\n".join(
        (
            f"Institution: {item.institution}\n"
            f"Degree: {item.degree}\n"
            f"Field: {item.field_of_study or 'N/A'}\n"
            f"Start Date: {item.start_date or 'N/A'}\n"
            f"End Date: {item.end_date or 'N/A'}\n"
            f"Description: {item.description or 'N/A'}"
        )
        for item in records
    )


def format_experience(
    records: list[Experience],
) -> str:
    if not records:
        return "No experience records available."

    return "\n\n".join(
        (
            f"Company: {item.company}\n"
            f"Job Title: {item.job_title}\n"
            f"Location: {item.location or 'N/A'}\n"
            f"Employment Type: {item.employment_type or 'N/A'}\n"
            f"Start Date: {item.start_date or 'N/A'}\n"
            f"End Date: {item.end_date or 'Present'}\n"
            f"Current: {item.is_current}\n"
            f"Description: {item.description or 'N/A'}"
        )
        for item in records
    )


def format_skills(
    records: list[Skill],
) -> str:
    if not records:
        return "No skills available."

    return "\n".join(
        (
            f"- {item.name}"
            f" | Category: {item.category or 'N/A'}"
            f" | Proficiency: {item.proficiency or 'N/A'}"
        )
        for item in records
    )


def format_projects(
    records: list[Project],
) -> str:
    if not records:
        return "No projects available."

    return "\n\n".join(
        (
            f"Title: {item.title}\n"
            f"Role: {item.role or 'N/A'}\n"
            f"Technologies: {item.technologies or 'N/A'}\n"
            f"Start Date: {item.start_date or 'N/A'}\n"
            f"End Date: {item.end_date or 'N/A'}\n"
            f"URL: {item.project_url or 'N/A'}\n"
            f"Description: {item.description or 'N/A'}"
        )
        for item in records
    )


def format_certifications(
    records: list[Certification],
) -> str:
    if not records:
        return "No certifications available."

    return "\n\n".join(
        (
            f"Name: {item.name}\n"
            f"Issuing Organization: {item.issuing_organization}\n"
            f"Issue Date: {item.issue_date or 'N/A'}\n"
            f"Expiration Date: {item.expiration_date or 'N/A'}\n"
            f"Credential ID: {item.credential_id or 'N/A'}\n"
            f"Credential URL: {item.credential_url or 'N/A'}"
        )
        for item in records
    )


def format_languages(
    records: list[Language],
) -> str:
    if not records:
        return "No languages available."

    return "\n".join(
        f"- {item.name} | Proficiency: {item.proficiency or 'N/A'}"
        for item in records
    )


def format_achievements(
    records: list[Achievement],
) -> str:
    if not records:
        return "No achievements available."

    return "\n\n".join(
        (
            f"Title: {item.title}\n"
            f"Organization: {item.organization or 'N/A'}\n"
            f"Year: {item.year or 'N/A'}\n"
            f"Description: {item.description or 'N/A'}"
        )
        for item in records
    )