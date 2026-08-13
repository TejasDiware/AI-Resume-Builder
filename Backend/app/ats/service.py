from app.ats.schemas import ATSScoreResponse
from app.ai.jd_schemas import JobDescriptionAnalysis


def normalize(value: str) -> str:
    return value.strip().lower()


def percentage(matched: int, total: int) -> float:
    if total == 0:
        return 100.0

    return round((matched / total) * 100, 2)


def calculate_ats_score(
    resume_id: int,
    job_description_id: int,
    profile_text: str,
    resume_skills: list[str],
    experience_text: str,
    project_text: str,
    education_text: str,
    analysis: JobDescriptionAnalysis,
) -> ATSScoreResponse:

    resume_skill_set = {
        normalize(skill)
        for skill in resume_skills
    }

    required_skill_set = {
        normalize(skill)
        for skill in analysis.required_skills
    }

    matched_skills = sorted(
        resume_skill_set & required_skill_set
    )

    missing_skills = sorted(
        required_skill_set - resume_skill_set
    )

    skills_score = percentage(
        len(matched_skills),
        len(required_skill_set),
    )

    searchable_resume = " ".join(
        [
            profile_text,
            experience_text,
            project_text,
            education_text,
            *resume_skills,
        ]
    ).lower()

    required_keywords = {
        normalize(keyword)
        for keyword in analysis.keywords
    }

    matched_keywords = sorted(
        keyword
        for keyword in required_keywords
        if keyword in searchable_resume
    )

    missing_keywords = sorted(
        required_keywords - set(matched_keywords)
    )

    keywords_score = percentage(
        len(matched_keywords),
        len(required_keywords),
    )

    completeness_items = [
        bool(profile_text.strip()),
        bool(resume_skills),
        bool(experience_text.strip()),
        bool(project_text.strip()),
        bool(education_text.strip()),
    ]

    completeness_score = round(
        sum(completeness_items)
        / len(completeness_items)
        * 100,
        2,
    )

    experience_score = (
        100.0 if experience_text.strip() else 0.0
    )

    education_score = (
        100.0 if education_text.strip() else 0.0
    )

    overall_score = round(
        skills_score * 0.40
        + keywords_score * 0.25
        + completeness_score * 0.15
        + experience_score * 0.10
        + education_score * 0.10,
        2,
    )

    recommendations = []

    if missing_skills:
        recommendations.append(
            "Add missing skills only when you genuinely have experience with them."
        )

    if missing_keywords:
        recommendations.append(
            "Naturally include relevant job-description keywords where they accurately describe your experience."
        )

    if completeness_score < 100:
        recommendations.append(
            "Complete the missing resume sections to improve overall resume completeness."
        )

    if experience_score < 100:
        recommendations.append(
            "Add relevant work experience or internship details."
        )

    if education_score < 100:
        recommendations.append(
            "Add your education details."
        )

    if not recommendations:
        recommendations.append(
            "Your resume has strong baseline alignment with this job description."
        )

    return ATSScoreResponse(
        resume_id=resume_id,
        job_description_id=job_description_id,
        overall_score=overall_score,
        skills_score=skills_score,
        keywords_score=keywords_score,
        completeness_score=completeness_score,
        experience_score=experience_score,
        education_score=education_score,
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        matched_keywords=matched_keywords,
        missing_keywords=missing_keywords,
        recommendations=recommendations,
    )