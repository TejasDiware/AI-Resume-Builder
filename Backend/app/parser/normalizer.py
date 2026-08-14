from __future__ import annotations

import re
from typing import Iterable


def normalize_skills(
    skills: Iterable[str],
) -> list[str]:
    result: list[str] = []
    seen: set[str] = set()

    def add_skill(value: str) -> None:
        value = value.strip()

        if not value:
            return

        normalized = {
            "github": "GitHub",
            "javascript": "JavaScript",
            "mysql": "MySQL",
            "postgresql": "PostgreSQL",
            "sql": "SQL",
            "maven": "Maven",
            "gradle": "Gradle",
            "junit": "JUnit",
            "mockito": "Mockito",
            "docker": "Docker",
            "ci/cd": "CI/CD",
        }.get(
            value.lower(),
            value,
        )

        key = normalized.lower()

        if key not in seen:
            seen.add(key)
            result.append(normalized)

    for raw_skill in skills:
        skill = raw_skill.strip()

        if not skill:
            continue

        lower = skill.lower()

        # Basic knowledge of Docker and CI/CD
        if "docker" in lower and "ci/cd" in lower:
            add_skill("Docker")
            add_skill("CI/CD")
            continue

        # SQL (PostgreSQL/MySQL)
        match = re.fullmatch(
            r"(.+?)\s*\(([^)]+)\)",
            skill,
        )

        if match:
            base = match.group(1).strip()
            inside = match.group(2).strip()

            add_skill(base)

            for part in inside.split("/"):
                add_skill(part)

            continue

        # JUnit/Mockito, Maven/Gradle, etc.
        if "/" in skill:
            parts = [
                part.strip()
                for part in skill.split("/")
            ]

            if all(parts):
                for part in parts:
                    add_skill(part)
                continue

        add_skill(skill)

    return result