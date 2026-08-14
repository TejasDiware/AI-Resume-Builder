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
            "phone": "+919876543210",
            "professional_title": "Java Backend Developer",
            "summary": (
                "Java backend developer with experience "
                "in Spring Boot, REST APIs, SQL, and Java "
                "application development."
            ),
            "location": "Pune, India",
            "linkedin_url": None,
            "github_url": None,
            "portfolio_url": None,
        },
    )

    assert response.status_code == 201


def test_resume_quality_requires_existing_resume(client):
    token = register_and_login(
        client,
        "quality-missing@example.com",
    )

    response = client.get(
        "/api/v1/resume-quality/999999",
        headers=auth_headers(token),
    )

    assert response.status_code == 404
    assert response.json()["detail"] == (
        "Resume not found"
    )


def test_resume_quality_empty_resume(client):
    token = register_and_login(
        client,
        "quality-empty@example.com",
    )

    resume = create_resume(
        client,
        token,
        "Empty Resume",
    )

    create_profile(
        client,
        token,
    )

    response = client.get(
        f"/api/v1/resume-quality/{resume['id']}",
        headers=auth_headers(token),
    )

    assert response.status_code == 200

    data = response.json()

    assert data["resume_id"] == resume["id"]

    assert 0 <= data["sections"]["summary"] <= 100
    assert 0 <= data["sections"]["experience"] <= 100
    assert 0 <= data["sections"]["skills"] <= 100
    assert 0 <= data["sections"]["projects"] <= 100
    assert 0 <= data["sections"]["education"] <= 100

    assert 0 <= data["overall_score"] <= 100
    assert 0 <= data["completeness_score"] <= 100
    assert 0 <= data["content_quality_score"] <= 100
    assert 0 <= data["ats_readiness_score"] <= 100

    assert isinstance(
        data["issues"],
        list,
    )

    assert isinstance(
        data["recommendations"],
        list,
    )


def test_resume_quality_profile_only(client):
    token = register_and_login(
        client,
        "quality-profile@example.com",
    )

    resume = create_resume(
        client,
        token,
        "Profile Resume",
    )

    create_profile(
        client,
        token,
    )

    response = client.get(
        f"/api/v1/resume-quality/{resume['id']}",
        headers=auth_headers(token),
    )

    assert response.status_code == 200

    data = response.json()

    assert data["resume_id"] == resume["id"]

    assert "overall_score" in data
    assert "completeness_score" in data
    assert "content_quality_score" in data
    assert "ats_readiness_score" in data
    assert "sections" in data
    assert "issues" in data
    assert "recommendations" in data

    assert isinstance(
        data["sections"],
        dict,
    )

    assert isinstance(
        data["issues"],
        list,
    )

    assert isinstance(
        data["recommendations"],
        list,
    )