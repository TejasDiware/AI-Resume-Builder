import re


def extract_certifications(text: str):

    certifications = []

    # Find CERTIFICATIONS section
    match = re.search(
        r"CERTIFICATIONS?(.*?)(PROJECTS|ACHIEVEMENTS|LANGUAGES|HOBBIES|EDUCATION|$)",
        text,
        re.IGNORECASE | re.DOTALL,
    )

    if match:

        section = match.group(1)

        lines = [
            line.strip()
            for line in section.split("\n")
            if line.strip()
        ]

        certifications.extend(lines)

    return certifications