def test_create_profile(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "profile@example.com",
            "password": "TestPassword123!",
        },
    )

    assert response.status_code == 201

    login_response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "profile@example.com",
            "password": "TestPassword123!",
        },
    )

    token = login_response.json()["access_token"]

    response = client.post(
        "/api/v1/profile",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "first_name": "Tejas",
            "last_name": "Diware",
            "phone": "+919876543210",
            "professional_title": "Java Backend Developer",
            "summary": "Backend developer building scalable applications.",
            "location": "Pune, India",
            "linkedin_url": "https://linkedin.com/in/example",
            "github_url": "https://github.com/example",
            "portfolio_url": "https://example.com",
        },
    )

    assert response.status_code == 201

    data = response.json()

   
    assert data["first_name"] == "Tejas"
    assert data["last_name"] == "Diware"
    assert data["professional_title"] == "Java Backend Developer"

def test_get_profile(client):
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "get-profile@example.com",
            "password": "TestPassword123!",
        },
    )

    login_response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "get-profile@example.com",
            "password": "TestPassword123!",
        },
    )

    token = login_response.json()["access_token"]

    client.post(
        "/api/v1/profile",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "first_name": "Tejas",
            "last_name": "Diware",
        },
    )

    response = client.get(
        "/api/v1/profile",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["first_name"] == "Tejas"
    assert data["last_name"] == "Diware"   

def test_update_profile(client):
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "update-profile@example.com",
            "password": "TestPassword123!",
        },
    )

    login_response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "update-profile@example.com",
            "password": "TestPassword123!",
        },
    )

    token = login_response.json()["access_token"]

    client.post(
        "/api/v1/profile",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "first_name": "Tejas",
            "last_name": "Diware",
            "professional_title": "Java Developer",
        },
    )

    response = client.put(
        "/api/v1/profile",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "professional_title": "Senior Java Backend Developer",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["professional_title"] == "Senior Java Backend Developer"
    assert data["first_name"] == "Tejas"
    assert data["last_name"] == "Diware"   

def test_delete_profile(client):
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "delete-profile@example.com",
            "password": "TestPassword123!",
        },
    )

    login_response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "delete-profile@example.com",
            "password": "TestPassword123!",
        },
    )

    token = login_response.json()["access_token"]

    client.post(
        "/api/v1/profile",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "first_name": "Tejas",
            "last_name": "Diware",
        },
    )

    response = client.delete(
        "/api/v1/profile",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 204

    response = client.get(
        "/api/v1/profile",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 404     