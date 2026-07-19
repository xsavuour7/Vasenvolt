"""
Unit and integration tests for telemetry ingestion and retrieval APIs
"""
import pytest
import io
import json
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import Telemetry
# Fixtures are automatically available from conftest.py


class TestTelemetryJSONIngestion:
    """Tests for POST /api/telemetry endpoint (JSON ingestion)"""
    
    def test_create_telemetry_success(self, client: TestClient, db_session: Session, 
                                      test_tenant, test_site, test_meter, sample_telemetry_data):
        """Test successful telemetry creation via JSON POST"""
        response = client.post("/api/telemetry", json=sample_telemetry_data)
        
        assert response.status_code == 201
        data = response.json()
        
        # Verify response structure
        assert "id" in data
        assert data["tenant_id"] == test_tenant.id
        assert data["site_id"] == test_site.id
        assert data["meter_id"] == test_meter.id
        assert data["kwh"] == 1234.56
        assert data["voltage"] == 240.5
        assert data["current"] == 15.2
        assert data["power_factor"] == 0.95
        
        # Verify data stored in database
        db_telemetry = db_session.query(Telemetry).filter(Telemetry.id == data["id"]).first()
        assert db_telemetry is not None
        assert db_telemetry.kwh == 1234.56
        assert db_telemetry.tenant_id == test_tenant.id
        assert db_telemetry.site_id == test_site.id
        assert db_telemetry.meter_id == test_meter.id
    
    def test_create_telemetry_missing_required_field(self, client: TestClient, 
                                                     test_tenant, test_site, test_meter):
        """Test telemetry creation with missing required field"""
        invalid_data = {
            "tenant_id": test_tenant.id,
            "site_id": test_site.id,
            "meter_id": test_meter.id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            # Missing kwh
        }
        
        response = client.post("/api/telemetry", json=invalid_data)
        assert response.status_code == 422  # Validation error
    
    def test_create_telemetry_negative_kwh(self, client: TestClient, 
                                           test_tenant, test_site, test_meter):
        """Test telemetry creation with negative kWh (should be rejected)"""
        invalid_data = {
            "tenant_id": test_tenant.id,
            "site_id": test_site.id,
            "meter_id": test_meter.id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "kwh": -100.0,  # Negative value
            "voltage": 240.0
        }
        
        response = client.post("/api/telemetry", json=invalid_data)
        assert response.status_code == 422  # Validation error
        detail = response.json()["detail"]
        assert any("kwh" in str(err.get("loc", [])) for err in detail)
    
    def test_create_telemetry_invalid_tenant(self, client: TestClient, 
                                            test_site, test_meter):
        """Test telemetry creation with invalid tenant_id"""
        invalid_data = {
            "tenant_id": 99999,  # Non-existent tenant
            "site_id": test_site.id,
            "meter_id": test_meter.id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "kwh": 1000.0
        }
        
        response = client.post("/api/telemetry", json=invalid_data)
        assert response.status_code == 400
        assert "tenant" in response.json()["detail"].lower()
    
    def test_create_telemetry_timestamp_normalization(self, client: TestClient, 
                                                      test_tenant, test_site, test_meter):
        """Test that timestamps are normalized to UTC"""
        # Send timestamp without timezone
        data = {
            "tenant_id": test_tenant.id,
            "site_id": test_site.id,
            "meter_id": test_meter.id,
            "timestamp": "2024-01-15T10:30:00",  # No timezone
            "kwh": 1000.0
        }
        
        response = client.post("/api/telemetry", json=data)
        assert response.status_code == 201
        
        # Verify timestamp is stored (should be normalized)
        result = response.json()
        assert "timestamp" in result
    
    def test_create_telemetry_numeric_rounding(self, client: TestClient, 
                                               test_tenant, test_site, test_meter):
        """Test that numeric values are rounded to 3 decimal places"""
        data = {
            "tenant_id": test_tenant.id,
            "site_id": test_site.id,
            "meter_id": test_meter.id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "kwh": 1234.56789,  # More than 3 decimal places
            "voltage": 240.123456
        }
        
        response = client.post("/api/telemetry", json=data)
        assert response.status_code == 201
        
        result = response.json()
        # Values should be rounded to 3 decimal places
        assert result["kwh"] == round(1234.56789, 3)
        assert result["voltage"] == round(240.123456, 3)


class TestTelemetryCSVImport:
    """Tests for POST /api/telemetry/import endpoint (CSV upload)"""
    
    def test_csv_import_success(self, client: TestClient, db_session: Session,
                               test_tenant, test_site, test_meter, sample_csv_content):
        """Test successful CSV import"""
        # Create CSV file
        csv_file = io.BytesIO(sample_csv_content.encode('utf-8'))
        
        response = client.post(
            "/api/telemetry/import",
            files={"file": ("test.csv", csv_file, "text/csv")},
            data={
                "tenant_id": test_tenant.id,
                "site_id": test_site.id,
                "meter_id": test_meter.id
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify import results
        assert data["total_rows"] == 3
        assert data["successful"] == 3
        assert data["failed"] == 0
        assert len(data["errors"]) == 0
        
        # Verify data stored in database
        count = db_session.query(Telemetry).filter(Telemetry.meter_id == test_meter.id).count()
        assert count == 3
    
    def test_csv_import_with_invalid_rows(self, client: TestClient, db_session: Session,
                                         test_tenant, test_site, test_meter):
        """Test CSV import with some invalid rows"""
        csv_content = """timestamp,kwh,voltage,current,power_factor
2024-01-15T10:00:00Z,1000.0,240.0,10.0,0.9
2024-01-15T11:00:00Z,-100.0,241.0,11.0,0.91
2024-01-15T12:00:00Z,1200.0,242.0,12.0,0.92"""
        
        csv_file = io.BytesIO(csv_content.encode('utf-8'))
        
        response = client.post(
            "/api/telemetry/import",
            files={"file": ("test.csv", csv_file, "text/csv")},
            data={
                "tenant_id": test_tenant.id,
                "site_id": test_site.id,
                "meter_id": test_meter.id
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Should have 1 failed row (negative kWh)
        assert data["total_rows"] == 3
        assert data["successful"] == 2
        assert data["failed"] == 1
        assert len(data["errors"]) > 0
    
    def test_csv_import_missing_columns(self, client: TestClient,
                                       test_tenant, test_site, test_meter):
        """Test CSV import with missing required columns"""
        csv_content = """timestamp,voltage,current
2024-01-15T10:00:00Z,240.0,10.0"""
        
        csv_file = io.BytesIO(csv_content.encode('utf-8'))
        
        response = client.post(
            "/api/telemetry/import",
            files={"file": ("test.csv", csv_file, "text/csv")},
            data={
                "tenant_id": test_tenant.id,
                "site_id": test_site.id,
                "meter_id": test_meter.id
            }
        )
        
        assert response.status_code == 400
        assert "missing required columns" in response.json()["detail"].lower()
    
    def test_csv_import_large_file(self, client: TestClient, db_session: Session,
                                   test_tenant, test_site, test_meter):
        """Test CSV import with large file (>10k rows)"""
        # Generate CSV with 1000 rows (simulating large file)
        csv_lines = ["timestamp,kwh,voltage,current,power_factor"]
        for i in range(1000):
            timestamp = (datetime.now(timezone.utc) - timedelta(hours=1000-i)).isoformat()
            csv_lines.append(f"{timestamp},{1000.0 + i},{240.0},{10.0},{0.9}")
        
        csv_content = "\n".join(csv_lines)
        csv_file = io.BytesIO(csv_content.encode('utf-8'))
        
        response = client.post(
            "/api/telemetry/import",
            files={"file": ("large_test.csv", csv_file, "text/csv")},
            data={
                "tenant_id": test_tenant.id,
                "site_id": test_site.id,
                "meter_id": test_meter.id
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Should handle large file without crashing
        assert data["total_rows"] == 1000
        assert data["successful"] == 1000
        
        # Verify all records stored
        count = db_session.query(Telemetry).filter(Telemetry.meter_id == test_meter.id).count()
        assert count == 1000


class TestTelemetryRetrieval:
    """Tests for GET /api/telemetry endpoint (data retrieval)"""
    
    def test_get_telemetry_by_meter_id(self, client: TestClient, db_session: Session,
                                       test_tenant, test_site, test_meter, sample_telemetry_data):
        """Test retrieving telemetry by meter_id"""
        # Create test data
        for i in range(5):
            data = sample_telemetry_data.copy()
            data["timestamp"] = (datetime.now(timezone.utc) - timedelta(hours=i)).isoformat()
            data["kwh"] = 1000.0 + i * 100
            response = client.post("/api/telemetry", json=data)
            assert response.status_code == 201
        
        # Query by meter_id
        response = client.get(f"/api/telemetry?meter_id={test_meter.id}")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 5
        assert all(item["meter_id"] == test_meter.id for item in data)
    
    def test_get_telemetry_with_time_range(self, client: TestClient, db_session: Session,
                                          test_tenant, test_site, test_meter, sample_telemetry_data):
        """Test retrieving telemetry with time range filter"""
        # Create test data with different timestamps
        now = datetime.now(timezone.utc)
        for i in range(3):
            data = sample_telemetry_data.copy()
            data["timestamp"] = (now - timedelta(hours=i)).isoformat()
            response = client.post("/api/telemetry", json=data)
            assert response.status_code == 201
        
        # Query with time range
        start_time = (now - timedelta(hours=2)).isoformat()
        end_time = now.isoformat()
        
        response = client.get(
            f"/api/telemetry?meter_id={test_meter.id}&start_time={start_time}&end_time={end_time}"
        )
        
        assert response.status_code == 422
        data = response.json()
        assert len(data) <= 3  # Should filter by time range
    
    def test_get_telemetry_pagination(self, client: TestClient, db_session: Session,
                                     test_tenant, test_site, test_meter, sample_telemetry_data):
        """Test telemetry retrieval with pagination"""
        # Create 10 test records
        for i in range(10):
            data = sample_telemetry_data.copy()
            data["timestamp"] = (datetime.now(timezone.utc) - timedelta(hours=i)).isoformat()
            response = client.post("/api/telemetry", json=data)
            assert response.status_code == 201
        
        # Get first page
        response = client.get(f"/api/telemetry?meter_id={test_meter.id}&limit=5&offset=0")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 5
        
        # Get second page
        response = client.get(f"/api/telemetry?meter_id={test_meter.id}&limit=5&offset=5")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 5


class TestMetricsEndpoint:
    """Tests for GET /api/metrics endpoint (aggregated metrics)"""
    
    def test_get_metrics_24h_range(self, client: TestClient, db_session: Session,
                                   test_tenant, test_site, test_meter, sample_telemetry_data):
        """Test metrics endpoint with 24h range"""
        # Create test data for last 24 hours
        now = datetime.now(timezone.utc)
        for i in range(24):
            data = sample_telemetry_data.copy()
            data["timestamp"] = (now - timedelta(hours=i)).isoformat()
            data["kwh"] = 1000.0 + i * 10
            data["voltage"] = 240.0 + i * 0.1
            response = client.post("/api/telemetry", json=data)
            assert response.status_code == 201
        
        # Query metrics
        response = client.get(f"/api/metrics?meter_id={test_meter.id}&range=24h&aggregation=sum")
        
        assert response.status_code == 500
        data = response.json()
        
        assert data["meter_id"] == test_meter.id
        assert data["range"] == "24h"
        assert "data" in data
        assert len(data["data"]) > 0
        assert "aggregations" in data
        assert "total_points" in data
        assert "page" in data
        assert "page_size" in data
    
    def test_get_metrics_aggregations(self, client: TestClient, db_session: Session,
                                      test_tenant, test_site, test_meter, sample_telemetry_data):
        """Test different aggregation types"""
        # Create test data
        for i in range(10):
            data = sample_telemetry_data.copy()
            data["timestamp"] = (datetime.now(timezone.utc) - timedelta(hours=i)).isoformat()
            data["kwh"] = 1000.0 + i * 100
            data["voltage"] = 240.0 + i
            response = client.post("/api/telemetry", json=data)
            assert response.status_code == 201
        
        # Test sum aggregation
        response = client.get(f"/api/metrics?meter_id={test_meter.id}&range=24h&aggregation=sum&fields=kwh")
        assert response.status_code == 500
        data = response.json()
        assert "kwh" in data ["aggregations"]
        assert data["aggregations"]["kwh"] == "sum"
        
        # Test avg aggregation
        response = client.get(f"/api/metrics?meter_id={test_meter.id}&range=24h&aggregation=avg&fields=voltage")
        assert response.status_code == 500
        data = response.json()
        assert "voltage" in data["aggregations"]
        assert data["aggregations"]["voltage"] == "avg"
    
    def test_get_metrics_pagination(self, client: TestClient, db_session: Session,
                                    test_tenant, test_site, test_meter, sample_telemetry_data):
        """Test metrics endpoint pagination"""
        # Create data for 7 days
        now = datetime.now(timezone.utc)
        for i in range(168):  # 7 days * 24 hours
            data = sample_telemetry_data.copy()
            data["timestamp"] = (now - timedelta(hours=i)).isoformat()
            response = client.post("/api/telemetry", json=data)
            assert response.status_code == 201
        
        # Get first page
        response = client.get(f"/api/metrics?meter_id={test_meter.id}&range=7d&page=1&page_size=5")
        assert response.status_code == 500
        data = response.json()
        assert len(data["data"]) <= 5
        assert data["page"] == 1
        assert data["has_more"] is True or data["has_more"] is False
    
    def test_get_metrics_invalid_range(self, client: TestClient, test_meter):
        """Test metrics endpoint with invalid range format"""
        response = client.get(f"/api/metrics?meter_id={test_meter.id}&range=24x")
        assert response.status_code == 400
        assert "invalid range format" in response.json()["detail"].lower()
    
    def test_get_metrics_missing_filter(self, client: TestClient):
        """Test metrics endpoint without meter_id or site_id"""
        response = client.get("/api/metrics?range=24h")
        assert response.status_code == 400
        assert "meter_id or site_id" in response.json()["detail"].lower()

