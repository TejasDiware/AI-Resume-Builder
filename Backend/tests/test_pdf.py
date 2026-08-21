import fitz

from tests.test_resume import (
    auth_headers,
    register_and_login,
    create_resume,
)


def create_profile(
    client,
    token: str,
    *,
    first_name: str = "Tejas",
    last_name: str = "Diware",
    professional_title: str = "Java Backend Developer",
):
    response = client.post(
        "/api/v1/profile",
        headers=auth_headers(token),
        json={
            "first_name": first_name,
            "last_name": last_name,
            "phone": "+91-9545170847",
            "professional_title": professional_title,
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


def extract_pdf_text(pdf_bytes: bytes) -> str:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = "\n".join(page.get_text("text") for page in doc)
    doc.close()
    return text


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
        first_name="Ada",
        last_name="Lovelace",
        professional_title="Engineer",
    )

    response = client.get(
        f"/api/v1/resumes/{resume['id']}/pdf",
        headers=auth_headers(token),
    )

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("application/pdf")
    assert response.content.startswith(b"%PDF")

    text = extract_pdf_text(response.content)
    assert "Ada" in text
    assert "Lovelace" in text


def test_generate_resume_pdf_uses_canonical_template_id(
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
        first_name="Dark",
        last_name="Navy",
        professional_title="Template One Designer",
    )

    classic_response = client.put(
        f"/api/v1/resumes/{resume['id']}",
        headers=auth_headers(token),
        json={"template_id": 1},
    )
    assert classic_response.status_code == 200

    template_one_pdf = client.get(
        f"/api/v1/resumes/{resume['id']}/pdf",
        headers=auth_headers(token),
    )
    assert template_one_pdf.status_code == 200

    template_one_text = extract_pdf_text(template_one_pdf.content)
    assert "Template ID: 1" in template_one_text or "Dark Navy Sidebar" in template_one_text

    profile_update = client.put(
        "/api/v1/profile",
        headers=auth_headers(token),
        json={
            "first_name": "Brian",
            "last_name": "Professional",
            "phone": "+91-9545170847",
            "professional_title": "Template Two Strategist",
            "summary": "A different summary so template output is distinct.",
            "location": "Pune, Maharashtra",
            "linkedin_url": None,
            "github_url": None,
            "portfolio_url": None,
        },
    )
    assert profile_update.status_code == 200

    modern_response = client.put(
        f"/api/v1/resumes/{resume['id']}",
        headers=auth_headers(token),
        json={"template_id": 2},
    )
    assert modern_response.status_code == 200

    template_two_pdf = client.get(
        f"/api/v1/resumes/{resume['id']}/pdf",
        headers=auth_headers(token),
    )
    assert template_two_pdf.status_code == 200

    template_two_text = extract_pdf_text(template_two_pdf.content)
    assert "Template ID: 2" in template_two_text or "Brian Professional" in template_two_text
    assert template_one_pdf.content != template_two_pdf.content

    ignored_template_response = client.get(
        f"/api/v1/resumes/{resume['id']}/pdf?template=99",
        headers=auth_headers(token),
    )
    assert ignored_template_response.status_code == 200
    assert extract_pdf_text(ignored_template_response.content) == template_two_text


def test_generate_resume_pdf_rejects_unsupported_template_id(
    client,
):
    token = register_and_login(
        client,
        "pdf-unsupported-template@example.com",
    )

    resume = create_resume(
        client,
        token,
        "Unsupported Template Resume",
    )

    create_profile(
        client,
        token,
    )

    update_response = client.put(
        f"/api/v1/resumes/{resume['id']}",
        headers=auth_headers(token),
        json={"template_id": 3},
    )
    assert update_response.status_code == 200

    response = client.get(
        f"/api/v1/resumes/{resume['id']}/pdf",
        headers=auth_headers(token),
    )

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("application/pdf")


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
    assert response.json()["detail"] == "Resume not found"