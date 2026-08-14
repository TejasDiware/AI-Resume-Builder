from pathlib import Path

from app.parser.groq_resume_parser import parse_resume_with_groq


FIXTURE = Path(
    "tests/fixtures/tejas_resume.txt"
)


def test_groq_resume_parser():
    text = FIXTURE.read_text(
        encoding="utf-8"
    )

    result = parse_resume_with_groq(text)

    # ---------------------------------------------------------
    # Contact
    # ---------------------------------------------------------

    assert result.contact.name == "TEJAS DIWARE"

    assert result.contact.email == (
        "tejasdiware1101@gmail.com"
    )

    assert result.contact.phone == (
        "+91-9545170847"
    )

    assert result.contact.location == (
        "Pune, Maharashtra"
    )

    # ---------------------------------------------------------
    # Expected skills
    # ---------------------------------------------------------

    expected_skills = {
        "Java 17+",
        "Spring Boot",
        "Spring MVC",
        "Spring Data JPA",
        "REST APIs",
        "JSON",
        "DSA",
        "HTML",
        "CSS",
        "JavaScript",
        "Swing",
        "Docker",
        "CI/CD",
        "Git",
        "GitHub",
        "JUnit",
        "Mockito",
        "Maven",
        "Gradle",
        "SQL",
        "PostgreSQL",
        "MySQL",
    }

    # ---------------------------------------------------------
    # Skills
    # ---------------------------------------------------------

    assert len(result.skills) == len(
        expected_skills
    )

    assert set(result.skills) == expected_skills

    # ---------------------------------------------------------
    # Education
    # ---------------------------------------------------------

    assert len(result.education) == 3

    assert (
        result.education[0].institution
        == "AISSMS IOIT"
    )

    assert (
        result.education[1].institution
        == "Shri Samarth Junior College, Akola"
    )

    assert (
        result.education[2].institution
        == "Jubilee English High School, Akola"
    )

    # ---------------------------------------------------------
    # Experience
    # ---------------------------------------------------------

    assert len(result.experience) == 2

    assert (
        result.experience[0].company
        == "WebCryptTechnology"
    )

    assert (
        result.experience[1].company
        == "Maharashtra State Commission for Backward Classes"
    )

    # ---------------------------------------------------------
    # Projects
    # ---------------------------------------------------------

    assert len(result.projects) == 3

    assert [
        project.title
        for project in result.projects
    ] == [
        "Chatting Application",
        "SmartBuy – Fashion-Focused Platform",
        "Real Time Weapon Detection",
    ]

    # Do not accept an inferred project role.
    assert all(
        project.role == ""
        for project in result.projects
    )

    # ---------------------------------------------------------
    # Certifications
    # ---------------------------------------------------------

    assert len(result.certifications) == 1

    assert (
        result.certifications[0].name
        == "Java Completion Certificate"
    )

    assert (
        result.certifications[0].issuing_organization
        == "30Dayscode"
    )

    # ---------------------------------------------------------
    # Languages / Achievements
    # ---------------------------------------------------------

    assert len(result.languages) == 0

    assert len(result.achievements) == 0