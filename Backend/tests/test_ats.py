import json

from sqlalchemy import select

from app.api.routes.ats import AIService as RouteAIService
from app.models.job_description import JobDescription
from app.models.job_description_analysis import (
    JobDescriptionAnalysis,
)

from tests.test_resume import (
    auth_headers,
    create_resume,
    register_and_login,
)


def create_job_description(
    db_session,
    user_id,
    title="Java Backend Developer",
):
    job_description = JobDescription(
        user_id=user_id,
        title=title,
        company="ABC Technologies",
        description=(
            "We are looking for a Java Backend Developer with "
            "experience in Java, Spring Boot, REST APIs, SQL, "
            "PostgreSQL and Git."
        ),
    )

    db_session.add(job_description)
    db_session.commit()
    db_session.refresh(job_description)

    analysis = JobDescriptionAnalysis(
        job_description_id=job_description.id,
        job_title="Java Backend Developer",
        required_skills=json.dumps(
            [
                "Java",
                "Spring Boot",
                "REST APIs",
                "SQL",
                "PostgreSQL",
                "Git",
            ]
        ),
        preferred_skills=json.dumps(
            [
                "Docker",
                "AWS",
            ]
        ),
        experience_requirements=json.dumps(
            [
                "1+ years backend development",
            ]
        ),
        education_requirements=json.dumps(
            [
                "Bachelor's degree",
            ]
        ),
        keywords=json.dumps(
            [
                "Java",
                "Spring Boot",
                "REST APIs",
                "SQL",
                "PostgreSQL",
                "Git",
            ]
        ),
    )

    db_session.add(analysis)
    db_session.commit()
    db_session.refresh(analysis)

    return job_description


# ============================================================
# ATS SCORE
# ============================================================


def test_ats_score_requires_authentication(client, db_session):
    response = client.post(
        "/api/v1/ats/score/999999/999999",
    )

    assert response.status_code == 401


def test_ats_score_requires_existing_resume(
    client,
    db_session,
):
    token = register_and_login(
        client,
        "ats-missing-resume@example.com",
    )

    response = client.post(
        "/api/v1/ats/score/999999/999999",
        headers=auth_headers(token),
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Resume not found"


def test_ats_score_requires_existing_job_description(
    client,
    db_session,
):
    token = register_and_login(
        client,
        "ats-missing-jd@example.com",
    )

    resume = create_resume(
        client,
        token,
        "ATS Resume",
    )

    response = client.post(
        f"/api/v1/ats/score/{resume['id']}/999999",
        headers=auth_headers(token),
    )

    assert response.status_code == 404
    assert response.json()["detail"] == (
        "Job description not found"
    )


def test_ats_score_requires_job_description_analysis(
    client,
    db_session,
):
    token = register_and_login(
        client,
        "ats-no-analysis@example.com",
    )

    resume = create_resume(
        client,
        token,
        "ATS Resume",
    )

    # Get current user ID from the test database.
    from app.models.user import User

    user = db_session.scalar(
        select(User).where(
            User.email == "ats-no-analysis@example.com"
        )
    )

    job_description = JobDescription(
        user_id=user.id,
        title="Java Developer",
        company="ABC",
        description="Java Spring Boot developer.",
    )

    db_session.add(job_description)
    db_session.commit()
    db_session.refresh(job_description)

    response = client.post(
        f"/api/v1/ats/score/"
        f"{resume['id']}/"
        f"{job_description.id}",
        headers=auth_headers(token),
    )

    assert response.status_code == 404
    assert response.json()["detail"] == (
        "Job description has not been analyzed yet"
    )


def test_ats_score_returns_score(
    client,
    db_session,
):
    token = register_and_login(
        client,
        "ats-score@example.com",
    )

    resume = create_resume(
        client,
        token,
        "ATS Score Resume",
    )

    from app.models.user import User

    user = db_session.scalar(
        select(User).where(
            User.email == "ats-score@example.com"
        )
    )

    job_description = create_job_description(
        db_session,
        user.id,
    )

    response = client.post(
        f"/api/v1/ats/score/"
        f"{resume['id']}/"
        f"{job_description.id}",
        headers=auth_headers(token),
    )

    assert response.status_code == 200

    data = response.json()

    assert data["resume_id"] == resume["id"]
    assert data["job_description_id"] == job_description.id

    assert "overall_score" in data
    assert "skills_score" in data
    assert "keywords_score" in data
    assert "completeness_score" in data
    assert "experience_score" in data
    assert "education_score" in data

    assert isinstance(
        data["overall_score"],
        (int, float),
    )

    assert 0 <= data["overall_score"] <= 100


# ============================================================
# ATS OPTIMIZATION
# ============================================================


class FakeATSService:
    def optimize_resume_for_job(
        self,
        **kwargs,
    ):
        return {
            "resume_id": kwargs["resume_id"],
            "job_description_id": kwargs[
                "job_description_id"
            ],
            "current_score": kwargs["score"],
            "priority": [
                "Spring Boot",
                "REST APIs",
            ],
            "recommendations": [
                "Highlight Spring Boot experience.",
                "Include REST API achievements.",
            ],
            "changes": [
                {
                    "id": "ats_summary_1",
                    "action": "update",
                    "section": "summary",
                    "target_id": None,
                    "old_content": (
                        "Java developer."
                    ),
                    "new_content": (
                        "Java Backend Developer with "
                        "Spring Boot and REST API experience."
                    ),
                    "data": None,
                    "reason": (
                        "Better alignment with the job description."
                    ),
                },
            ],
        }

    def optimize_section(
        self,
        **kwargs,
    ):
        return {
            "resume_id": kwargs["resume_id"],
            "section": kwargs["section"],
            "original_content": kwargs[
                "original_content"
            ],
            "optimized_content": (
                "Java Backend Developer with "
                "strong Spring Boot experience."
            ),
            "changes": [
                {
                    "id": "ats-section-summary-1",
                    "action": "update",
                    "section": "summary",
                    "target_id": None,
                    "old_content": kwargs[
                        "original_content"
                    ],
                    "new_content": (
                        "Java Backend Developer with "
                        "strong Spring Boot experience."
                    ),
                    "data": None,
                    "reason": (
                        "Improved ATS alignment."
                    ),
                },
            ],
        }


def test_ats_optimize_returns_reviewable_changes(
    client,
    db_session,
    monkeypatch,
):
    token = register_and_login(
        client,
        "ats-optimize@example.com",
    )

    resume = create_resume(
        client,
        token,
        "ATS Optimization Resume",
    )

    from app.models.user import User

    user = db_session.scalar(
        select(User).where(
            User.email == "ats-optimize@example.com"
        )
    )

    job_description = create_job_description(
        db_session,
        user.id,
    )

    monkeypatch.setattr(
        "app.api.routes.ats.AIService",
        lambda provider: FakeATSService(),
    )

    response = client.post(
        f"/api/v1/ats/optimize/"
        f"{resume['id']}/"
        f"{job_description.id}",
        headers=auth_headers(token),
    )

    assert response.status_code == 200

    data = response.json()

    assert data["resume_id"] == resume["id"]
    assert data["job_description_id"] == (
        job_description.id
    )

    assert "current_score" in data
    assert "priority" in data
    assert "recommendations" in data
    assert "changes" in data

    assert isinstance(data["changes"], list)
    assert len(data["changes"]) >= 1

    change = data["changes"][0]

    assert change["action"] == "update"
    assert change["section"] == "summary"
    assert change["target_id"] is None
    assert change["old_content"]
    assert change["new_content"]
    assert change["reason"]


def test_ats_optimize_requires_existing_resume(
    client,
    db_session,
):
    token = register_and_login(
        client,
        "ats-optimize-missing-resume@example.com",
    )

    response = client.post(
        "/api/v1/ats/optimize/999999/999999",
        headers=auth_headers(token),
    )

    assert response.status_code == 404
    assert response.json()["detail"] == (
        "Resume not found"
    )


def test_ats_optimize_requires_existing_job_description(
    client,
    db_session,
):
    token = register_and_login(
        client,
        "ats-optimize-missing-jd@example.com",
    )

    resume = create_resume(
        client,
        token,
        "ATS Resume",
    )

    response = client.post(
        f"/api/v1/ats/optimize/"
        f"{resume['id']}/999999",
        headers=auth_headers(token),
    )

    assert response.status_code == 404
    assert response.json()["detail"] == (
        "Job description not found"
    )


def test_ats_optimize_requires_analysis(
    client,
    db_session,
):
    token = register_and_login(
        client,
        "ats-optimize-no-analysis@example.com",
    )

    resume = create_resume(
        client,
        token,
        "ATS Resume",
    )

    from app.models.user import User

    user = db_session.scalar(
        select(User).where(
            User.email
            == "ats-optimize-no-analysis@example.com"
        )
    )

    job_description = JobDescription(
        user_id=user.id,
        title="Java Developer",
        company="ABC",
        description="Java Spring Boot developer.",
    )

    db_session.add(job_description)
    db_session.commit()
    db_session.refresh(job_description)

    response = client.post(
        f"/api/v1/ats/optimize/"
        f"{resume['id']}/"
        f"{job_description.id}",
        headers=auth_headers(token),
    )

    assert response.status_code == 404
    assert response.json()["detail"] == (
        "Job description has not been analyzed yet"
    )


# ============================================================
# ATS SECTION OPTIMIZATION
# ============================================================


def test_ats_section_optimization_returns_changes(
    client,
    db_session,
    monkeypatch,
):
    token = register_and_login(
        client,
        "ats-section@example.com",
    )

    resume = create_resume(
        client,
        token,
        "ATS Section Resume",
    )

    from app.models.user import User

    user = db_session.scalar(
        select(User).where(
            User.email == "ats-section@example.com"
        )
    )

    job_description = create_job_description(
        db_session,
        user.id,
    )

    monkeypatch.setattr(
        "app.api.routes.ats.AIService",
        lambda provider: FakeATSService(),
    )

    response = client.post(
        f"/api/v1/ats/optimize-section/"
        f"{resume['id']}/"
        f"{job_description.id}",
        headers=auth_headers(token),
        json={
            "section": "summary",
            "instruction": (
                "Make the summary more ATS friendly."
            ),
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["resume_id"] == resume["id"]
    assert data["section"] == "summary"

    assert data["original_content"] is not None
    assert data["optimized_content"]

    assert isinstance(
        data["changes"],
        list,
    )

    assert len(data["changes"]) >= 1

    change = data["changes"][0]

    assert change["action"] == "update"
    assert change["section"] == "summary"
    assert change["target_id"] is None
    assert change["new_content"]


def test_ats_section_optimization_requires_authentication(
    client,
):
    response = client.post(
        "/api/v1/ats/optimize-section/999999/999999",
        json={
            "section": "summary",
        },
    )

    assert response.status_code == 401


def test_ats_section_optimization_requires_existing_resume(
    client,
):
    token = register_and_login(
        client,
        "ats-section-missing-resume@example.com",
    )

    response = client.post(
        "/api/v1/ats/optimize-section/"
        "999999/999999",
        headers=auth_headers(token),
        json={
            "section": "summary",
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == (
        "Resume not found"
    )


def test_ats_section_optimization_requires_existing_job_description(
    client,
    db_session,
):
    token = register_and_login(
        client,
        "ats-section-missing-jd@example.com",
    )

    resume = create_resume(
        client,
        token,
        "ATS Resume",
    )

    response = client.post(
        f"/api/v1/ats/optimize-section/"
        f"{resume['id']}/999999",
        headers=auth_headers(token),
        json={
            "section": "summary",
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == (
        "Job description not found"
    )


def test_ats_section_optimization_rejects_invalid_section(
    client,
    db_session,
):
    token = register_and_login(
        client,
        "ats-invalid-section@example.com",
    )

    resume = create_resume(
        client,
        token,
        "ATS Resume",
    )

    from app.models.user import User

    user = db_session.scalar(
        select(User).where(
            User.email == "ats-invalid-section@example.com"
        )
    )

    job_description = create_job_description(
        db_session,
        user.id,
    )

    response = client.post(
        f"/api/v1/ats/optimize-section/"
        f"{resume['id']}/"
        f"{job_description.id}",
        headers=auth_headers(token),
        json={
            "section": "invalid-section",
        },
    )

    assert response.status_code == 400

    assert response.json()["detail"] == (
        "Unsupported section. "
        "Use summary, experience, projects, or skills."
    )


def test_ats_section_optimization_requires_analysis(
    client,
    db_session,
):
    token = register_and_login(
        client,
        "ats-section-no-analysis@example.com",
    )

    resume = create_resume(
        client,
        token,
        "ATS Resume",
    )

    from app.models.user import User

    user = db_session.scalar(
        select(User).where(
            User.email
            == "ats-section-no-analysis@example.com"
        )
    )

    job_description = JobDescription(
        user_id=user.id,
        title="Java Developer",
        company="ABC",
        description="Java Spring Boot developer.",
    )

    db_session.add(job_description)
    db_session.commit()
    db_session.refresh(job_description)

    response = client.post(
        f"/api/v1/ats/optimize-section/"
        f"{resume['id']}/"
        f"{job_description.id}",
        headers=auth_headers(token),
        json={
            "section": "summary",
        },
    )

    assert response.status_code == 404

    assert response.json()["detail"] == (
        "Job description has not been analyzed yet"
    )