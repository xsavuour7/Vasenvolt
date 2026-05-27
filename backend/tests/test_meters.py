"""
Tests for the tenant-scoped meters filter endpoint.
"""

from fastapi.testclient import TestClient

from app.auth.security import create_access_token, get_password_hash
from app.models import Meter, MeterStatus, MeterType, Site, Tenant, User


def auth_headers(user_id: int) -> dict[str, str]:
    access_token = create_access_token(data={"sub": str(user_id)})
    return {"Authorization": f"Bearer {access_token}"}


def create_user(db_session, tenant_id=None, email="meter-user@example.com", username="meteruser"):
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


class TestMetersEndpoint:
    def test_get_meters_requires_auth(self, client: TestClient):
        response = client.get("/api/meters")

        assert response.status_code == 401
        assert response.json()["detail"] == "Authentication required"

    def test_get_meters_returns_only_current_tenant_meters(
        self,
        client: TestClient,
        db_session,
        test_tenant,
        test_site,
        test_meter,
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
        db_session.refresh(other_site)

        other_meter = Meter(
            name="Other Meter",
            serial_number="OTHER-METER-001",
            meter_type=MeterType.ELECTRICITY,
            status=MeterStatus.ACTIVE,
            site_id=other_site.id,
        )
        db_session.add(other_meter)
        db_session.commit()

        response = client.get("/api/meters", headers=auth_headers(current_user.id))

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["id"] == test_meter.id
        assert data[0]["site_id"] == test_site.id
        assert data[0]["site"]["id"] == test_site.id
        assert data[0]["site"]["name"] == test_site.name

    def test_get_meters_can_filter_by_site(
        self,
        client: TestClient,
        db_session,
        test_tenant,
        test_site,
    ):
        current_user = create_user(
            db_session,
            tenant_id=test_tenant.id,
            email="site-filter@example.com",
            username="sitefilter",
        )

        second_site = Site(
            name="Second Site",
            slug="second-site",
            tenant_id=test_tenant.id,
            is_active=True,
        )
        db_session.add(second_site)
        db_session.commit()
        db_session.refresh(second_site)

        first_meter = Meter(
            name="First Meter",
            serial_number="FIRST-METER-001",
            meter_type=MeterType.ELECTRICITY,
            status=MeterStatus.ACTIVE,
            site_id=test_site.id,
        )
        second_meter = Meter(
            name="Second Meter",
            serial_number="SECOND-METER-001",
            meter_type=MeterType.ELECTRICITY,
            status=MeterStatus.ACTIVE,
            site_id=second_site.id,
        )
        db_session.add_all([first_meter, second_meter])
        db_session.commit()

        response = client.get(
            f"/api/meters?site_id={second_site.id}",
            headers=auth_headers(current_user.id),
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["id"] == second_meter.id
        assert data[0]["site"]["id"] == second_site.id

    def test_get_meters_returns_empty_list_for_user_without_tenant(
        self,
        client: TestClient,
        db_session,
    ):
        current_user = create_user(
            db_session,
            tenant_id=None,
            email="no-tenant@example.com",
            username="notenant",
        )

        response = client.get("/api/meters", headers=auth_headers(current_user.id))

        assert response.status_code == 200
        assert response.json() == []
