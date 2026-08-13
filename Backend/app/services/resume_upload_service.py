from __future__ import annotations

import os
import shutil
import uuid
from pathlib import Path
from typing import Any

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.extractor.info_extractor import extract_basic_info
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
from app.services.resume_normalizer import (
    normalize_resume_info,
)


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
    info: dict[str, Any],
) -> None:
    """
    Replace all current structured resume sections.

    No version/history rows are created.
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

    for raw_skill in info.get("skills") or []:
        skill_name = _normalize_skill(raw_skill)

        if not skill_name:
            continue

        normalized = skill_name.lower()

        if normalized in seen_skills:
            continue

        seen_skills.add(normalized)

        resume.skills.append(
            Skill(
                name=skill_name,
            )
        )

    # ---------------------------------------------------------
    # Education
    # ---------------------------------------------------------

    education_data = info.get("education") or {}

    college = (
        _safe_text(
            education_data.get("college")
        )
        or "Not specified"
    )

    graduation_year = _parse_year(
        education_data.get("graduation_year")
    )

    end_date = None

    if graduation_year:
        from datetime import date

        end_date = date(
            graduation_year,
            1,
            1,
        )

    for degree in education_data.get("degrees") or []:
        degree_name = _safe_text(degree)

        if not degree_name:
            continue

        resume.education.append(
            Education(
                institution=college,
                degree=degree_name,
                field_of_study=None,
                start_date=None,
                end_date=end_date,
                description=_safe_text(
                    f"CGPA: {education_data.get('cgpa')}"
                    if education_data.get("cgpa")
                    else None
                ),
            )
        )

    # ---------------------------------------------------------
    # Experience
    # ---------------------------------------------------------

    for item in info.get("experience") or []:
        if not isinstance(item, dict):
            continue

        company = _safe_text(
            item.get("company")
        )

        role = _safe_text(
            item.get("role")
        )

        description = _safe_text(
            item.get("description")
        )

        if not company:
            continue

        resume.experience.append(
            Experience(
                company=company,
                job_title=role or "Professional Experience",
                location=None,
                employment_type=None,
                start_date=None,
                end_date=None,
                is_current=(
                    "present" in (
                        item.get("duration") or ""
                    ).lower()
                    or "current" in (
                        item.get("duration") or ""
                    ).lower()
                ),
                description=description,
            )
        )

    # ---------------------------------------------------------
    # Projects
    # ---------------------------------------------------------

    for item in info.get("projects") or []:
        if not isinstance(item, dict):
            continue

        title = _safe_text(
            item.get("name")
        )

        if not title:
            continue

        technologies = item.get(
            "technologies"
        ) or []

        technologies_text = ", ".join(
            str(value).strip()
            for value in technologies
            if str(value).strip()
        )

        resume.projects.append(
            Project(
                title=title,
                description=_safe_text(
                    item.get("description")
                ),
                role=None,
                technologies=(
                    technologies_text
                    or None
                ),
                project_url=None,
                start_date=None,
                end_date=None,
            )
        )

    # ---------------------------------------------------------
    # Certifications
    # ---------------------------------------------------------

    for item in info.get("certifications") or []:
        certificate_name = _safe_text(item)

        if not certificate_name:
            continue

        resume.certifications.append(
            Certification(
                name=certificate_name,
                issuing_organization="Not specified",
                issue_date=None,
                expiration_date=None,
                credential_id=None,
                credential_url=None,
            )
        )

    # The current parser does not return
    # languages or achievements, so those
    # collections intentionally remain empty.


def _update_candidate_profile(
    db: Session,
    current_user_id: int,
    info: dict[str, Any],
) -> None:
    """
    Update the user's current candidate profile
    using information extracted from the uploaded resume.
    """

    profile = db.query(
        CandidateProfile
    ).filter(
        CandidateProfile.user_id
        == current_user_id
    ).first()

    first_name, last_name = _split_name(
        info.get("name")
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
        info.get("phone")
    )

    address = _safe_text(
        info.get("address")
    )

    linkedin = _safe_text(
        info.get("linkedin")
    )

    github = _safe_text(
        info.get("github")
    )

    portfolio = _safe_text(
        info.get("portfolio")
    )

    if phone:
        profile.phone = phone

    if address:
        profile.location = address

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
    Parse an uploaded resume and replace the current resume state.

    The complete operation is transactional:
    - extraction happens first
    - existing resume sections are replaced only after
      extraction succeeds
    - any database error rolls back to the previous state
    """

    saved_path: Path | None = None

    try:
        saved_path = _save_uploaded_file(file)

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

        info = extract_basic_info(
            text
        )

        info = normalize_resume_info(
            info
        )

        if not info:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unable to parse the uploaded resume.",
            )

        _update_candidate_profile(
            db=db,
            current_user_id=current_user_id,
            info=info,
        )

        _replace_resume_sections(
            resume=resume,
            info=info,
        )

        resume.status = ResumeStatus.COMPLETED

        # Force relationship deletions before inserts.
        db.flush()

        db.commit()
        db.refresh(resume)

        return {
            "message": "Resume uploaded and parsed successfully.",
            "resume_id": resume.id,
            "filename": file.filename,
            "parsed": info,
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
        if saved_path is not None:
            try:
                saved_path.unlink(
                    missing_ok=True
                )
            except OSError:
                pass