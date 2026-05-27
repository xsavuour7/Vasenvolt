"""
Tests for the tenant-scoped sites endpoint.
"""

from fastapi.testclient import TestClient

from app.auth.security import create_access_token, get_password_hash
from app.models import Site, Tenant, User


def auth_headers(user_id: int) -> dict[str, str]:
    access_token = create_access_token(data={"sub": str(user_id)})
    return {"Authorization": f"Bearer {access_token}"}


def create_user(db_session, tenant_id=None, email="site-user@example.com", username="siteuser"):
    user = User(
        email=email,
        username=username,
        hashed_password=get_password_hash("TestPass123!"),
        is_active=True,
        is_verified=True,
        tenant_id=tenant_id,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


class TestSitesEndpoint:
    def test_get_sites_requires_auth(self, client: TestClient):
        response = client.get("/api/sites")

        assert response.status_code == 401
        assert response.json()["detail"] == "Authentication required"

    def test_get_sites_returns_only_current_tenant_sites(
        self,
        client: TestClient,
        db_session,
        test_tenant,
        test_site,
    ):
        current_user = create_user(db_session, tenant_id=test_tenant.id)

        other_tenant = Tenant(name="Other Tenant", slug="other-tenant", is_active=True)
        db_session.add(other_tenant)
        db_session.commit()
        db_session.refresh(other_tenant)

        other_site = Site(
            name="Other Site",
            slug="other-site",
            tenant_id=other_tenant.id,
            is_active=True,
        )
        db_session.add(other_site)
        db_session.commit()

        response = client.get("/api/sites", headers=auth_headers(current_user.id))

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["id"] == test_site.id
        assert data[0]["name"] == test_site.name
        assert data[0]["slug"] == test_site.slug

    def test_get_sites_returns_sorted_sites(
        self,
        client: TestClient,
        db_session,
        test_tenant,
    ):
        current_user = create_user(
            db_session,
            tenant_id=test_tenant.id,
            email="sorted-sites@example.com",
            username="sortedsites",
        )

        zebra_site = Site(
            name="Zebra Site",
            slug="zebra-site",
            tenant_id=test_tenant.id,
            is_active=True,
        )
        alpha_site = Site(
            name="Alpha Site",
            slug="alpha-site",
            tenant_id=test_tenant.id,
            is_active=True,
        )
        db_session.add_all([zebra_site, alpha_site])
        db_session.commit()

        response = client.get("/api/sites", headers=auth_headers(current_user.id))

        assert response.status_code == 200
        data = response.json()
        assert [site["name"] for site in data] == ["Alpha Site", "Zebra Site"]

    def test_get_sites_returns_empty_list_for_user_without_tenant(
        self,
        client: TestClient,
        db_session,
    ):
        current_user = create_user(
            db_session,
            tenant_id=None,
            email="no-tenant-sites@example.com",
            username="notenantsites",
        )

        response = client.get("/api/sites", headers=auth_headers(current_user.id))

        assert response.status_code == 200
        assert response.json() == []
