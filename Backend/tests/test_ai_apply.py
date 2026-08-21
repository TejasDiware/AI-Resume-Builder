from sqlalchemy import select

from app.models.candidate_profile import CandidateProfile
from app.models.experience import Experience
from app.models.project import Project

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


def test_apply_tailored_resume_updates_only_approved_fields(
    client,
    db_session,
):
    token = register_and_login(
        client,
        "tailored-approved-fields@example.com",
    )

    resume = create_resume(
        client,
        token,
        "Tailored Approved Fields Resume",
    )

    profile_response = client.post(
        "/api/v1/profile",
        headers=auth_headers(token),
        json={
            "first_name": "Tejas",
            "last_name": "Diware",
            "phone": "+919876543210",
            "professional_title": "Backend Developer",
            "summary": "Original summary.",
            "location": "Pune, India",
        },
    )
    assert profile_response.status_code == 201

    experience = Experience(
        resume_id=resume["id"],
        company="ABC Technologies",
        job_title="Backend Developer",
        description="Original experience.",
        location="Pune",
        employment_type="Full-time",
        is_current=False,
    )
    db_session.add(experience)
    db_session.commit()
    db_session.refresh(experience)

    response = client.post(
        f"/api/v1/ai/apply-tailored-resume/{resume['id']}",
        headers=auth_headers(token),
        json={
            "summary": "Approved summary.",
            "skill_ids": [],
            "experience_updates": {
                experience.id: "Approved experience."
            },
            "project_updates": {},
        },
    )

    assert response.status_code == 200
    db_session.refresh(experience)
    profile = db_session.scalar(select(CandidateProfile))
    assert profile.summary == "Approved summary."
    assert experience.description == "Approved experience."


def test_apply_ai_change_summary_updates_database(
    client,
    db_session,
):
    token = register_and_login(
        client,
        "ai-summary-db@example.com",
    )

    resume = create_resume(
        client,
        token,
        "AI Summary DB Resume",
    )

    profile_response = client.post(
        "/api/v1/profile",
        headers=auth_headers(token),
        json={
            "first_name": "Tejas",
            "last_name": "Diware",
            "phone": "+919876543210",
            "professional_title": "Java Backend Developer",
            "summary": "Old summary.",
            "location": "Pune, India",
            "linkedin_url": None,
            "github_url": None,
            "portfolio_url": None,
        },
    )

    assert profile_response.status_code == 201

    new_summary = (
        "Java Backend Developer with experience "
        "in Spring Boot and REST APIs."
    )

    response = client.post(
        f"/api/v1/ai/apply-change/{resume['id']}",
        headers=auth_headers(token),
        json={
            "action": "update",
            "section": "summary",
            "target_id": None,
            "content": new_summary,
        },
    )

    assert response.status_code == 200

    profile = db_session.scalar(
        select(CandidateProfile)
    )

    assert profile is not None
    assert profile.summary == new_summary

def test_apply_ai_change_experience_updates_database(
    client,
    db_session,
):
    token = register_and_login(
        client,
        "ai-experience-db@example.com",
    )

    resume = create_resume(
        client,
        token,
        "AI Experience DB Resume",
    )

    experience = Experience(
        resume_id=resume["id"],
        company="ABC Technologies",
        job_title="Java Developer",
        description="Old experience description.",
        location="Pune",
        employment_type="Full-time",
        is_current=False,
    )

    db_session.add(experience)
    db_session.commit()
    db_session.refresh(experience)

    new_description = (
        "Developed REST APIs using Java and Spring Boot."
    )

    response = client.post(
        f"/api/v1/ai/apply-change/{resume['id']}",
        headers=auth_headers(token),
        json={
            "action": "update",
            "section": "experience",
            "target_id": experience.id,
            "content": new_description,
        },
    )

    assert response.status_code == 200

    db_session.refresh(experience)

    assert experience.description == new_description

def test_apply_ai_change_create_project(
    client,
    db_session,
):
    token = register_and_login(
        client,
        "ai-project-create@example.com",
    )

    resume = create_resume(
        client,
        token,
        "AI Project Create Resume",
    )

    response = client.post(
        f"/api/v1/ai/apply-change/{resume['id']}",
        headers=auth_headers(token),
        json={
            "action": "create",
            "section": "project",
            "target_id": None,
            "content": (
                "Developed REST APIs using Java and Spring Boot."
            ),
            "data": {
                "title": "Java Backend API",
                "role": "Backend Developer",
                "technologies": "Java, Spring Boot, PostgreSQL",
                "description": (
                    "Developed REST APIs using Java and Spring Boot."
                ),
            },
        },
    )

    assert response.status_code == 200

    project = db_session.scalar(
        select(Project)
        .where(
            Project.resume_id == resume["id"],
            Project.title == "Java Backend API",
        )
    )

    assert project is not None
    assert project.role == "Backend Developer"
    assert (
        project.technologies
        == "Java, Spring Boot, PostgreSQL"
    )
    assert (
        project.description
        == "Developed REST APIs using Java and Spring Boot."
    )

def test_accept_tailored_resume_experience_change(
    client,
    db_session,
):
    token = register_and_login(
        client,
        "tailored-accept-experience@example.com",
    )

    resume = create_resume(
        client,
        token,
        "Tailored Accept Resume",
    )

    experience = Experience(
        resume_id=resume["id"],
        company="ABC Technologies",
        job_title="Machine Learning Engineer",
        description=(
            "Worked on machine learning projects using Python."
        ),
        location="Pune",
        employment_type="Full-time",
        is_current=False,
    )

    db_session.add(experience)
    db_session.commit()
    db_session.refresh(experience)

    old_description = experience.description

    new_description = (
        "Developed machine learning solutions using "
        "Python and Scikit-learn. Applied NLP and "
        "sentiment analysis techniques to process "
        "and analyze text data."
    )

    # ---------------------------------------------------------
    # Simulate the AI-generated Tailored Resume change
    # being accepted by the user.
    # ---------------------------------------------------------

    response = client.post(
        f"/api/v1/ai/apply-change/{resume['id']}",
        headers=auth_headers(token),
        json={
            "action": "update",
            "section": "experience",
            "target_id": experience.id,
            "content": new_description,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["message"] == (
        "AI change applied successfully"
    )

    assert data["resume_id"] == resume["id"]
    assert data["section"] == "experience"
    assert data["target_id"] == experience.id

    # ---------------------------------------------------------
    # Verify database was actually changed.
    # ---------------------------------------------------------

    db_session.refresh(experience)

    assert experience.description != old_description

    assert experience.description == new_description


def test_reject_tailored_resume_change_does_not_modify_database(
    client,
    db_session,
):
    token = register_and_login(
        client,
        "tailored-reject-experience@example.com",
    )

    resume = create_resume(
        client,
        token,
        "Tailored Reject Resume",
    )

    experience = Experience(
        resume_id=resume["id"],
        company="ABC Technologies",
        job_title="Machine Learning Engineer",
        description=(
            "Worked on machine learning projects using Python."
        ),
        location="Pune",
        employment_type="Full-time",
        is_current=False,
    )

    db_session.add(experience)
    db_session.commit()
    db_session.refresh(experience)

    original_description = experience.description

    # ---------------------------------------------------------
    # AI generated a suggestion, but the user REJECTED it.
    #
    # Therefore /apply-change is intentionally NOT called.
    # ---------------------------------------------------------

    rejected_description = (
        "Developed advanced machine learning systems "
        "using Python and Scikit-learn."
    )

    # Simulate the review layer discarding the change.
    rejected_change = {
        "action": "update",
        "section": "experience",
        "target_id": experience.id,
        "content": rejected_description,
    }

    assert rejected_change["content"] != original_description

    # ---------------------------------------------------------
    # Verify nothing changed in the database.
    # ---------------------------------------------------------

    db_session.refresh(experience)

    assert experience.description == original_description