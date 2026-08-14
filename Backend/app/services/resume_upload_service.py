from __future__ import annotations

import os
import shutil
import uuid
from pathlib import Path
from datetime import date
from typing import Any

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session


from app.models.achievement import Achievement
from app.models.candidate_profile import CandidateProfile
from app.models.certification import Certification
from app.models.education import Education
from app.models.experience import Experience
from app.models.language import Language
from app.models.project import Project
from app.models.resume import Resume, ResumeStatus
from app.models.skill import Skill
from app.parser.document_parser import extract_text
from app.parser.groq_resume_parser import parse_resume_with_groq
from app.parser.schemas import ParsedResume



UPLOAD_DIR = Path("uploads") / "resumes"
ALLOWED_EXTENSIONS = {".pdf", ".docx"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def _split_name(name: str | None) -> tuple[str, str]:
    """
    Split a parsed full name into first and last name.
    """

    if not name:
        return "", ""

    parts = name.strip().split()

    if len(parts) == 1:
        return parts[0], ""

    return parts[0], " ".join(parts[1:])


def _normalize_skill(skill: Any) -> str | None:
    if skill is None:
        return None

    value = str(skill).strip()

    if not value:
        return None

    return value[:100]


def _safe_text(value: Any) -> str | None:
    if value is None:
        return None

    value = str(value).strip()

    return value or None


def _parse_year(value: Any) -> int | None:
    if value is None:
        return None

    try:
        year = int(str(value).strip())

        if 1900 <= year <= 2100:
            return year

    except (TypeError, ValueError):
        pass

    return None

def _parse_date(value: Any) -> date | None:
    """
    Convert common resume date formats into a Python date.

    Examples:
        01/2024 -> 2024-01-01
        02/2024 -> 2024-02-01
        2024-01-01 -> 2024-01-01
        2024 -> 2024-01-01
    """
    if value is None:
        return None

    text = str(value).strip()

    if not text:
        return None

    # MM/YYYY
    try:
        if "/" in text:
            month_text, year_text = text.split("/", 1)

            month = int(month_text)
            year = int(year_text)

            if 1 <= month <= 12 and 1900 <= year <= 2100:
                return date(year, month, 1)
    except (TypeError, ValueError):
        pass

    # YYYY-MM-DD
    try:
        return date.fromisoformat(text)
    except ValueError:
        pass

    # YYYY
    try:
        year = int(text)

        if 1900 <= year <= 2100:
            return date(year, 1, 1)
    except (TypeError, ValueError):
        pass

    return None

def _ensure_upload_directory() -> None:
    UPLOAD_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )


def _save_uploaded_file(
    file: UploadFile,
) -> Path:
    filename = file.filename or ""

    extension = Path(filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF and DOCX files are allowed.",
        )

    _ensure_upload_directory()

    saved_path = (
        UPLOAD_DIR
        / f"{uuid.uuid4()}{extension}"
    )

    total_bytes = 0

    try:
        with saved_path.open("wb") as buffer:
            while chunk := file.file.read(1024 * 1024):
                total_bytes += len(chunk)

                if total_bytes > MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail="Resume file must be 10 MB or smaller.",
                    )

                buffer.write(chunk)

    except Exception:
        saved_path.unlink(
            missing_ok=True,
        )
        raise

    return saved_path


def _replace_resume_sections(
    resume: Resume,
    parsed: ParsedResume,
) -> None:
    """
    Replace all current structured resume sections.

    No version/history rows are created.
    The current resume is fully replaced.
    """

    resume.education.clear()
    resume.experience.clear()
    resume.skills.clear()
    resume.projects.clear()
    resume.certifications.clear()
    resume.languages.clear()
    resume.achievements.clear()

    # ---------------------------------------------------------
    # Skills
    # ---------------------------------------------------------

    seen_skills: set[str] = set()

    for raw_skill in parsed.skills:
        skill_name = _normalize_skill(raw_skill)

        if not skill_name:
            continue

        normalized = skill_name.lower()

        if normalized in seen_skills:
            continue

        seen_skills.add(normalized)

        resume.skills.append(
            Skill(
                name=skill_name[:100],
            )
        )

    # ---------------------------------------------------------
    # Education
    # ---------------------------------------------------------

    for item in parsed.education:
        institution = _safe_text(item.institution)

        if not institution:
            continue

        degree = _safe_text(item.degree)

        start_date = None
        end_date = None

        if item.start_year and 1900 <= item.start_year <= 2100:
            from datetime import date

            start_date = date(
                item.start_year,
                1,
                1,
            )

        if item.end_year and 1900 <= item.end_year <= 2100:
            from datetime import date

            end_date = date(
                item.end_year,
                1,
                1,
            )

        description_parts: list[str] = []

        if item.cgpa:
            description_parts.append(
                f"CGPA: {item.cgpa}"
            )

        if item.percentage:
            description_parts.append(
                f"Percentage: {item.percentage}"
            )

        description = (
            " | ".join(description_parts)
            if description_parts
            else None
        )

        resume.education.append(
            Education(
                institution=institution,
                degree=degree or "Not specified",
                field_of_study=(
                    _safe_text(item.field_of_study)
                ),
                start_date=start_date,
                end_date=end_date,
                description=description,
            )
        )

    # ---------------------------------------------------------
    # Experience
    # ---------------------------------------------------------

    for item in parsed.experience:
        company = _safe_text(item.company)

        if not company:
            continue

        resume.experience.append(
            Experience(
                company=company,
                job_title=(
                    _safe_text(item.job_title)
                    or "Professional Experience"
                ),
                location=_safe_text(item.location),
                employment_type=_safe_text(
                    item.employment_type
                ),
                start_date=_parse_date(
                    item.start_date
                ),
                end_date=_parse_date(
                    item.end_date
                ),
                is_current=item.is_current,
                description=_safe_text(
                    item.description
                ),
            )
        )

    # ---------------------------------------------------------
    # Projects
    # ---------------------------------------------------------

    for item in parsed.projects:
        title = _safe_text(item.title)

        if not title:
            continue

        technologies = [
            str(value).strip()
            for value in item.technologies
            if str(value).strip()
        ]

        technologies_text = ", ".join(
            technologies
        )

        resume.projects.append(
            Project(
                title=title,
                description=_safe_text(
                    item.description
                ),
                role=_safe_text(item.role),
                technologies=(
                    technologies_text or None
                ),
                project_url=_safe_text(
                    item.project_url
                ),
                start_date=_parse_date(
                    item.start_date
                ),
                end_date=_parse_date(
                    item.end_date
                ),
            )
        )

    # ---------------------------------------------------------
    # Certifications
    # ---------------------------------------------------------

    for item in parsed.certifications:
        certificate_name = _safe_text(item.name)

        if not certificate_name:
            continue

        resume.certifications.append(
            Certification(
                name=certificate_name,
                issuing_organization=(
                    _safe_text(
                        item.issuing_organization
                    )
                    or "Not specified"
                ),
                issue_date=_parse_date(
                    item.issue_date
                ),
                expiration_date=_parse_date(
                    item.expiration_date
                ),
                credential_id=(
                    _safe_text(item.credential_id)
                ),
                credential_url=(
                    _safe_text(item.credential_url)
                ),
            )
        )

    # ---------------------------------------------------------
    # Languages
    # ---------------------------------------------------------

    for item in parsed.languages:
        language_name = _safe_text(item.name)

        if not language_name:
            continue

        resume.languages.append(
            Language(
                name=language_name,
                proficiency=(
                    _safe_text(item.proficiency)
                ),
            )
        )

    # ---------------------------------------------------------
    # Achievements
    # ---------------------------------------------------------

    for item in parsed.achievements:
        title = _safe_text(item.title)

        if not title:
            continue

        resume.achievements.append(
            Achievement(
                title=title,
                description=(
                    _safe_text(item.description)
                ),
                organization=(
                    _safe_text(item.organization)
                ),
                year=(
                    item.year
                    if item.year
                    and 1900 <= item.year <= 2100
                    else None
                ),
            )
        )


def _update_candidate_profile(
    db: Session,
    current_user_id: int,
    parsed: ParsedResume,
) -> None:
    """
    Update the user's current candidate profile
    using information extracted from the uploaded resume.
    """

    profile = (
        db.query(CandidateProfile)
        .filter(
            CandidateProfile.user_id
            == current_user_id
        )
        .first()
    )

    first_name, last_name = _split_name(
        parsed.contact.name
    )

    if profile is None:
        if not first_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Unable to determine candidate name "
                    "from the uploaded resume."
                ),
            )

        profile = CandidateProfile(
            user_id=current_user_id,
            first_name=first_name,
            last_name=last_name,
        )

        db.add(profile)

    else:
        if first_name:
            profile.first_name = first_name

        if last_name:
            profile.last_name = last_name

    phone = _safe_text(
        parsed.contact.phone
    )

    location = _safe_text(
        parsed.contact.location
    )

    linkedin = _safe_text(
        parsed.contact.linkedin
    )

    github = _safe_text(
        parsed.contact.github
    )

    portfolio = _safe_text(
        parsed.contact.portfolio
    )

    if phone:
        profile.phone = phone

    if location:
        profile.location = location

    if linkedin:
        profile.linkedin_url = linkedin

    if github:
        profile.github_url = github

    if portfolio:
        profile.portfolio_url = portfolio

def replace_resume_from_upload(
    *,
    db: Session,
    resume: Resume,
    current_user_id: int,
    file: UploadFile,
) -> dict[str, Any]:
    """
    Parse an uploaded resume with the Groq-powered parser
    and replace the current resume state.

    The complete operation is transactional:
    - file is saved and text is extracted first
    - Groq parses the extracted text
    - existing resume sections are replaced only after
      parsing succeeds
    - any database error rolls back the transaction
    """

    saved_path: Path | None = None

    try:
        # ---------------------------------------------------------
        # Save uploaded file
        # ---------------------------------------------------------

        saved_path = _save_uploaded_file(file)

        # ---------------------------------------------------------
        # Extract raw text from PDF/DOCX
        # ---------------------------------------------------------

        text = extract_text(
            str(saved_path)
        )

        if not text or len(text.strip()) < 20:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Unable to extract enough text from the "
                    "uploaded resume."
                ),
            )

        # ---------------------------------------------------------
        # AI-powered structured parsing
        # ---------------------------------------------------------

        parsed = parse_resume_with_groq(
            text
        )

        # ---------------------------------------------------------
        # Validate minimum required information
        # ---------------------------------------------------------

        if not parsed.contact.name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Unable to determine candidate name "
                    "from the uploaded resume."
                ),
            )

        # ---------------------------------------------------------
        # Update candidate profile
        # ---------------------------------------------------------

        _update_candidate_profile(
            db=db,
            current_user_id=current_user_id,
            parsed=parsed,
        )

        # ---------------------------------------------------------
        # Replace current resume sections
        # ---------------------------------------------------------

        _replace_resume_sections(
            resume=resume,
            parsed=parsed,
        )

        resume.status = ResumeStatus.COMPLETED

        # ---------------------------------------------------------
        # Force relationship deletions before inserts
        # ---------------------------------------------------------

        db.flush()

        # ---------------------------------------------------------
        # Commit current resume state
        # ---------------------------------------------------------

        db.commit()
        db.refresh(resume)

        return {
            "message": "Resume uploaded and parsed successfully.",
            "resume_id": resume.id,
            "filename": file.filename,
            "parsed": parsed.model_dump(),
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Resume processing failed: {exc}",
        ) from exc

    finally:
        # ---------------------------------------------------------
        # Delete temporary uploaded file
        # ---------------------------------------------------------

        if saved_path is not None:
            try:
                saved_path.unlink(
                    missing_ok=True
                )
            except OSError:
                pass