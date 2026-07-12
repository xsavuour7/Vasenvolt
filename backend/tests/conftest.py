"""
Shared pytest fixtures for telemetry tests
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timezone
import os

from app.models import Tenant, Meter, MeterType, MeterStatus, MeterReading, Site, Telemetry, RefreshToken, User 
from app.database import Base, get_db
from main import app
# Import all models to ensure tables are created
from app import models

# Use SQLite for testing (faster and no external dependencies)
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_telemetry.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={
        "check_same_thread": False,
        # Enable foreign key constraints in SQLite (disabled by default)
        "timeout": 20
    },
    # Enable foreign key support via event listener
    echo=False
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Enable foreign key constraints for SQLite
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_conn, connection_record):
    """Enable foreign key constraints in SQLite"""
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


def override_get_db():
    """Override database dependency for testing"""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


# Override database dependency for telemetry tests
# Note: This may conflict with test_auth.py's override, but pytest will handle it
app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database for each test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    """Create a test client."""
    return TestClient(app)


@pytest.fixture
def test_tenant(db_session):
    """Create a test tenant."""
    tenant = Tenant(
        name="Test Tenant",
        slug="test-tenant",
        description="Test tenant for telemetry tests",
        is_active=True
    )
    db_session.add(tenant)
    db_session.commit()
    db_session.refresh(tenant)
    return tenant


@pytest.fixture
def test_site(db_session, test_tenant):
    """Create a test site."""
    site = Site(
        name="Test Site",
        slug="test-site",
        description="Test site for telemetry tests",
        address="123 Test St",
        city="Test City",
        state="Test State",
        country="Test Country",
        postal_code="12345",
        latitude=40.7128,
        longitude=-74.0060,
        site_type="commercial",
        total_area=1000.0,
        is_active=True,
        tenant_id=test_tenant.id
    )
    db_session.add(site)
    db_session.commit()
    db_session.refresh(site)
    return site


@pytest.fixture
def test_meter(db_session, test_site):
    """Create a test meter."""
    meter = Meter(
        name="Test Meter",
        serial_number="TEST-METER-001",
        model="Test Model",
        manufacturer="Test Manufacturer",
        meter_type=MeterType.ELECTRICITY,
        status=MeterStatus.ACTIVE,
        voltage_rating=240.0,
        current_rating=100.0,
        power_rating=24000.0,
        accuracy_class="0.5",
        communication_protocol="MQTT",
        ip_address="192.168.1.100",
        port=1883,
        site_id=test_site.id
    )
    db_session.add(meter)
    db_session.commit()
    db_session.refresh(meter)
    return meter


@pytest.fixture
def sample_telemetry_data(test_tenant, test_site, test_meter):
    """Sample telemetry data for testing."""
    return {
        "tenant_id": test_tenant.id,
        "site_id": test_site.id,
        "meter_id": test_meter.id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "kwh": 1234.56,
        "voltage": 240.5,
        "current": 15.2,
        "power_factor": 0.95
    }


@pytest.fixture
def sample_csv_content():
    """Sample CSV content for testing."""
    return """timestamp,kwh,voltage,current,power_factor
2024-01-15T10:00:00Z,1000.0,240.0,10.0,0.9
2024-01-15T11:00:00Z,1100.0,241.0,11.0,0.91
2024-01-15T12:00:00Z,1200.0,242.0,12.0,0.92"""

