from types import SimpleNamespace

from app.api.routes.ai import get_ai_service
from app.ai.schemas import AIChange
from app.main import app

from tests.test_resume import (
    auth_headers,
    register_and_login,
    create_resume,
)


class FakeResumeContentAIService:
    def generate_resume_content(
        self,
        prompt_input: str,
        generation_context: dict | None = None,
    ):
        generation_context = generation_context or {}

        summary = (
            "Machine Learning Engineer with 1 year of hands-on "
            "experience developing machine learning and NLP solutions."
        )

        service_history = [
            "Developed and implemented machine learning solutions using Python and Scikit-learn.",
            "Worked with Natural Language Processing for processing and analyzing unstructured text data.",
            "Performed text preprocessing including tokenization, stopword removal, stemming, and lemmatization.",
            "Applied TF-IDF and Bag-of-Words techniques for feature extraction.",
            "Developed sentiment analysis models to classify Positive, Negative, and Neutral text.",
            "Trained and evaluated machine learning models using Accuracy, Precision, Recall, and F1-score.",
            "Performed feature engineering and data preprocessing to improve model performance.",
            "Used Pandas, NumPy, NLTK, spaCy, and Scikit-learn for ML and NLP tasks.",
        ]

        project = SimpleNamespace(
            title="NLP-Based Sentiment Analysis System",
            technologies=[
                "Python",
                "NLP",
                "NLTK",
                "spaCy",
                "Scikit-learn",
                "Pandas",
                "NumPy",
                "TF-IDF",
            ],
            description=[
                "Developed an NLP-based sentiment analysis system.",
                "Preprocessed text using tokenization, stopword removal, and lemmatization.",
                "Converted text into numerical features using TF-IDF.",
                "Trained machine learning classification models for sentiment analysis.",
                "Evaluated model performance using accuracy, precision, recall, and F1-score.",
                "Performed feature engineering and model experimentation.",
            ],
        )

        changes = []

        # ---------------------------------------------------------
        # Summary change
        # ---------------------------------------------------------

        profile = generation_context.get(
            "profile",
            {},
        )

        old_summary = (
            profile.get("summary", "")
            if isinstance(profile, dict)
            else ""
        )

        changes.append(
            AIChange(
                id="generate_summary_001",
                action="update",
                section="summary",
                target_id=None,
                old_content=old_summary,
                new_content=summary,
                reason=(
                    "Generated a resume summary based on the "
                    "candidate's requested career direction."
                ),
            )
        )

        # ---------------------------------------------------------
        # Experience change
        # ---------------------------------------------------------

        experience_records = generation_context.get(
            "experience",
            [],
        )

        if experience_records:
            first_experience = experience_records[0]

            experience_id = first_experience.get("id")

            old_description = (
                first_experience.get(
                    "description",
                    "",
                )
                or ""
            )

            changes.append(
                AIChange(
                    id=f"generate_experience_{experience_id}_001",
                    action="update",
                    section="experience",
                    target_id=experience_id,
                    old_content=old_description,
                    new_content="\n".join(
                        service_history
                    ),
                    reason=(
                        "Generated service history based on "
                        "the requested experience and career focus."
                    ),
                )
            )

        # ---------------------------------------------------------
        # Project change
        # ---------------------------------------------------------

        project_description = "\n".join(
            project.description
        )

        changes.append(
            AIChange(
                id="generate_project_001",
                action="create",
                section="project",
                target_id=None,
                old_content=None,
                new_content=project_description,
                data={
                    "title": project.title,
                    "role": "",
                    "technologies": ", ".join(
                        project.technologies
                    ),
                    "description": project_description,
                },
                reason=(
                    "Generated a project based on the "
                    "candidate's requested career direction."
                ),
            )
        )

        return SimpleNamespace(
            summary=summary,
            service_history=service_history,
            project=project,
            changes=changes,
        )


def test_generate_resume_content(client):
    app.dependency_overrides[get_ai_service] = (
        lambda: FakeResumeContentAIService()
    )

    try:
        token = register_and_login(
            client,
            "resume-content@example.com",
        )

        resume = create_resume(
            client,
            token,
            "Resume Content Test",
        )

        assert resume["id"]

        response = client.post(
            f"/api/v1/ai/generate-resume-content/{resume['id']}",
            headers=auth_headers(token),
            json={
                "prompt": (
                    "I have 1 year of experience in machine learning. "
                    "I worked on NLP, sentiment analysis project. "
                    "Give me summary, service history, project for resume."
                ),
            },
        )

        assert response.status_code == 200

        data = response.json()

        assert "summary" in data
        assert "service_history" in data
        assert "project" in data
        assert "changes" in data

        assert isinstance(data["summary"], str)
        assert data["summary"]

        assert isinstance(data["service_history"], list)
        assert len(data["service_history"]) >= 1

        assert isinstance(data["project"], dict)

        assert (
            data["project"]["title"]
            == "NLP-Based Sentiment Analysis System"
        )

        assert isinstance(
            data["project"]["technologies"],
            list,
        )

        assert isinstance(
            data["project"]["description"],
            list,
        )

        assert isinstance(
            data["changes"],
            list,
        )

        combined_content = (
            data["summary"]
            + " "
            + " ".join(data["service_history"])
            + " "
            + data["project"]["title"]
            + " "
            + " ".join(data["project"]["technologies"])
            + " "
            + " ".join(data["project"]["description"])
        ).lower()

        assert "machine learning" in combined_content
        assert "nlp" in combined_content
        assert "sentiment" in combined_content
        assert "python" in combined_content
        assert "scikit-learn" in combined_content
        assert "tf-idf" in combined_content
        assert "tokenization" in combined_content
        assert "f1-score" in combined_content

    finally:
        app.dependency_overrides.pop(
            get_ai_service,
            None,
        )


def test_generate_resume_content_returns_ai_changes(
    client,
):
    app.dependency_overrides[get_ai_service] = (
        lambda: FakeResumeContentAIService()
    )

    try:
        token = register_and_login(
            client,
            "resume-content-changes@example.com",
        )

        resume = create_resume(
            client,
            token,
            "AI Changes Resume",
        )

        assert resume["id"]

        response = client.post(
            f"/api/v1/ai/generate-resume-content/{resume['id']}",
            headers=auth_headers(token),
            json={
                "prompt": (
                    "Create a machine learning resume with "
                    "NLP and sentiment analysis experience."
                ),
            },
        )

        assert response.status_code == 200

        data = response.json()

        assert "summary" in data
        assert "service_history" in data
        assert "project" in data
        assert "changes" in data

        assert isinstance(
            data["changes"],
            list,
        )

        changes = data["changes"]

        assert len(changes) >= 1

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
        assert summary_change["new_content"]

        assert (
            summary_change["new_content"]
            == data["summary"]
        )

        assert summary_change["reason"]

        # ---------------------------------------------------------
        # Project create change
        # ---------------------------------------------------------

        project_changes = [
            change
            for change in changes
            if change["section"] == "project"
        ]

        assert len(project_changes) == 1

        project_change = project_changes[0]

        assert project_change["action"] == "create"
        assert project_change["target_id"] is None
        assert project_change["new_content"]

        assert project_change["data"] is not None

        assert (
            project_change["data"]["title"]
            == data["project"]["title"]
        )

        assert (
            project_change["data"]["technologies"]
        )

        assert (
            project_change["data"]["description"]
        )

        assert project_change["reason"]

    finally:
        app.dependency_overrides.pop(
            get_ai_service,
            None,
        )


def test_generate_resume_content_requires_authentication(
    client,
):
    response = client.post(
        "/api/v1/ai/generate-resume-content/999999",
        json={
            "prompt": (
                "I have 1 year of experience in machine learning."
            ),
        },
    )

    assert response.status_code == 401


def test_generate_resume_content_missing_prompt(client):
    token = register_and_login(
        client,
        "resume-content-missing@example.com",
    )

    resume = create_resume(
        client,
        token,
        "Missing Prompt Resume",
    )

    response = client.post(
        f"/api/v1/ai/generate-resume-content/{resume['id']}",
        headers=auth_headers(token),
        json={},
    )

    assert response.status_code == 422


def test_generate_resume_content_empty_prompt(client):
    token = register_and_login(
        client,
        "resume-content-empty@example.com",
    )

    resume = create_resume(
        client,
        token,
        "Empty Prompt Resume",
    )

    response = client.post(
        f"/api/v1/ai/generate-resume-content/{resume['id']}",
        headers=auth_headers(token),
        json={
            "prompt": "",
        },
    )

    assert response.status_code == 422


def test_generate_resume_content_whitespace_prompt(client):
    token = register_and_login(
        client,
        "resume-content-whitespace@example.com",
    )

    resume = create_resume(
        client,
        token,
        "Whitespace Prompt Resume",
    )

    response = client.post(
        f"/api/v1/ai/generate-resume-content/{resume['id']}",
        headers=auth_headers(token),
        json={
            "prompt": "   ",
        },
    )

    assert response.status_code == 422


def test_generate_resume_content_ai_service_failure(client):
    class FailingResumeContentService:
        def generate_resume_content(
            self,
            *args,
            **kwargs,
        ):
            raise RuntimeError(
                "AI service failure"
            )

    app.dependency_overrides[get_ai_service] = (
        lambda: FailingResumeContentService()
    )

    try:
        token = register_and_login(
            client,
            "resume-content-failure@example.com",
        )

        resume = create_resume(
            client,
            token,
            "AI Failure Resume",
        )

        response = client.post(
            f"/api/v1/ai/generate-resume-content/{resume['id']}",
            headers=auth_headers(token),
            json={
                "prompt": (
                    "I have 1 year of experience in machine learning."
                ),
            },
        )

        assert response.status_code == 503

        assert response.json()["detail"] == (
            "AI service is temporarily unavailable"
        )

    finally:
        app.dependency_overrides.pop(
            get_ai_service,
            None,
        )


def test_generate_resume_content_optional_dynamic_prompt(
    client,
):
    app.dependency_overrides[get_ai_service] = (
        lambda: FakeResumeContentAIService()
    )

    try:
        token = register_and_login(
            client,
            "resume-content-dynamic@example.com",
        )

        resume = create_resume(
            client,
            token,
            "Dynamic Prompt Resume",
        )

        response = client.post(
            f"/api/v1/ai/generate-resume-content/{resume['id']}",
            headers=auth_headers(token),
            json={
                "prompt": (
                    "I have 2 years of experience in Python backend "
                    "development using FastAPI and PostgreSQL. "
                    "Generate summary, service history and project."
                ),
            },
        )

        assert response.status_code == 200

        data = response.json()

        assert data["summary"]
        assert data["service_history"]
        assert data["project"]["title"]
        assert "changes" in data
        assert isinstance(data["changes"], list)

    finally:
        app.dependency_overrides.pop(
            get_ai_service,
            None,
        )


def test_generate_resume_content_cannot_access_another_users_resume(
    client,
):
    owner_token = register_and_login(
        client,
        "resume-content-owner@example.com",
    )

    resume = create_resume(
        client,
        owner_token,
        "Owner Resume",
    )

    other_user_token = register_and_login(
        client,
        "resume-content-other@example.com",
    )

    response = client.post(
        f"/api/v1/ai/generate-resume-content/{resume['id']}",
        headers=auth_headers(other_user_token),
        json={
            "prompt": (
                "Generate machine learning resume content."
            ),
        },
    )

    assert response.status_code == 404

    assert response.json()["detail"] == (
        "Resume not found"
    )