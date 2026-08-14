from __future__ import annotations

from app.parser.groq_parser_part1 import parse_part1
from app.parser.groq_parser_part2 import parse_part2
from app.parser.normalizer import normalize_skills
from app.parser.schemas import ParsedResume


def parse_resume_with_groq(
    text: str,
) -> ParsedResume:
    if not text or not text.strip():
        raise ValueError("Resume text is empty.")

    # Both AI calls happen before the database is changed.
    part1 = parse_part1(text)
    part2 = parse_part2(text)

    merged = {
        **part1,
        **part2,
    }

    merged["skills"] = normalize_skills(
        merged.get("skills", [])
    )

    try:
        return ParsedResume.model_validate(merged)
    except Exception as exc:
        raise ValueError(
            f"Invalid structured resume data: {exc}"
        ) from exc