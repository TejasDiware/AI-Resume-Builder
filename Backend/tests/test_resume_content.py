from types import SimpleNamespace

from app.api.routes.ai import get_ai_service
from app.main import app

from tests.test_resume import (
    auth_headers,
    register_and_login,
)


class FakeResumeContentAIService:
    def generate_resume_content(
        self,
        prompt_input,
    ):
        return SimpleNamespace(
            summary=(
                "Machine Learning Engineer with 1 year of hands-on "
                "experience developing machine learning and NLP solutions."
            ),
            service_history=[
                "Developed and implemented machine learning solutions using Python and Scikit-learn.",
                "Worked with Natural Language Processing for processing and analyzing unstructured text data.",
                "Performed text preprocessing including tokenization, stopword removal, stemming, and lemmatization.",
                "Applied TF-IDF and Bag-of-Words techniques for feature extraction.",
                "Developed sentiment analysis models to classify Positive, Negative, and Neutral text.",
                "Trained and evaluated machine learning models using Accuracy, Precision, Recall, and F1-score.",
                "Performed feature engineering and data preprocessing to improve model performance.",
                "Used Pandas, NumPy, NLTK, spaCy, and Scikit-learn for ML and NLP tasks.",
            ],
            project=SimpleNamespace(
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
            ),
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

        response = client.post(
            "/api/v1/ai/generate-resume-content",
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


def test_generate_resume_content_requires_authentication(client):
    response = client.post(
        "/api/v1/ai/generate-resume-content",
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

    response = client.post(
        "/api/v1/ai/generate-resume-content",
        headers=auth_headers(token),
        json={},
    )

    assert response.status_code == 422


def test_generate_resume_content_empty_prompt(client):
    token = register_and_login(
        client,
        "resume-content-empty@example.com",
    )

    response = client.post(
        "/api/v1/ai/generate-resume-content",
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

    response = client.post(
        "/api/v1/ai/generate-resume-content",
        headers=auth_headers(token),
        json={
            "prompt": "   ",
        },
    )

    assert response.status_code == 422


def test_generate_resume_content_ai_service_failure(client):
    class FailingResumeContentService:
        def generate_resume_content(self, *args, **kwargs):
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

        response = client.post(
            "/api/v1/ai/generate-resume-content",
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


def test_generate_resume_content_optional_dynamic_prompt(client):
    app.dependency_overrides[get_ai_service] = (
        lambda: FakeResumeContentAIService()
    )

    try:
        token = register_and_login(
            client,
            "resume-content-dynamic@example.com",
        )

        response = client.post(
            "/api/v1/ai/generate-resume-content",
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

    finally:
        app.dependency_overrides.pop(
            get_ai_service,
            None,
        )