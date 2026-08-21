from app.models.education import Education
from app.models.resume import Resume
from app.parser.schemas import ParsedContact, ParsedResume
from tests.test_resume import auth_headers, register_and_login


def test_upload_replaces_existing_resume_content_without_changing_id(
    client,
    db_session,
    monkeypatch,
):
    token = register_and_login(client, "upload-replacement@example.com")
    user_id = client.get(
        "/api/v1/auth/me",
        headers=auth_headers(token),
    ).json()["id"]
    resume = Resume(
        user_id=user_id,
        title="Imported Resume",
        template="classic",
        template_id=1,
    )
    resume.education.append(
        Education(
            institution="Old University",
            degree="Old Degree",
        )
    )
    db_session.add(resume)
    db_session.commit()
    db_session.refresh(resume)
    original_id = resume.id

    parsed = ParsedResume(
        contact=ParsedContact(
            name="New Candidate",
            email="new@example.com",
        ),
        skills=["New Skill"],
    )
    monkeypatch.setattr(
        "app.services.resume_upload_service.extract_text",
        lambda path: "enough extracted resume text",
    )
    monkeypatch.setattr(
        "app.services.resume_upload_service.parse_resume_with_groq",
        lambda text: parsed,
    )

    response = client.post(
        f"/api/v1/resumes/{original_id}/upload",
        headers=auth_headers(token),
        files={
            "file": (
                "resume.pdf",
                b"mock pdf content",
                "application/pdf",
            )
        },
    )

    assert response.status_code == 200
    assert response.json()["resume_id"] == original_id

    db_session.expire_all()
    saved = db_session.get(Resume, original_id)
    assert saved is not None
    assert saved.status.value == "completed"
    assert [item.institution for item in saved.education] == []
    assert [item.name for item in saved.skills] == ["New Skill"]
