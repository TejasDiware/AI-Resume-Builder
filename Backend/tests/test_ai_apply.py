from tests.test_resume import (
    auth_headers,
    register_and_login,
    create_resume,
)




def test_apply_ai_change_summary(client):
    token = register_and_login(
        client,
        "ai-change-summary@example.com",
    )

    resume = create_resume(
        client,
        token,
        "AI Change Resume",
    )

    profile_response = client.post(
        "/api/v1/profile",
        headers=auth_headers(token),
        json={
            "first_name": "Tejas",
            "last_name": "Diware",
            "phone": "+919876543210",
            "professional_title": "Java Backend Developer",
            "summary": (
                "Backend developer building scalable applications."
            ),
            "location": "Pune, India",
            "linkedin_url": None,
            "github_url": None,
            "portfolio_url": None,
        },
    )

    assert profile_response.status_code == 201

    response = client.post(
        f"/api/v1/ai/apply-change/{resume['id']}",
        headers=auth_headers(token),
        json={
            "section": "summary",
            "target_id": None,
            "content": (
                "Java Backend Developer with experience "
                "in Spring Boot and REST APIs."
            ),
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["message"] == (
        "AI change applied successfully"
    )
    assert data["resume_id"] == resume["id"]
    assert data["section"] == "summary"
    assert data["target_id"] is None


def test_apply_ai_change_requires_existing_resume(
    client,
):
    token = register_and_login(
        client,
        "ai-change-missing@example.com",
    )

    response = client.post(
        "/api/v1/ai/apply-change/999999",
        headers=auth_headers(token),
        json={
            "section": "summary",
            "content": "Updated summary.",
        },
    )

    assert response.status_code == 404

    assert response.json()["detail"] == (
        "Resume not found"
    )


def test_apply_tailored_resume_empty_updates(
    client,
):
    token = register_and_login(
        client,
        "tailored-apply@example.com",
    )

    resume = create_resume(
        client,
        token,
        "Tailored Resume",
    )

    response = client.post(
        f"/api/v1/ai/apply-tailored-resume/"
        f"{resume['id']}",
        headers=auth_headers(token),
        json={
            "skill_ids": [],
            "experience_updates": {},
            "project_updates": {},
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["message"] == (
        "Tailored resume changes applied successfully"
    )
    assert data["resume_id"] == resume["id"]


def test_apply_tailored_resume_requires_existing_resume(
    client,
):
    token = register_and_login(
        client,
        "tailored-missing@example.com",
    )

    response = client.post(
        "/api/v1/ai/apply-tailored-resume/999999",
        headers=auth_headers(token),
        json={
            "skill_ids": [],
            "experience_updates": {},
            "project_updates": {},
        },
    )

    assert response.status_code == 404

    assert response.json()["detail"] == (
        "Resume not found"
    )