from tests.test_resume import (
    auth_headers,
    register_and_login,
    create_resume,
)


def create_profile(
    client,
    token: str,
):
    response = client.post(
        "/api/v1/profile",
        headers=auth_headers(token),
        json={
            "first_name": "Tejas",
            "last_name": "Diware",
            "phone": "+91-9545170847",
            "professional_title": "Java Backend Developer",
            "summary": (
                "Java backend developer with experience "
                "in Spring Boot, REST APIs, SQL, and Java "
                "application development."
            ),
            "location": "Pune, Maharashtra",
            "linkedin_url": None,
            "github_url": None,
            "portfolio_url": None,
        },
    )

    assert response.status_code == 201

    return response.json()


def test_generate_resume_pdf(client):
    token = register_and_login(
        client,
        "pdf-test@example.com",
    )

    resume = create_resume(
        client,
        token,
        "PDF Resume",
    )

    create_profile(
        client,
        token,
    )

    response = client.get(
        f"/api/v1/resumes/{resume['id']}/pdf",
        headers=auth_headers(token),
    )

    assert response.status_code == 200

    assert response.headers["content-type"] == (
        "application/pdf"
    )

    assert response.content.startswith(
        b"%PDF"
    )


def test_generate_resume_pdf_unsupported_template(
    client,
):
    token = register_and_login(
        client,
        "pdf-template-test@example.com",
    )

    resume = create_resume(
        client,
        token,
        "PDF Template Resume",
    )

    create_profile(
        client,
        token,
    )

    response = client.get(
        f"/api/v1/resumes/{resume['id']}/pdf"
        "?template=unknown",
        headers=auth_headers(token),
    )

    assert response.status_code == 400

    assert "Unsupported template" in (
        response.json()["detail"]
    )


def test_user_cannot_download_another_users_pdf(
    client,
):
    user_a_token = register_and_login(
        client,
        "pdf-user-a@example.com",
    )

    user_b_token = register_and_login(
        client,
        "pdf-user-b@example.com",
    )

    resume = create_resume(
        client,
        user_a_token,
        "Private PDF Resume",
    )

    response = client.get(
        f"/api/v1/resumes/{resume['id']}/pdf",
        headers=auth_headers(user_b_token),
    )

    assert response.status_code == 404

    assert response.json()["detail"] == (
        "Resume not found"
    )