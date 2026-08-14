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
        "profile": format_profile(
            profile,
            current_user,
        ),
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
    current_user: User,
) -> str:
    if profile is None:
        return ""

    lines: list[str] = []

    first_name = _clean_generation_value(
        profile.first_name
    )
    last_name = _clean_generation_value(
        profile.last_name
    )

    name = " ".join(
        value
        for value in (
            first_name,
            last_name,
        )
        if value
    )

    if name:
        lines.append(
            f"Name: {name}"
        )

    email = _clean_generation_value(
        profile.email
    )

    if email:
        lines.append(
            f"Email: {email}"
        )

    professional_title = _clean_generation_value(
        profile.professional_title
    )

    if professional_title:
        lines.append(
            f"Professional Title: {professional_title}"
        )

    phone = _clean_generation_value(
        profile.phone
    )

    if phone:
        lines.append(
            f"Phone: {phone}"
        )

    location = _clean_generation_value(
        profile.location
    )

    if location:
        lines.append(
            f"Location: {location}"
        )

    summary = _clean_generation_value(
        profile.summary
    )

    if summary:
        lines.append(
            f"Summary: {summary}"
        )

    linkedin = _clean_generation_value(
        profile.linkedin_url
    )

    if linkedin:
        lines.append(
            f"LinkedIn: {linkedin}"
        )

    github = _clean_generation_value(
        profile.github_url
    )

    if github:
        lines.append(
            f"GitHub: {github}"
        )

    portfolio = _clean_generation_value(
        profile.portfolio_url
    )

    if portfolio:
        lines.append(
            f"Portfolio: {portfolio}"
        )

    return "\n".join(lines)


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



from typing import Any


PLACEHOLDER_VALUES = {
    "string",
    "n/a",
    "na",
    "none",
    "null",
    "your email",
    "your phone",
    "your location",
    "your name",
    "your url",
    "https://example.com/",
    "https://example.com",
}


def _clean_generation_value(
    value: str | None,
) -> str:
    if not value:
        return ""

    cleaned = str(value).strip()

    if cleaned.lower() in PLACEHOLDER_VALUES:
        return ""

    return cleaned


def build_resume_generation_context(
    resume: Resume,
    current_user: User,
    db: Session,
) -> dict[str, Any]:
    """
    Build structured, trusted resume data for AI-assisted
    generation.

    Only prose fields are allowed to be rewritten by AI.
    Identity, dates, skills, titles, companies, institutions,
    certification names, and URLs remain application-controlled.
    """

    profile = db.scalar(
        select(CandidateProfile).where(
            CandidateProfile.user_id == current_user.id
        )
    )

    education = db.scalars(
        select(Education)
        .where(Education.resume_id == resume.id)
        .order_by(
            Education.start_date.asc().nullslast(),
            Education.id.asc(),
        )
    ).all()

    experience = db.scalars(
        select(Experience)
        .where(Experience.resume_id == resume.id)
        .order_by(
            Experience.start_date.desc().nullslast(),
            Experience.id.asc(),
        )
    ).all()

    skills = db.scalars(
        select(Skill)
        .where(Skill.resume_id == resume.id)
        .order_by(
            Skill.id.asc(),
        )
    ).all()

    projects = db.scalars(
        select(Project)
        .where(Project.resume_id == resume.id)
        .order_by(
            Project.id.asc(),
        )
    ).all()

    certifications = db.scalars(
        select(Certification)
        .where(Certification.resume_id == resume.id)
        .order_by(
            Certification.id.asc(),
        )
    ).all()

    languages = db.scalars(
        select(Language)
        .where(Language.resume_id == resume.id)
        .order_by(
            Language.id.asc(),
        )
    ).all()

    achievements = db.scalars(
        select(Achievement)
        .where(Achievement.resume_id == resume.id)
        .order_by(
            Achievement.id.asc(),
        )
    ).all()

    return {
        "profile": {
            "first_name": (
                _clean_generation_value(
                    profile.first_name
                    if profile
                    else ""
                )
            ),
            "last_name": (
                _clean_generation_value(
                    profile.last_name
                    if profile
                    else ""
                )
            ),

            "email": _clean_generation_value(
                profile.email
                if profile
                else ""
            ),

            "phone": (
                _clean_generation_value(
                    profile.phone
                    if profile
                    else ""
                )
            ),
            "professional_title": (
                _clean_generation_value(
                    profile.professional_title
                    if profile
                    else ""
                )
            ),
            "location": (
                _clean_generation_value(
                    profile.location
                    if profile
                    else ""
                )
            ),
            "summary": (
                _clean_generation_value(
                    profile.summary
                    if profile
                    else ""
                )
            ),
            "linkedin_url": (
                _clean_generation_value(
                    profile.linkedin_url
                    if profile
                    else ""
                )
            ),
            "github_url": (
                _clean_generation_value(
                    profile.github_url
                    if profile
                    else ""
                )
            ),
            "portfolio_url": (
                _clean_generation_value(
                    profile.portfolio_url
                    if profile
                    else ""
                )
            ),
        },
        "education": [
            {
                "id": item.id,
                "institution": item.institution,
                "degree": item.degree,
                "field_of_study": (
                    item.field_of_study or ""
                ),
                "start_date": (
                    item.start_date.isoformat()
                    if item.start_date
                    else ""
                ),
                "end_date": (
                    item.end_date.isoformat()
                    if item.end_date
                    else ""
                ),
                "description": (
                    item.description or ""
                ),
            }
            for item in education
        ],
        "experience": [
            {
                "id": item.id,
                "company": item.company,
                "job_title": item.job_title,
                "location": item.location or "",
                "employment_type": (
                    item.employment_type or ""
                ),
                "start_date": (
                    item.start_date.isoformat()
                    if item.start_date
                    else ""
                ),
                "end_date": (
                    item.end_date.isoformat()
                    if item.end_date
                    else ""
                ),
                "is_current": item.is_current,
                "description": (
                    item.description or ""
                ),
            }
            for item in experience
        ],
        "skills": [
            item.name
            for item in skills
            if item.name
        ],
        "projects": [
            {
                "id": item.id,
                "title": item.title,
                "role": item.role or "",
                "technologies": (
                    item.technologies or ""
                ),
                "project_url": (
                    item.project_url or ""
                ),
                "start_date": (
                    item.start_date.isoformat()
                    if item.start_date
                    else ""
                ),
                "end_date": (
                    item.end_date.isoformat()
                    if item.end_date
                    else ""
                ),
                "description": (
                    item.description or ""
                ),
            }
            for item in projects
        ],
        "certifications": [
            {
                "id": item.id,
                "name": item.name,
                "issuing_organization": (
                    item.issuing_organization
                ),
                "issue_date": (
                    item.issue_date.isoformat()
                    if item.issue_date
                    else ""
                ),
                "expiration_date": (
                    item.expiration_date.isoformat()
                    if item.expiration_date
                    else ""
                ),
                "credential_id": (
                    item.credential_id or ""
                ),
                "credential_url": (
                    item.credential_url or ""
                ),
            }
            for item in certifications
        ],
        "languages": [
            {
                "id": item.id,
                "name": item.name,
                "proficiency": (
                    item.proficiency or ""
                ),
            }
            for item in languages
        ],
        "achievements": [
            {
                "id": item.id,
                "title": item.title,
                "organization": (
                    item.organization or ""
                ),
                "year": item.year or "",
                "description": (
                    item.description or ""
                ),
            }
            for item in achievements
        ],
    }