from app.quality.schemas import (
    ResumeQualityResponse,
    ResumeSectionScores,
)


def _count_content_items(
    text: str,
) -> int:
    """
    Count meaningful non-empty lines.

    The stored resume descriptions do not necessarily contain
    Markdown bullets because bullets are added during rendering.
    """
    return sum(
        1
        for line in text.splitlines()
        if line.strip()
    )


def _has_meaningful_content(
    text: str,
) -> bool:
    return bool(text and text.strip())


def calculate_resume_quality(
    resume_id: int,
    summary: str,
    experience: str,
    skills: str,
    projects: str,
    education: str,
) -> ResumeQualityResponse:

    issues: list[str] = []
    recommendations: list[str] = []

    # ---------------------------------------------------------
    # Summary
    # ---------------------------------------------------------
    summary_length = len(
        summary.strip()
    )

    if summary_length == 0:
        summary_score = 0.0
        issues.append(
            "Professional summary is missing."
        )
        recommendations.append(
            "Add a concise professional summary tailored "
            "to your target role."
        )

    elif summary_length < 80:
        summary_score = 60.0
        issues.append(
            "Professional summary is too short."
        )
        recommendations.append(
            "Expand the summary with your role, core "
            "technologies, and strengths."
        )

    elif summary_length > 600:
        summary_score = 75.0
        issues.append(
            "Professional summary is too long."
        )
        recommendations.append(
            "Keep the summary concise and focused "
            "on relevant strengths."
        )

    else:
        summary_score = 100.0

    # ---------------------------------------------------------
    # Experience
    # ---------------------------------------------------------
    experience_items = _count_content_items(
        experience
    )

    if not _has_meaningful_content(
        experience
    ):
        experience_score = 0.0

        issues.append(
            "Experience section is missing."
        )

        recommendations.append(
            "Add relevant work experience, internships, "
            "or practical experience."
        )

    elif experience_items == 1:
        experience_score = 75.0

        issues.append(
            "Experience section has limited detail."
        )

        recommendations.append(
            "Add concise responsibility and achievement "
            "details for each experience."
        )

    else:
        experience_score = 100.0

    # ---------------------------------------------------------
    # Skills
    # ---------------------------------------------------------
    skill_lines = [
        line.strip()
        for line in skills.splitlines()
        if line.strip()
    ]

    if not skill_lines:
        skills_score = 0.0

        issues.append(
            "Skills section is missing."
        )

        recommendations.append(
            "Add the technical and professional skills "
            "you genuinely possess."
        )

    elif len(skill_lines) < 3:
        skills_score = 70.0

        issues.append(
            "Skills section contains very few skills."
        )

        recommendations.append(
            "Add more relevant skills that accurately "
            "represent your experience."
        )

    else:
        skills_score = 100.0

    # ---------------------------------------------------------
    # Projects
    # ---------------------------------------------------------
    project_items = _count_content_items(
        projects
    )

    if not _has_meaningful_content(
        projects
    ):
        projects_score = 0.0

        issues.append(
            "Projects section is missing."
        )

        recommendations.append(
            "Add relevant projects with technologies "
            "and your contribution."
        )

    elif project_items == 1:
        projects_score = 75.0

        issues.append(
            "Projects section has limited detail."
        )

        recommendations.append(
            "Add concise technical contribution details "
            "for each project."
        )

    else:
        projects_score = 100.0

    # ---------------------------------------------------------
    # Education
    # ---------------------------------------------------------
    education_length = len(
        education.strip()
    )

    if education_length == 0:
        education_score = 0.0

        issues.append(
            "Education section is missing."
        )

        recommendations.append(
            "Add your degree, institution, and relevant "
            "education details."
        )

    elif education_length < 50:
        education_score = 75.0

        issues.append(
            "Education section contains limited information."
        )

        recommendations.append(
            "Include your degree, institution, field "
            "of study, and dates."
        )

    else:
        education_score = 100.0

    # ---------------------------------------------------------
    # Completeness
    # ---------------------------------------------------------
    completeness_score = round(
        (
            summary_score
            + experience_score
            + skills_score
            + projects_score
            + education_score
        ) / 5,
        2,
    )

    # ---------------------------------------------------------
    # Content quality
    # ---------------------------------------------------------
    content_quality_score = round(
        (
            summary_score * 0.20
            + experience_score * 0.25
            + skills_score * 0.15
            + projects_score * 0.25
            + education_score * 0.15
        ),
        2,
    )

    # ---------------------------------------------------------
    # ATS readiness
    # ---------------------------------------------------------
    ats_readiness_score = round(
        (
            completeness_score * 0.60
            + content_quality_score * 0.40
        ),
        2,
    )

    # ---------------------------------------------------------
    # Overall score
    # ---------------------------------------------------------
    overall_score = round(
        (
            completeness_score * 0.35
            + content_quality_score * 0.35
            + ats_readiness_score * 0.30
        ),
        2,
    )

    if not issues:
        recommendations.append(
            "Your resume has a strong structural foundation. "
            "Use the ATS optimizer for job-specific improvements."
        )

    return ResumeQualityResponse(
        resume_id=resume_id,
        overall_score=overall_score,
        completeness_score=completeness_score,
        content_quality_score=content_quality_score,
        ats_readiness_score=ats_readiness_score,
        sections=ResumeSectionScores(
            summary=summary_score,
            experience=experience_score,
            skills=skills_score,
            projects=projects_score,
            education=education_score,
        ),
        issues=issues,
        recommendations=recommendations,
    )


def text_length_score(
    text: str,
    minimum: int,
    maximum: int,
) -> float:
    length = len(
        text.strip()
    )

    if length == 0:
        return 0.0

    if minimum <= length <= maximum:
        return 100.0

    if length < minimum:
        return round(
            (length / minimum) * 100,
            2,
        )

    return round(
        max(
            0.0,
            100
            - (
                (length - maximum)
                / maximum
            ) * 100,
        ),
        2,
    )


def bullet_count(text: str) -> int:
    """
    Kept for backward compatibility.

    Stored descriptions may not contain literal bullets,
    because bullets are added by the PDF renderer.
    """
    return sum(
        1
        for line in text.splitlines()
        if line.strip().startswith("-")
    )