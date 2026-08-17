from types import SimpleNamespace

from app.api.routes.ai import get_ai_service
from app.main import app

from tests.test_resume import (
    auth_headers,
    register_and_login,
    create_resume,
)


class FakeServiceHistoryAIService:
    def generate_service_history(
        self,
        experience_id,
        company,
        job_title,
        employment_type,
        start_date,
        end_date,
        is_current,
        description,
        professional_title,
        summary,
        skills,
        projects,
        education,
        instruction,
    ):
        return SimpleNamespace(
            experience_id=experience_id,
            service_history=[
                "Developed machine learning solutions using Python and Scikit-learn.",
                "Performed NLP text preprocessing including tokenization and lemmatization.",
                "Applied TF-IDF and Bag-of-Words for feature extraction.",
                "Built sentiment classification models for Positive, Negative, and Neutral text.",
                "Evaluated machine learning models using Accuracy, Precision, Recall, and F1-score.",
            ],
        )


def create_profile(client, token):
    response = client.post(
        "/api/v1/profile",
        headers=auth_headers(token),
        json={
            "first_name": "Test",
            "last_name": "Candidate",
            "phone": "+919876543210",
            "professional_title": "Machine Learning Engineer",
            "summary": (
                "Machine Learning Engineer with experience in "
                "NLP and sentiment analysis."
            ),
            "location": "Pune, India",
            "linkedin_url": None,
            "github_url": None,
            "portfolio_url": None,
        },
    )

    assert response.status_code == 201

    return response.json()


def create_experience(client, token, resume_id):
    response = client.post(
        f"/api/v1/resumes/{resume_id}/experience",
        headers=auth_headers(token),
        json={
            "company": "Tech Solutions",
            "job_title": "Machine Learning Engineer",
            "location": "Pune, India",
            "employment_type": "Full-time",
            "start_date": "2025-01-01",
            "end_date": None,
            "is_current": True,
            "description": (
                "Worked on NLP and sentiment analysis using Python, "
                "Scikit-learn, NLTK and spaCy."
            ),
        },
    )

    assert response.status_code == 201

    return response.json()


def test_generate_service_history(client):
    app.dependency_overrides[get_ai_service] = (
        lambda: FakeServiceHistoryAIService()
    )

    try:
        token = register_and_login(
            client,
            "service-history@example.com",
        )

        resume = create_resume(
            client,
            token,
            "ML Engineer Resume",
        )

        create_profile(
            client,
            token,
        )

        experience = create_experience(
            client,
            token,
            resume["id"],
        )

        response = client.post(
            f"/api/v1/ai/generate-service-history/"
            f"{resume['id']}/{experience['id']}",
            headers=auth_headers(token),
            json={
                "instruction": (
                    "Focus on NLP and sentiment analysis."
                ),
            },
        )

        assert response.status_code == 200

        data = response.json()

        assert data["experience_id"] == experience["id"]

        assert isinstance(
            data["service_history"],
            list,
        )

        assert len(data["service_history"]) >= 1

        assert (
            "machine learning"
            in data["service_history"][0].lower()
        )

    finally:
        app.dependency_overrides.pop(
            get_ai_service,
            None,
        )


def test_generate_service_history_requires_authentication(client):
    response = client.post(
        "/api/v1/ai/generate-service-history/1/1",
        json={},
    )

    assert response.status_code == 401


def test_generate_service_history_invalid_resume(client):
    app.dependency_overrides[get_ai_service] = (
        lambda: FakeServiceHistoryAIService()
    )

    try:
        token = register_and_login(
            client,
            "service-history-invalid-resume@example.com",
        )

        create_profile(
            client,
            token,
        )

        response = client.post(
            "/api/v1/ai/generate-service-history/999999/1",
            headers=auth_headers(token),
            json={},
        )

        assert response.status_code == 404
        assert response.json()["detail"] == "Experience not found"

    finally:
        app.dependency_overrides.pop(
            get_ai_service,
            None,
        )


def test_generate_service_history_invalid_experience(client):
    app.dependency_overrides[get_ai_service] = (
        lambda: FakeServiceHistoryAIService()
    )

    try:
        token = register_and_login(
            client,
            "service-history-invalid-experience@example.com",
        )

        resume = create_resume(
            client,
            token,
            "ML Resume",
        )

        create_profile(
            client,
            token,
        )

        response = client.post(
            f"/api/v1/ai/generate-service-history/"
            f"{resume['id']}/999999",
            headers=auth_headers(token),
            json={},
        )

        assert response.status_code == 404
        assert response.json()["detail"] == "Experience not found"

    finally:
        app.dependency_overrides.pop(
            get_ai_service,
            None,
        )


def test_user_cannot_generate_service_history_for_another_users_experience(
    client,
):
    app.dependency_overrides[get_ai_service] = (
        lambda: FakeServiceHistoryAIService()
    )

    try:
        user_a_token = register_and_login(
            client,
            "service-history-owner@example.com",
        )

        user_b_token = register_and_login(
            client,
            "service-history-other@example.com",
        )

        resume = create_resume(
            client,
            user_a_token,
            "Owner Resume",
        )

        create_profile(
            client,
            user_a_token,
        )

        experience = create_experience(
            client,
            user_a_token,
            resume["id"],
        )

        create_profile(
            client,
            user_b_token,
        )

        response = client.post(
            f"/api/v1/ai/generate-service-history/"
            f"{resume['id']}/{experience['id']}",
            headers=auth_headers(user_b_token),
            json={},
        )

        assert response.status_code == 404
        assert response.json()["detail"] == "Experience not found"

    finally:
        app.dependency_overrides.pop(
            get_ai_service,
            None,
        )


def test_generate_service_history_requires_profile(client):
    app.dependency_overrides[get_ai_service] = (
        lambda: FakeServiceHistoryAIService()
    )

    try:
        token = register_and_login(
            client,
            "service-history-no-profile@example.com",
        )

        resume = create_resume(
            client,
            token,
        )

        experience = create_experience(
            client,
            token,
            resume["id"],
        )

        response = client.post(
            f"/api/v1/ai/generate-service-history/"
            f"{resume['id']}/{experience['id']}",
            headers=auth_headers(token),
            json={},
        )

        assert response.status_code == 404
        assert response.json()["detail"] == (
            "Candidate profile not found"
        )

    finally:
        app.dependency_overrides.pop(
            get_ai_service,
            None,
        )


def test_generate_service_history_instruction_is_optional(client):
    app.dependency_overrides[get_ai_service] = (
        lambda: FakeServiceHistoryAIService()
    )

    try:
        token = register_and_login(
            client,
            "service-history-optional@example.com",
        )

        resume = create_resume(
            client,
            token,
        )

        create_profile(
            client,
            token,
        )

        experience = create_experience(
            client,
            token,
            resume["id"],
        )

        response = client.post(
            f"/api/v1/ai/generate-service-history/"
            f"{resume['id']}/{experience['id']}",
            headers=auth_headers(token),
            json={},
        )

        assert response.status_code == 200

        data = response.json()

        assert data["experience_id"] == experience["id"]
        assert len(data["service_history"]) >= 1

    finally:
        app.dependency_overrides.pop(
            get_ai_service,
            None,
        )


def test_generate_service_history_ai_service_failure(client):
    class FailingService:
        def generate_service_history(self, *args, **kwargs):
            raise RuntimeError(
                "AI service failure"
            )

    app.dependency_overrides[get_ai_service] = (
        lambda: FailingService()
    )

    try:
        token = register_and_login(
            client,
            "service-history-failure@example.com",
        )

        resume = create_resume(
            client,
            token,
        )

        create_profile(
            client,
            token,
        )

        experience = create_experience(
            client,
            token,
            resume["id"],
        )

        response = client.post(
            f"/api/v1/ai/generate-service-history/"
            f"{resume['id']}/{experience['id']}",
            headers=auth_headers(token),
            json={},
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

def test_generate_service_history_ml_nlp_output(client):
    class FakeMLNLPService:
        def generate_service_history(
            self,
            experience_id,
            company,
            job_title,
            employment_type,
            start_date,
            end_date,
            is_current,
            description,
            professional_title,
            summary,
            skills,
            projects,
            education,
            instruction,
        ):
            return SimpleNamespace(
                experience_id=experience_id,
                service_history=[
                    "Developed machine learning solutions using Python and Scikit-learn.",
                    "Performed NLP text preprocessing including tokenization, stopword removal, stemming, and lemmatization.",
                    "Applied TF-IDF and Bag-of-Words techniques for feature extraction.",
                    "Built sentiment classification models for Positive, Negative, and Neutral text.",
                    "Evaluated machine learning models using Accuracy, Precision, Recall, and F1-score.",
                    "Performed feature engineering to improve NLP model performance.",
                    "Used Pandas, NumPy, NLTK, spaCy, and Scikit-learn for NLP development.",
                    "Developed an end-to-end NLP pipeline for sentiment analysis.",
                ],
            )

    app.dependency_overrides[get_ai_service] = (
        lambda: FakeMLNLPService()
    )

    try:
        token = register_and_login(
            client,
            "ml-nlp-service-history@example.com",
        )

        resume = create_resume(
            client,
            token,
            "Machine Learning Resume",
        )

        create_profile(
            client,
            token,
        )

        experience = create_experience(
            client,
            token,
            resume["id"],
        )

        response = client.post(
            f"/api/v1/ai/generate-service-history/"
            f"{resume['id']}/{experience['id']}",
            headers=auth_headers(token),
            json={
                "instruction": (
                    "Generate professional service history "
                    "focused on Machine Learning, NLP, "
                    "and Sentiment Analysis."
                )
            },
        )

        assert response.status_code == 200

        data = response.json()

        assert data["experience_id"] == experience["id"]

        service_history = data["service_history"]

        assert isinstance(service_history, list)
        assert len(service_history) == 8

        assert all(
            isinstance(item, str)
            for item in service_history
        )

        combined_history = " ".join(
            service_history
        ).lower()

        assert "machine learning" in combined_history
        assert "python" in combined_history
        assert "scikit-learn" in combined_history
        assert "nlp" in combined_history
        assert "tokenization" in combined_history
        assert "tf-idf" in combined_history
        assert "bag-of-words" in combined_history
        assert "sentiment" in combined_history
        assert "accuracy" in combined_history
        assert "precision" in combined_history
        assert "recall" in combined_history
        assert "f1-score" in combined_history
        assert "feature engineering" in combined_history

    finally:
        app.dependency_overrides.pop(
            get_ai_service,
            None,
        )