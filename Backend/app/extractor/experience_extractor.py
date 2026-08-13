import re

HEADINGS = {
    "EDUCATION",
    "SKILLS",
    "PROJECTS",
    "CERTIFICATIONS",
    "ACHIEVEMENTS",
    "LANGUAGES",
    "HOBBIES",
    "PERSONAL PROFILE",
    "DECLARATION",
}

DURATION_PATTERN = re.compile(
    r"(January|February|March|April|May|June|July|August|September|October|November|December|"
    r"Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"
    r".*?(Present|Current|\d{4})",
    re.IGNORECASE,
)


def extract_experience(text: str):

    lines = [line.strip() for line in text.split("\n") if line.strip()]

    experiences = []

    in_experience = False
    current = None

    i = 0

    while i < len(lines):

        line = lines[i]

        # ------------------------------
        # Find Experience Section
        # ------------------------------

        if "PROFESSIONAL EXPERIENCE" in line.upper():
            in_experience = True
            i += 1
            continue

        if not in_experience:
            i += 1
            continue

        # Stop if another heading starts

        if line.upper() in HEADINGS:
            break

        # ------------------------------
        # Company Name
        # ------------------------------

        if (
            "," in line
            and "Duration" not in line
            and "Role" not in line
            and "Responsibilities" not in line
        ):

            if current:
                experiences.append(current)

            current = {
                "company": line,
                "duration": "",
                "role": "",
                "description": "",
            }

            i += 1
            continue

        # ------------------------------
        # Duration
        # ------------------------------

        if line.startswith("Duration"):

            if current:
                current["duration"] = (
                    line.replace("Duration", "").strip()
                )

            i += 1
            continue

        # ------------------------------
        # Role
        # ------------------------------

        if line.startswith("Role"):

            if current:
                current["role"] = (
                    line.replace("Role", "").strip()
                )

            i += 1
            continue

        # ------------------------------
        # Responsibilities
        # ------------------------------

        if current:

            if not line.startswith("Responsibilities"):
                current["description"] += line + " "

        i += 1

    if current:
        experiences.append(current)

    return experiences