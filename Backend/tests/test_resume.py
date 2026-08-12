def register_and_login(client, email: str):
    register_response = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": "TestPassword123!",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/api/v1/auth/login",
        data={
            "username": email,
            "password": "TestPassword123!",
        },
    )

    assert login_response.status_code == 200

    return login_response.json()["access_token"]


def auth_headers(token: str):
    return {
        "Authorization": f"Bearer {token}",
    }


def create_resume(client, token: str, title: str = "Java Backend Resume"):
    response = client.post(
        "/api/v1/resumes",
        headers=auth_headers(token),
        json={
            "title": title,
            "template": "professional",
        },
    )

    assert response.status_code == 201

    return response.json()


def test_create_resume(client):
    token = register_and_login(
        client,
        "resume-create@example.com",
    )

    response = client.post(
        "/api/v1/resumes",
        headers=auth_headers(token),
        json={
            "title": "Java Backend Resume",
            "template": "professional",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["title"] == "Java Backend Resume"
    assert data["template"] == "professional"
    assert data["status"] == "draft"
    assert "user_id" in data
    assert "id" in data


def test_get_resumes(client):
    token = register_and_login(
        client,
        "resume-list@example.com",
    )

    create_resume(
        client,
        token,
        "Java Resume",
    )

    create_resume(
        client,
        token,
        "Python Resume",
    )

    response = client.get(
        "/api/v1/resumes",
        headers=auth_headers(token),
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2
    assert data[0]["title"] == "Python Resume"
    assert data[1]["title"] == "Java Resume"


def test_get_single_resume(client):
    token = register_and_login(
        client,
        "resume-single@example.com",
    )

    resume = create_resume(
        client,
        token,
        "Single Resume",
    )

    response = client.get(
        f"/api/v1/resumes/{resume['id']}",
        headers=auth_headers(token),
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == resume["id"]
    assert data["title"] == "Single Resume"


def test_update_resume(client):
    token = register_and_login(
        client,
        "resume-update@example.com",
    )

    resume = create_resume(
        client,
        token,
        "Old Resume Title",
    )

    response = client.put(
        f"/api/v1/resumes/{resume['id']}",
        headers=auth_headers(token),
        json={
            "title": "Updated Resume Title",
            "template": "modern",
            "status": "completed",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["title"] == "Updated Resume Title"
    assert data["template"] == "modern"
    assert data["status"] == "completed"


def test_delete_resume(client):
    token = register_and_login(
        client,
        "resume-delete@example.com",
    )

    resume = create_resume(
        client,
        token,
        "Resume To Delete",
    )

    response = client.delete(
        f"/api/v1/resumes/{resume['id']}",
        headers=auth_headers(token),
    )

    assert response.status_code == 204

    get_response = client.get(
        f"/api/v1/resumes/{resume['id']}",
        headers=auth_headers(token),
    )

    assert get_response.status_code == 404


def test_resume_requires_authentication(client):
    response = client.get("/api/v1/resumes")

    assert response.status_code == 401


def test_user_cannot_access_another_users_resume(client):
    user_a_token = register_and_login(
        client,
        "resume-user-a@example.com",
    )

    user_b_token = register_and_login(
        client,
        "resume-user-b@example.com",
    )

    resume = create_resume(
        client,
        user_a_token,
        "User A Resume",
    )

    response = client.get(
        f"/api/v1/resumes/{resume['id']}",
        headers=auth_headers(user_b_token),
    )

    assert response.status_code == 404


def test_user_cannot_update_another_users_resume(client):
    user_a_token = register_and_login(
        client,
        "resume-update-a@example.com",
    )

    user_b_token = register_and_login(
        client,
        "resume-update-b@example.com",
    )

    resume = create_resume(
        client,
        user_a_token,
        "User A Resume",
    )

    response = client.put(
        f"/api/v1/resumes/{resume['id']}",
        headers=auth_headers(user_b_token),
        json={
            "title": "Hacked Resume",
        },
    )

    assert response.status_code == 404


def test_user_cannot_delete_another_users_resume(client):
    user_a_token = register_and_login(
        client,
        "resume-delete-a@example.com",
    )

    user_b_token = register_and_login(
        client,
        "resume-delete-b@example.com",
    )

    resume = create_resume(
        client,
        user_a_token,
        "User A Resume",
    )

    response = client.delete(
        f"/api/v1/resumes/{resume['id']}",
        headers=auth_headers(user_b_token),
    )

    assert response.status_code == 404

    response = client.get(
        f"/api/v1/resumes/{resume['id']}",
        headers=auth_headers(user_a_token),
    )

    assert response.status_code == 200