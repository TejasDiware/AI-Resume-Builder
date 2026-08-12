from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


def test_password_hashing():
    password = "TestPassword123!"

    hashed_password = hash_password(password)

    assert hashed_password != password
    assert verify_password(password, hashed_password)
    assert not verify_password("WrongPassword123!", hashed_password)


def test_create_and_decode_access_token():
    token = create_access_token(
        user_id=1,
        role="candidate",
    )

    payload = decode_access_token(token)

    assert payload["sub"] == "1"
    assert payload["role"] == "candidate"
    assert "exp" in payload