from __future__ import annotations

import json
from typing import Any

from groq import Groq

from app.core.config import settings
from app.parser.schemas import (
    ParsedContact,
    ParsedEducation,
)


PART1_SCHEMA: dict[str, Any] = {
    "type": "object",
    "additionalProperties": False,
    "properties": {
        "contact": {
            "type": "object",
            "additionalProperties": False,
            "properties": {
                "name": {"type": "string"},
                "email": {"type": "string"},
                "phone": {"type": "string"},
                "location": {"type": "string"},
                "linkedin": {"type": "string"},
                "github": {"type": "string"},
                "portfolio": {"type": "string"},
            },
            "required": [
                "name",
                "email",
                "phone",
                "location",
                "linkedin",
                "github",
                "portfolio",
            ],
        },
        "summary": {"type": "string"},
        "skills": {
            "type": "array",
            "items": {"type": "string"},
        },
        "education": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "properties": {
                    "institution": {"type": "string"},
                    "degree": {"type": "string"},
                    "field_of_study": {"type": "string"},
                    "start_year": {"type": "integer"},
                    "end_year": {"type": "integer"},
                    "cgpa": {"type": "string"},
                    "percentage": {"type": "string"},
                },
                "required": [
                    "institution",
                    "degree",
                    "field_of_study",
                    "start_year",
                    "end_year",
                    "cgpa",
                    "percentage",
                ],
            },
        },
    },
    "required": [
        "contact",
        "summary",
        "skills",
        "education",
    ],
}


def parse_part1(text: str) -> dict[str, Any]:

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
                "content": """
Extract only:
- contact
- summary
- skills
- education

Do not invent information.

For missing strings return "".
For missing arrays return [].
For missing numeric values return 0.

- Preserve institution names as completely as they appear in the resume.
- Do not remove location/city information from institution names.

Extract every education record separately.
Extract every skill individually.

Return only JSON.
""",
            },
            {
                "role": "user",
                "content": text,
            },
        ],
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "resume_part1",
                "strict": True,
                "schema": PART1_SCHEMA,
            },
        },
    )

    content = response.choices[0].message.content

    if not content:
        raise ValueError("Groq part 1 returned empty output.")

    return json.loads(content)