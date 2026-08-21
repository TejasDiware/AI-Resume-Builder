from datetime import date

import pytest
from sqlalchemy import select

from app.models.achievement import Achievement
from app.models.certification import Certification
from app.models.education import Education
from app.models.experience import Experience
from app.models.job_description import JobDescription
from app.models.language import Language
from app.models.project import Project
from app.models.resume import Resume
from app.models.skill import Skill
from app.services.resume_canonicalization_service import (
    build_resume_snapshot,
    find_canonical_resume_id,
)
from tests.test_resume import auth_headers, register_and_login


CHILD_MODELS = {
    "education": Education,
    "experience": Experience,
    "skills": Skill,
    "projects": Project,
    "certifications": Certification,
    "languages": Language,
    "achievements": Achievement,
}

CONTENT = {
    "education": {
        "institution": "Example University",
        "degree": "BSc",
        "field_of_study": "Computer Science",
        "start_date": date(2018, 9, 1),
        "end_date": date(2022, 6, 30),
        "description": "Honors",
    },
    "experience": {
        "company": "Example Corp",
        "job_title": "Engineer",
        "location": "Remote",
        "employment_type": "Full-time",
        "start_date": date(2022, 7, 1),
        "end_date": None,
        "is_current": True,
        "description": "Built systems",
    },
    "skills": {
        "name": "Python",
        "category": "Programming",
        "proficiency": "Advanced",
    },
    "projects": {
        "title": "Resume Builder",
        "description": "A useful project",
        "role": "Developer",
        "technologies": "Python, React",
        "project_url": "https://example.com/project",
        "start_date": date(2023, 1, 1),
        "end_date": date(2023, 6, 1),
    },
    "certifications": {
        "name": "Cloud Certificate",
        "issuing_organization": "Example Institute",
        "issue_date": date(2023, 7, 1),
        "expiration_date": None,
        "credential_id": "CERT-1",
        "credential_url": "https://example.com/cert",
    },
    "languages": {
        "name": "English",
        "proficiency": "Native",
    },
    "achievements": {
        "title": "Award",
        "description": "Recognition",
        "organization": "Example Org",
        "year": 2024,
    },
}


def make_resume(db_session, user_id, *, template_id=1, job_description_id=None, title="Resume"):
    resume = Resume(
        user_id=user_id,
        title=title,
        template_id=template_id,
        job_description_id=job_description_id,
        template="classic",
    )
    db_session.add(resume)
    db_session.flush()
    return resume


def add_content(db_session, resume, *, exclude=None, whitespace=False):
    for collection, model in CHILD_MODELS.items():
        if collection == exclude:
            continue
        values = dict(CONTENT[collection])
        if whitespace:
            for field, value in values.items():
                if isinstance(value, str):
                    values[field] = f"  {value}  "
        db_session.add(model(resume_id=resume.id, **values))


def test_identical_content_returns_lowest_canonical_id(client, db_session):
    token = register_and_login(client, "canonical-identical@example.com")
    user_id = client.get("/api/v1/auth/me", headers=auth_headers(token)).json()["id"]
    first = make_resume(db_session, user_id, title="First")
    second = make_resume(db_session, user_id, title="Second")
    add_content(db_session, first)
    add_content(db_session, second, whitespace=True)
    db_session.commit()

    response = client.post(
        f"/api/v1/resumes/{second.id}/canonicalize",
        headers=auth_headers(token),
    )

    assert response.status_code == 200
    assert response.json() == {"canonical_resume_id": first.id}


@pytest.mark.parametrize("collection", list(CHILD_MODELS))
def test_different_child_content_remains_separate(client, db_session, collection):
    token = register_and_login(client, f"canonical-{collection}@example.com")
    user_id = client.get("/api/v1/auth/me", headers=auth_headers(token)).json()["id"]
    first = make_resume(db_session, user_id)
    second = make_resume(db_session, user_id)
    add_content(db_session, first)
    add_content(db_session, second)
    model = CHILD_MODELS[collection]
    db_session.add(model(resume_id=second.id, **{**CONTENT[collection], list(CONTENT[collection])[0]: "Different"}))
    db_session.commit()

    assert find_canonical_resume_id(db_session, second) == second.id


def test_metadata_dimensions_and_users_remain_separate(client, db_session):
    token = register_and_login(client, "canonical-metadata@example.com")
    other_token = register_and_login(client, "canonical-other@example.com")
    user_id = client.get("/api/v1/auth/me", headers=auth_headers(token)).json()["id"]
    other_user_id = client.get("/api/v1/auth/me", headers=auth_headers(other_token)).json()["id"]
    first = make_resume(db_session, user_id)
    different_template = make_resume(db_session, user_id, template_id=2)
    different_user = make_resume(db_session, other_user_id)
    add_content(db_session, first)
    add_content(db_session, different_template)
    add_content(db_session, different_user)
    db_session.commit()

    assert find_canonical_resume_id(db_session, different_template) == different_template.id
    assert find_canonical_resume_id(db_session, different_user) == different_user.id

    response = client.post(
        f"/api/v1/resumes/{first.id}/canonicalize",
        headers=auth_headers(token),
    )
    assert response.json()["canonical_resume_id"] == first.id


def test_title_ids_timestamps_and_order_do_not_change_equality(client, db_session):
    token = register_and_login(client, "canonical-stable@example.com")
    user_id = client.get("/api/v1/auth/me", headers=auth_headers(token)).json()["id"]
    first = make_resume(db_session, user_id, title="Original")
    second = make_resume(db_session, user_id, title="Different title")
    add_content(db_session, first)
    add_content(db_session, second)
    db_session.commit()

    before = {
        resume.id: build_resume_snapshot(resume)
        for resume in db_session.scalars(select(Resume)).all()
    }
    canonical_id = find_canonical_resume_id(db_session, second)
    db_session.expire_all()
    after = {
        resume.id: build_resume_snapshot(resume)
        for resume in db_session.scalars(select(Resume)).all()
    }

    assert canonical_id == first.id
    assert before == after
    assert db_session.scalars(select(Resume)).all().__len__() == 2


def test_create_does_not_reuse_metadata_only_resume(client):
    token = register_and_login(client, "canonical-create@example.com")
    payload = {"title": "Same metadata", "template_id": 4, "template": "classic"}

    first = client.post("/api/v1/resumes", headers=auth_headers(token), json=payload)
    second = client.post("/api/v1/resumes", headers=auth_headers(token), json=payload)

    assert first.status_code == 201
    assert second.status_code == 201
    assert first.json()["id"] != second.json()["id"]

    listing = client.get("/api/v1/resumes", headers=auth_headers(token)).json()
    ids = [resume["id"] for resume in listing]
    assert len(ids) == len(set(ids))


def test_canonicalization_requires_ownership(client):
    owner_token = register_and_login(client, "canonical-owner@example.com")
    other_token = register_and_login(client, "canonical-unauthorized@example.com")
    owner_id = client.get("/api/v1/auth/me", headers=auth_headers(owner_token)).json()["id"]
    resume = client.post(
        "/api/v1/resumes",
        headers=auth_headers(owner_token),
        json={"title": "Owned", "template": "classic"},
    ).json()
    assert owner_id == resume["user_id"]

    response = client.post(
        f"/api/v1/resumes/{resume['id']}/canonicalize",
        headers=auth_headers(other_token),
    )

    assert response.status_code == 404
