from __future__ import annotations

import re
from typing import Any


INVALID_CERTIFICATION_PREFIXES = (
    "ADDITIONAL",
    "----- EXTRACTED LINKS -----",
    "INTERESTS:",
)

PROJECT_SECTION_END_MARKERS = (
    "CERTIFICATION",
    "CERTIFICATIONS",
    "ACHIEVEMENT",
    "ACHIEVEMENTS",
    "LANGUAGE",
    "LANGUAGES",
    "ADDITIONAL",
)


def clean_address(value: str | None) -> str | None:
    if not value:
        return None

    parts = [
        part.strip()
        for part in value.split("|")
        if part.strip()
    ]

    cleaned = []

    for part in parts:
        lower = part.lower()

        if "@" in part:
            continue

        if re.search(r"\+?\d[\d\s().-]{7,}", part):
            continue

        cleaned.append(part)

    if not cleaned:
        return None

    return ", ".join(cleaned)


def clean_certifications(
    certifications: list[Any] | None,
) -> list[str]:
    if not certifications:
        return []

    result: list[str] = []

    for item in certifications:
        value = str(item).strip()

        if not value:
            continue

        upper = value.upper()

        if any(
            upper.startswith(prefix)
            for prefix in INVALID_CERTIFICATION_PREFIXES
        ):
            continue

        if "INTERESTS:" in upper:
            continue

        if "EXTRACTED LINKS" in upper:
            continue

        result.append(value)

    return list(dict.fromkeys(result))


def clean_projects(
    projects: list[Any] | None,
) -> list[dict[str, Any]]:
    if not projects:
        return []

    cleaned_projects: list[dict[str, Any]] = []

    for project in projects:
        if not isinstance(project, dict):
            continue

        name = str(
            project.get("name") or ""
        ).strip()

        description = str(
            project.get("description") or ""
        ).strip()

        technologies = project.get(
            "technologies"
        ) or []

        if not name:
            continue

        description = description.replace(
            "(cid:127)",
            "•",
        )

        # Remove obvious certification spill-over.
        for marker in PROJECT_SECTION_END_MARKERS:
            pattern = re.compile(
                rf"\s+{re.escape(marker)}.*$",
                re.IGNORECASE | re.DOTALL,
            )
            description = pattern.sub(
                "",
                description,
            )

        description = re.sub(
            r"\s+",
            " ",
            description,
        ).strip()

        technologies = [
            str(item).strip()
            for item in technologies
            if str(item).strip()
        ]

        cleaned_projects.append(
            {
                "name": name,
                "technologies": list(
                    dict.fromkeys(technologies)
                ),
                "description": description,
            }
        )

    return cleaned_projects


def normalize_resume_info(
    info: dict[str, Any],
) -> dict[str, Any]:
    normalized = dict(info)

    normalized["address"] = clean_address(
        info.get("address")
    )

    normalized["certifications"] = (
        clean_certifications(
            info.get("certifications")
        )
    )

    normalized["projects"] = clean_projects(
        info.get("projects")
    )

    return normalized