from datetime import date, datetime
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.resume import Resume


CONTENT_COLLECTIONS = (
    "education",
    "experience",
    "skills",
    "projects",
    "certifications",
    "languages",
    "achievements",
)

CONTENT_FIELDS = {
    "education": (
        "institution",
        "degree",
        "field_of_study",
        "start_date",
        "end_date",
        "description",
    ),
    "experience": (
        "company",
        "job_title",
        "location",
        "employment_type",
        "start_date",
        "end_date",
        "is_current",
        "description",
    ),
    "skills": (
        "name",
        "category",
        "proficiency",
    ),
    "projects": (
        "title",
        "description",
        "role",
        "technologies",
        "project_url",
        "start_date",
        "end_date",
    ),
    "certifications": (
        "name",
        "issuing_organization",
        "issue_date",
        "expiration_date",
        "credential_id",
        "credential_url",
    ),
    "languages": (
        "name",
        "proficiency",
    ),
    "achievements": (
        "title",
        "description",
        "organization",
        "year",
    ),
}


def _normalize_value(value: Any) -> Any:
    if isinstance(value, str):
        normalized = " ".join(value.split())
        return normalized or None
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    return value


def build_resume_snapshot(resume: Resume) -> tuple:
    snapshot = []

    for collection_name in CONTENT_COLLECTIONS:
        entries = []
        for child in getattr(resume, collection_name, ()):
            entries.append(
                tuple(
                    (field, _normalize_value(getattr(child, field)))
                    for field in CONTENT_FIELDS[collection_name]
                )
            )

        snapshot.append(
            (
                collection_name,
                tuple(sorted(entries, key=repr)),
            )
        )

    return tuple(snapshot)


def find_canonical_resume_id(
    db: Session,
    resume: Resume,
) -> int:
    candidates = db.scalars(
        select(Resume)
        .options(
            selectinload(Resume.education),
            selectinload(Resume.experience),
            selectinload(Resume.skills),
            selectinload(Resume.projects),
            selectinload(Resume.certifications),
            selectinload(Resume.languages),
            selectinload(Resume.achievements),
        )
        .where(
            Resume.user_id == resume.user_id,
            Resume.template_id == resume.template_id,
            Resume.job_description_id == resume.job_description_id,
        )
        .order_by(Resume.id.asc())
    ).all()

    target_snapshot = build_resume_snapshot(resume)
    matching_ids = [
        candidate.id
        for candidate in candidates
        if build_resume_snapshot(candidate) == target_snapshot
    ]

    return min(matching_ids)
