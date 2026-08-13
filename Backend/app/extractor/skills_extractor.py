from pathlib import Path

# Locate skills.txt regardless of OS
SKILLS_FILE = Path(__file__).parent.parent / "data" / "skills.txt"

with open(SKILLS_FILE, "r", encoding="utf-8") as file:
    SKILLS = {line.strip().lower() for line in file if line.strip()}


def extract_skills(text: str):
    """
    Extract matching skills from resume text.
    """

    text = text.lower()

    detected = []

    for skill in SKILLS:
        if skill in text:
            detected.append(skill.title())

    return sorted(detected)