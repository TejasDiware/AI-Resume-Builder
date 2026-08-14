from __future__ import annotations

import json
from typing import Any

from groq import Groq

from app.core.config import settings


PART2_SCHEMA: dict[str, Any] = {
    "type": "object",
    "additionalProperties": False,
    "properties": {
        "experience": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "properties": {
                    "company": {"type": "string"},
                    "job_title": {"type": "string"},
                    "location": {"type": "string"},
                    "employment_type": {"type": "string"},
                    "start_date": {"type": "string"},
                    "end_date": {"type": "string"},
                    "is_current": {"type": "boolean"},
                    "description": {"type": "string"},
                },
                "required": [
                    "company",
                    "job_title",
                    "location",
                    "employment_type",
                    "start_date",
                    "end_date",
                    "is_current",
                    "description",
                ],
            },
        },
        "projects": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "properties": {
                    "title": {"type": "string"},
                    "role": {"type": "string"},
                    "description": {"type": "string"},
                    "technologies": {
                        "type": "array",
                        "items": {"type": "string"},
                    },
                    "project_url": {"type": "string"},
                    "start_date": {"type": "string"},
                    "end_date": {"type": "string"},
                },
                "required": [
                    "title",
                    "role",
                    "description",
                    "technologies",
                    "project_url",
                    "start_date",
                    "end_date",
                ],
            },
        },
        "certifications": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "properties": {
                    "name": {"type": "string"},
                    "issuing_organization": {"type": "string"},
                    "issue_date": {"type": "string"},
                    "expiration_date": {"type": "string"},
                    "credential_id": {"type": "string"},
                    "credential_url": {"type": "string"},
                },
                "required": [
                    "name",
                    "issuing_organization",
                    "issue_date",
                    "expiration_date",
                    "credential_id",
                    "credential_url",
                ],
            },
        },
        "languages": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "properties": {
                    "name": {"type": "string"},
                    "proficiency": {"type": "string"},
                },
                "required": [
                    "name",
                    "proficiency",
                ],
            },
        },
        "achievements": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "properties": {
                    "title": {"type": "string"},
                    "description": {"type": "string"},
                    "organization": {"type": "string"},
                    "year": {"type": "integer"},
                },
                "required": [
                    "title",
                    "description",
                    "organization",
                    "year",
                ],
            },
        },
    },
    "required": [
        "experience",
        "projects",
        "certifications",
        "languages",
        "achievements",
    ],
}


SYSTEM_PROMPT = """
You are a high-accuracy resume extraction engine.

Extract ONLY these sections:
1. experience
2. projects
3. certifications
4. languages
5. achievements

Rules:

EXPERIENCE
- Treat INTERNSHIP, INTERNSHIPS, EXPERIENCE, WORK EXPERIENCE,
  PROFESSIONAL EXPERIENCE, EMPLOYMENT and similar headings as experience.
- Extract EVERY separate internship/job.
- Preserve company, role, location, dates and bullet descriptions.
- If the resume says Intern, preserve "Intern" as the job title or
  employment information.
- Do not confuse projects with experience.

PROJECTS
- Extract EVERY separate project.
- Never merge two projects into one.
- A new project title starts a new project.
- Project technologies should come from the project heading or
  clearly associated technology list.
- Do not include later sections inside a project's description.
- Never infer or assume a project role.
- Only populate role when the resume explicitly states it.
- If the project role is not explicitly stated, return "".

CERTIFICATIONS
- Extract only actual certification records.
- A certification heading marks the beginning of certifications.
- ADDITIONAL, INTERESTS, HOBBIES and EXTRACTED LINKS are NOT
  certifications.

LANGUAGES
- Extract only spoken/written languages explicitly listed as languages.
- Programming languages such as Java or Python belong to skills,
  not spoken-language records.

ACHIEVEMENTS
- Extract only explicit achievements, awards, honors, or similar
  accomplishments.
- Do not convert ordinary project bullets into achievements.

MISSING SECTIONS
- If a section is absent, return [].

OUTPUT
- Return every required top-level field.
- Never omit a field.
- Return "" for unavailable strings.
- Return 0 for unavailable numeric fields.
- Return false for unavailable boolean fields.
- Return only JSON.
"""

def parse_part2(text: str) -> dict[str, Any]:
    if not text or not text.strip():
        raise ValueError("Resume text is empty.")

    client = Groq(
        api_key=settings.groq_api_key
    )

    response = client.chat.completions.create(
        model=settings.groq_model,
        reasoning_effort="low",
        temperature=0,
        messages=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT,
            },
            {
                "role": "user",
                "content": (
                    "Extract only experience, projects, "
                    "certifications, languages, and achievements "
                    "from this resume.\n\n"
                    f"{text}"
                ),
            },
        ],
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "resume_part2",
                "strict": True,
                "schema": PART2_SCHEMA,
            },
        },
    )

    content = response.choices[0].message.content

    if not content:
        raise ValueError(
            "Groq part 2 returned empty output."
        )

    return json.loads(content)