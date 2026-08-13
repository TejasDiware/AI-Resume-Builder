from app.quality.schemas import (
    ResumeQualityResponse,
    ResumeSectionScores,
)


def calculate_resume_quality(
    resume_id: int,
    summary: str,
    experience: str,
    skills: str,
    projects: str,
    education: str,
) -> ResumeQualityResponse:

    summary_score = 100.0 if summary.strip() else 0.0
    experience_score = 100.0 if experience.strip() else 0.0
    skills_score = 100.0 if skills.strip() else 0.0
    projects_score = 100.0 if projects.strip() else 0.0
    education_score = 100.0 if education.strip() else 0.0

    section_values = [
        summary_score,
        experience_score,
        skills_score,
        projects_score,
        education_score,
    ]

    completeness_score = round(
        sum(section_values) / len(section_values),
        2,
    )

    issues = []
    recommendations = []

    if not summary.strip():
        issues.append("Professional summary is missing.")
        recommendations.append(
            "Add a concise professional summary."
        )

    if not experience.strip():
        issues.append("Experience section is missing.")
        recommendations.append(
            "Add relevant work experience or internships."
        )

    if not skills.strip():
        issues.append("Skills section is missing.")
        recommendations.append(
            "Add your relevant technical and professional skills."
        )

    if not projects.strip():
        issues.append("Projects section is missing.")
        recommendations.append(
            "Add relevant projects with technologies actually used."
        )

    if not education.strip():
        issues.append("Education section is missing.")
        recommendations.append(
            "Add your education details."
        )

    # Initial deterministic content-quality heuristic.
    content_quality_score = round(
        (
            summary_score
            + experience_score
            + skills_score
            + projects_score
            + education_score
        ) / 5,
        2,
    )

    ats_readiness_score = round(
        (
            completeness_score * 0.6
            + content_quality_score * 0.4
        ),
        2,
    )

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
            "Your resume has a strong baseline structure. "
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