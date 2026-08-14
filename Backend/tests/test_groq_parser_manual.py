from pathlib import Path
from pprint import pprint

from app.parser.groq_resume_parser import parse_resume_with_groq


def main():
    fixture = Path(
        "tests/fixtures/tejas_resume.txt"
    )

    text = fixture.read_text(
        encoding="utf-8"
    )

    result = parse_resume_with_groq(text)

    print("\n=== CONTACT ===")
    pprint(result.contact.model_dump())

    print("\n=== SKILLS ===")
    pprint(result.skills)

    print("\n=== EDUCATION ===")
    for item in result.education:
        pprint(item.model_dump())

    print("\n=== EXPERIENCE ===")
    for item in result.experience:
        pprint(item.model_dump())

    print("\n=== PROJECTS ===")
    for item in result.projects:
        pprint(item.model_dump())

    print("\n=== CERTIFICATIONS ===")
    for item in result.certifications:
        pprint(item.model_dump())

    print("\n=== LANGUAGES ===")
    pprint(result.languages)

    print("\n=== ACHIEVEMENTS ===")
    pprint(result.achievements)


if __name__ == "__main__":
    main()