import re

TECH_KEYWORDS = {
    "python": "Python",
    "java": "Java",
    "spring boot": "Spring Boot",
    "fastapi": "FastAPI",
    "django": "Django",
    "flask": "Flask",
    "opencv": "OpenCV",
    "yolo": "YOLO",
    "computer vision": "Computer Vision",
    "deep learning": "Deep Learning",
    "machine learning": "Machine Learning",
    "tensorflow": "TensorFlow",
    "pytorch": "PyTorch",
    "html": "HTML",
    "css": "CSS",
    "javascript": "JavaScript",
    "js": "JavaScript",
    "react": "React",
    "node": "Node.js",
    "mysql": "MySQL",
    "postgresql": "PostgreSQL",
    "sql": "SQL",
    "mongodb": "MongoDB",
    "git": "Git",
    "docker": "Docker",
}


def looks_like_project_name(line: str) -> bool:
    """
    Returns True if the line is likely to be a project title.
    """

    line = line.strip()

    if not line:
        return False

    # Ignore description bullets
    if line.startswith("•"):
        return False

    # Ignore long sentences
    if len(line.split()) > 8:
        return False

    lower = line.lower()

    # These words indicate this is part of a description,
    # not a project title.
    invalid_starts = (
        "developed",
        "designed",
        "implemented",
        "created",
        "built",
        "programming",
        "interface",
        "using",
        "focused",
        "integrated",
    )

    if lower.startswith(invalid_starts):
        return False

    return True


def is_technology_line(line: str) -> bool:
    """
    Returns True if the line looks like a technology list.
    """

    line = line.strip()

    if not line:
        return False

    if line.startswith("•"):
        return False

    lower = line.lower()

    description_words = [
        "developed",
        "designed",
        "implemented",
        "created",
        "built",
        "using",
        "integrated",
        "focused",
    ]

    if any(word in lower for word in description_words):
        return False

    # Technology lines are usually short
    if len(line.split()) > 8:
        return False

    return "," in line

def extract_technologies_from_description(description: str):
    """
    Extract technologies mentioned in the project description.
    """

    found = []

    text = description.lower()

    for keyword, tech_name in TECH_KEYWORDS.items():
        if keyword in text:
            found.append(tech_name)

    return sorted(list(set(found)))


def extract_projects(text: str):

    projects = []

    match = re.search(
        r"PROJECTS(.*?)(CERTIFICATIONS|ACHIEVEMENTS|LANGUAGES|HOBBIES|$)",
        text,
        re.IGNORECASE | re.DOTALL,
    )

    if not match:
        return projects

    section = match.group(1)

    lines = [
        line.strip()
        for line in section.split("\n")
        if line.strip()
    ]

    i = 0

    while i < len(lines):

        # Skip anything that is not a project title
        if not looks_like_project_name(lines[i]):
            i += 1
            continue

        project = {
            "name": lines[i],
            "technologies": [],
            "description": "",
        }

        i += 1

        # Read technologies (if present)
        if i < len(lines) and is_technology_line(lines[i]):
            project["technologies"] = [
                tech.strip()
                for tech in lines[i].split(",")
                if tech.strip()
            ]
            i += 1

        description = []

        while i < len(lines):

            # Detect start of next project
            if looks_like_project_name(lines[i]):

                # Next project has technology line
                if (
                    i + 1 < len(lines)
                    and is_technology_line(lines[i + 1])
                ):
                    break

                # Next project starts directly with description
                if i + 1 < len(lines):

                    next_line = lines[i + 1].lower()

                    if next_line.startswith(
                        (
                            "developed",
                            "designed",
                            "implemented",
                            "created",
                            "built",
                        )
                    ):
                        break

            description.append(lines[i])

            i += 1

        project["description"] = (
         " ".join(description)
         .replace("•", "")
         .replace("  ", " ")
         .strip()
       )
        # If no technologies were found from a technology line,
# infer them from the description.
        if not project["technologies"]:
            project["technologies"] = extract_technologies_from_description(
             project["description"]
    )

        projects.append(project)

    return projects