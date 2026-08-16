from app.core.security import hash_password, verify_password


def test_password_hashing_roundtrip():
    plain = "SuperSecret123!"
    hashed = hash_password(plain)
    assert hashed != plain
    assert verify_password(plain, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def _register_admin(client, email="admin@example.com", password="AdminPass123!"):
    resp = client.post(
        "/api/auth/register",
        json={"email": email, "password": password, "role": "ADMIN"},
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


def _create_estate_and_tenant(db_session):
    from app.models.estate import Estate
    from app.models.tenant import Tenant
    from app.models.enums import TenantProfileType

    estate = Estate(name="Coimbatore Demo Estate", latitude=11.0168, longitude=76.9558)
    db_session.add(estate)
    db_session.commit()
    db_session.refresh(estate)

    tenant = Tenant(
        estate_id=estate.id,
        name="Food Processing",
        profile_type=TenantProfileType.FOOD_PROCESSING,
    )
    db_session.add(tenant)
    db_session.commit()
    db_session.refresh(tenant)
    return estate, tenant


def test_register_admin_user(client):
    body = _register_admin(client)
    assert body["role"] == "ADMIN"
    assert body["tenant_id"] is None
    assert body["is_active"] is True


def test_register_tenant_requires_tenant_id(client):
    resp = client.post(
        "/api/auth/register",
        json={"email": "tenant@example.com", "password": "TenantPass123!", "role": "TENANT"},
    )
    assert resp.status_code == 422


def test_register_tenant_user_with_valid_tenant_id(client, db_session):
    _, tenant = _create_estate_and_tenant(db_session)
    resp = client.post(
        "/api/auth/register",
        json={
            "email": "tenant@example.com",
            "password": "TenantPass123!",
            "role": "TENANT",
            "tenant_id": tenant.id,
        },
    )
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["role"] == "TENANT"
    assert body["tenant_id"] == tenant.id


def test_register_duplicate_email_rejected(client):
    _register_admin(client)
    resp = client.post(
        "/api/auth/register",
        json={"email": "admin@example.com", "password": "AnotherPass123!", "role": "ADMIN"},
    )
    assert resp.status_code == 400


def test_login_success_and_me(client):
    _register_admin(client)
    login_resp = client.post(
        "/api/auth/login",
        data={"username": "admin@example.com", "password": "AdminPass123!"},
    )
    assert login_resp.status_code == 200, login_resp.text
    token = login_resp.json()["access_token"]

    me_resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "admin@example.com"


def test_login_wrong_password_rejected(client):
    _register_admin(client)
    resp = client.post(
        "/api/auth/login",
        data={"username": "admin@example.com", "password": "WrongPassword"},
    )
    assert resp.status_code == 401


def test_protected_route_without_token_rejected(client):
    resp = client.get("/api/auth/me")
    assert resp.status_code == 401


def test_admin_only_route_allows_admin_and_blocks_tenant(client, db_session):
    _register_admin(client)
    admin_token = client.post(
        "/api/auth/login",
        data={"username": "admin@example.com", "password": "AdminPass123!"},
    ).json()["access_token"]

    _, tenant = _create_estate_and_tenant(db_session)
    client.post(
        "/api/auth/register",
        json={
            "email": "tenant@example.com",
            "password": "TenantPass123!",
            "role": "TENANT",
            "tenant_id": tenant.id,
        },
    )
    tenant_token = client.post(
        "/api/auth/login",
        data={"username": "tenant@example.com", "password": "TenantPass123!"},
    ).json()["access_token"]

    admin_resp = client.get("/api/demo/admin-only", headers={"Authorization": f"Bearer {admin_token}"})
    assert admin_resp.status_code == 200

    tenant_blocked_resp = client.get(
        "/api/demo/admin-only", headers={"Authorization": f"Bearer {tenant_token}"}
    )
    assert tenant_blocked_resp.status_code == 403


def test_tenant_only_route_allows_tenant_and_blocks_admin(client, db_session):
    _register_admin(client)
    admin_token = client.post(
        "/api/auth/login",
        data={"username": "admin@example.com", "password": "AdminPass123!"},
    ).json()["access_token"]

    _, tenant = _create_estate_and_tenant(db_session)
    client.post(
        "/api/auth/register",
        json={
            "email": "tenant@example.com",
            "password": "TenantPass123!",
            "role": "TENANT",
            "tenant_id": tenant.id,
        },
    )
    tenant_token = client.post(
        "/api/auth/login",
        data={"username": "tenant@example.com", "password": "TenantPass123!"},
    ).json()["access_token"]

    tenant_resp = client.get("/api/demo/tenant-only", headers={"Authorization": f"Bearer {tenant_token}"})
    assert tenant_resp.status_code == 200
    assert tenant_resp.json()["tenant_id"] == tenant.id

    admin_blocked_resp = client.get(
        "/api/demo/tenant-only", headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert admin_blocked_resp.status_code == 403


def test_jwt_contains_role_and_tenant_claims(client, db_session):
    from app.core.security import decode_access_token

    _, tenant = _create_estate_and_tenant(db_session)
    client.post(
        "/api/auth/register",
        json={
            "email": "tenant2@example.com",
            "password": "TenantPass123!",
            "role": "TENANT",
            "tenant_id": tenant.id,
        },
    )
    token = client.post(
        "/api/auth/login",
        data={"username": "tenant2@example.com", "password": "TenantPass123!"},
    ).json()["access_token"]

    payload = decode_access_token(token)
    assert payload["role"] == "TENANT"
    assert payload["tenant_id"] == tenant.id
