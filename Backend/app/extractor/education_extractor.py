import re
from pathlib import Path

EDUCATION_FILE = Path(__file__).parent.parent / "data" / "education.txt"

with open(EDUCATION_FILE, "r", encoding="utf-8") as file:
    DEGREES = [line.strip() for line in file if line.strip()]


def extract_education(text: str):

    education = {
        "degrees": [],
        "college": None,
        "graduation_year": None,
        "cgpa": None
    }

    # Normalize text (remove dots)
    normalized_text = text.replace(".", "")

    # Extract Degrees
    for degree in DEGREES:

        normalized_degree = degree.replace(".", "")

        pattern = r"\b" + re.escape(normalized_degree) + r"\b"

        if re.search(pattern, normalized_text, re.IGNORECASE):
            education["degrees"].append(degree)

    # Graduation Year
    years = re.findall(r"\b(20\d{2})\b", text)

    if years:
        education["graduation_year"] = max(years)

    # CGPA
    cgpa = re.search(
        r"(?:CGPA|GPA)\s*[:\-]?\s*([0-9]+(?:\.[0-9]+)?)",
        text,
        re.IGNORECASE
    )

    if cgpa:
        education["cgpa"] = cgpa.group(1)

    # College / Institute
    for line in text.split("\n"):

        lower = line.lower()

        if any(word in lower for word in [
            "college",
            "institute",
            "university",
            "school"
        ]):
            education["college"] = line.strip()
            break

    return education