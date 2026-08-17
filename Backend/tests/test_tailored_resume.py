from types import SimpleNamespace

from app.ai.schemas import (
    AIChange,
    TailoredResumeContent,
    TailoredResumeResponse,
)
from app.api.routes.ai import get_ai_service
from app.main import app
from app.models.experience import Experience

from tests.test_resume import (
    auth_headers,
    register_and_login,
    create_resume,
)


class FakeTailoredResumeAIService:
    def generate_tailored_resume(
        self,
        resume_id: int,
        job_description_id: int,
        generation_context: dict,
        job_description: str,
        instruction: str | None,
    ):
        experience = generation_context.get(
            "experience",
            [],
        )

        changes = []

        # ---------------------------------------------------------
        # Summary change
        # ---------------------------------------------------------

        current_summary = (
            generation_context.get(
                "profile",
                {},
            ).get(
                "summary",
                "",
            )
            or ""
        )

        new_summary = (
            "Machine Learning Engineer with experience "
            "in Python, NLP, and sentiment analysis, "
            "developing practical machine learning solutions."
        )

        changes.append(
            AIChange(
                id=(
                    f"tailored_summary_"
                    f"{resume_id}_"
                    f"{job_description_id}"
                ),
                action="update",
                section="summary",
                target_id=None,
                old_content=current_summary,
                new_content=new_summary,
                reason=(
                    "Tailored the resume summary to better "
                    "match the selected job description."
                ),
            )
        )

        # ---------------------------------------------------------
        # Experience change
        # ---------------------------------------------------------

        if experience:
            experience_id = experience[0]["id"]

            old_description = (
                experience[0].get(
                    "description",
                    "",
                )
                or ""
            )

            new_description = (
                "Developed machine learning solutions using "
                "Python and Scikit-learn. Applied NLP and "
                "sentiment analysis techniques to process "
                "and analyze text data."
            )

            changes.append(
                AIChange(
                    id=(
                        f"tailored_experience_"
                        f"{experience_id}_"
                        f"{job_description_id}"
                    ),
                    action="update",
                    section="experience",
                    target_id=experience_id,
                    old_content=old_description,
                    new_content=new_description,
                    reason=(
                        "Tailored the service history to emphasize "
                        "experience relevant to the selected job."
                    ),
                )
            )

        # ---------------------------------------------------------
        # Return tailored resume
        # ---------------------------------------------------------

        return TailoredResumeResponse(
            resume_id=resume_id,
            job_description_id=job_description_id,
            content=(
                "MACHINE LEARNING ENGINEER\n\n"
                f"SUMMARY\n{new_summary}\n\n"
                "EXPERIENCE\n"
                "Developed machine learning solutions using "
                "Python and Scikit-learn."
            ),
            structured=TailoredResumeContent(
                summary=new_summary,
                skills=generation_context.get(
                    "skills",
                    [],
                ),
                experience=[
                    (
                        "Developed machine learning solutions "
                        "using Python and Scikit-learn."
                    )
                ],
                projects=[],
            ),
            changes=changes,
        )


def test_generate_tailored_resume_returns_changes(
    client,
    db_session,
):
    app.dependency_overrides[get_ai_service] = (
        lambda: FakeTailoredResumeAIService()
    )

    try:
        # ---------------------------------------------------------
        # Create user
        # ---------------------------------------------------------

        token = register_and_login(
            client,
            "tailored-generation@example.com",
        )

        # ---------------------------------------------------------
        # Create resume
        # ---------------------------------------------------------

        resume = create_resume(
            client,
            token,
            "Tailored AI Resume",
        )

        assert resume["id"]

        # ---------------------------------------------------------
        # Create candidate profile
        # ---------------------------------------------------------

        profile_response = client.post(
            "/api/v1/profile",
            headers=auth_headers(token),
            json={
                "first_name": "Tejas",
                "last_name": "Diware",
                "phone": "+919876543210",
                "professional_title": (
                    "Machine Learning Engineer"
                ),
                "summary": (
                    "Machine Learning Engineer with "
                    "Python experience."
                ),
                "location": "Pune, India",
                "linkedin_url": None,
                "github_url": None,
                "portfolio_url": None,
            },
        )

        assert profile_response.status_code == 201

        # ---------------------------------------------------------
        # Create existing experience
        # ---------------------------------------------------------

        experience = Experience(
            resume_id=resume["id"],
            company="ABC Technologies",
            job_title="Machine Learning Engineer",
            description=(
                "Worked on machine learning projects "
                "using Python."
            ),
            location="Pune",
            employment_type="Full-time",
            is_current=False,
        )

        db_session.add(experience)
        db_session.commit()
        db_session.refresh(experience)

        # ---------------------------------------------------------
        # Create Job Description
        # ---------------------------------------------------------

        job_description_response = client.post(
            "/api/v1/job-descriptions",
            headers=auth_headers(token),
            json={
                "title": "Machine Learning Engineer",
                "company": "XYZ Technologies",
                "description": (
                    "We are looking for a Machine Learning "
                    "Engineer with experience in Python, "
                    "NLP, sentiment analysis, Scikit-learn, "
                    "and machine learning."
                ),
            },
        )

        assert (
            job_description_response.status_code
            == 201
        )

        job_description = (
            job_description_response.json()
        )

        assert job_description["id"]

        # ---------------------------------------------------------
        # Generate tailored resume
        # ---------------------------------------------------------

        response = client.post(
            (
                "/api/v1/ai/"
                f"generate-tailored-resume/"
                f"{resume['id']}/"
                f"{job_description['id']}"
            ),
            headers=auth_headers(token),
            json={
                "instruction": None,
            },
        )

        assert response.status_code == 200

        data = response.json()

        # ---------------------------------------------------------
        # Basic response
        # ---------------------------------------------------------

        assert data["resume_id"] == resume["id"]

        assert (
            data["job_description_id"]
            == job_description["id"]
        )

        assert data["content"]

        assert data["structured"] is not None

        assert data["structured"]["summary"]

        # ---------------------------------------------------------
        # Verify changes
        # ---------------------------------------------------------

        assert "changes" in data

        assert isinstance(
            data["changes"],
            list,
        )

        changes = data["changes"]

        assert len(changes) >= 2

        # ---------------------------------------------------------
        # Summary change
        # ---------------------------------------------------------

        summary_changes = [
            change
            for change in changes
            if change["section"] == "summary"
        ]

        assert len(summary_changes) == 1

        summary_change = summary_changes[0]

        assert summary_change["action"] == "update"

        assert summary_change["target_id"] is None

        assert (
            summary_change["old_content"]
            == "Machine Learning Engineer with "
            "Python experience."
        )

        assert summary_change["new_content"]

        assert summary_change["reason"]

        # ---------------------------------------------------------
        # Experience change
        # ---------------------------------------------------------

        experience_changes = [
            change
            for change in changes
            if change["section"] == "experience"
        ]

        assert len(experience_changes) == 1

        experience_change = experience_changes[0]

        assert (
            experience_change["action"]
            == "update"
        )

        assert (
            experience_change["target_id"]
            == experience.id
        )

        assert (
            experience_change["old_content"]
            == (
                "Worked on machine learning projects "
                "using Python."
            )
        )

        assert experience_change["new_content"]

        assert experience_change["reason"]

    finally:
        app.dependency_overrides.pop(
            get_ai_service,
            None,
        )


def test_generate_tailored_resume_requires_existing_resume(
    client,
):
    token = register_and_login(
        client,
        "tailored-missing-resume@example.com",
    )

    response = client.post(
        "/api/v1/ai/generate-tailored-resume/999999/1",
        headers=auth_headers(token),
        json={
            "instruction": None,
        },
    )

    assert response.status_code == 404

    assert response.json()["detail"] == (
        "Resume not found"
    )


def test_generate_tailored_resume_requires_existing_job_description(
    client,
):
    token = register_and_login(
        client,
        "tailored-missing-jd@example.com",
    )

    resume = create_resume(
        client,
        token,
        "Tailored Missing JD Resume",
    )

    response = client.post(
        (
            "/api/v1/ai/"
            f"generate-tailored-resume/"
            f"{resume['id']}/999999"
        ),
        headers=auth_headers(token),
        json={
            "instruction": None,
        },
    )

    assert response.status_code == 404

    assert response.json()["detail"] == (
        "Job description not found"
    )


def test_generate_tailored_resume_requires_authentication(
    client,
):
    response = client.post(
        "/api/v1/ai/generate-tailored-resume/1/1",
        json={
            "instruction": None,
        },
    )

    assert response.status_code == 401