"""
Tests for anomaly detection and anomaly preview endpoint.
"""

from datetime import datetime, timedelta, timezone

from app.models import Meter, MeterStatus, MeterType, Telemetry
from app.services.anomaly_detector import calculate_deviation_percent, detect_anomalies


def create_telemetry_record(db_session, *, tenant_id, site_id, meter_id, timestamp, kwh):
    telemetry = Telemetry(
        tenant_id=tenant_id,
        site_id=site_id,
        meter_id=meter_id,
        timestamp=timestamp,
        kwh=kwh,
        data_quality="good",
    )
    db_session.add(telemetry)
    db_session.commit()
    db_session.refresh(telemetry)
    return telemetry


class TestAnomalyDetector:
    def test_calculate_deviation_percent_handles_zero_baseline(self):
        assert calculate_deviation_percent(0, 50) == 100.0
        assert calculate_deviation_percent(0, 0) == 0.0

    def test_detect_anomalies_groups_by_meter(self, db_session, test_tenant, test_site, test_meter):
        second_meter = Meter(
            name="Second Meter",
            serial_number="SECOND-METER-ANOM-001",
            meter_type=MeterType.ELECTRICITY,
            status=MeterStatus.ACTIVE,
            site_id=test_site.id,
        )
        db_session.add(second_meter)
        db_session.commit()
        db_session.refresh(second_meter)

        base_time = datetime.now(timezone.utc) - timedelta(hours=4)
        meter_one_records = [
            create_telemetry_record(
                db_session,
                tenant_id=test_tenant.id,
                site_id=test_site.id,
                meter_id=test_meter.id,
                timestamp=base_time,
                kwh=100.0,
            ),
            create_telemetry_record(
                db_session,
                tenant_id=test_tenant.id,
                site_id=test_site.id,
                meter_id=test_meter.id,
                timestamp=base_time + timedelta(hours=1),
                kwh=130.0,
            ),
        ]
        meter_two_records = [
            create_telemetry_record(
                db_session,
                tenant_id=test_tenant.id,
                site_id=test_site.id,
                meter_id=second_meter.id,
                timestamp=base_time + timedelta(minutes=30),
                kwh=1000.0,
            ),
            create_telemetry_record(
                db_session,
                tenant_id=test_tenant.id,
                site_id=test_site.id,
                meter_id=second_meter.id,
                timestamp=base_time + timedelta(hours=1, minutes=30),
                kwh=1050.0,
            ),
        ]

        for record in meter_one_records + meter_two_records:
            record.meter = test_meter if record.meter_id == test_meter.id else second_meter
            record.site = test_site

        anomalies = detect_anomalies(meter_one_records + meter_two_records)

        assert len(anomalies) == 1
        assert anomalies[0]["meter_id"] == test_meter.id
        assert anomalies[0]["deviation_percent"] == 30.0


class TestAnomalyEndpoint:
    def test_get_anomalies_requires_filter(self, client):
        response = client.get("/api/telemetry/anomalies?range=24h")

        assert response.status_code == 400
        assert "meter_id or site_id" in response.json()["detail"]

    def test_get_anomalies_returns_latest_five(self, client, db_session, test_tenant, test_site, test_meter):
        base_time = datetime.now(timezone.utc) - timedelta(hours=10)
        kwh_sequence = [100.0, 130.0, 90.0, 120.0, 80.0, 110.0, 70.0]

        for index, kwh in enumerate(kwh_sequence):
            create_telemetry_record(
                db_session,
                tenant_id=test_tenant.id,
                site_id=test_site.id,
                meter_id=test_meter.id,
                timestamp=base_time + timedelta(hours=index),
                kwh=kwh,
            )

        response = client.get(f"/api/telemetry/anomalies?meter_id={test_meter.id}&range=24h")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 5
        timestamps = [item["timestamp"] for item in data]
        assert timestamps == sorted(timestamps, reverse=True)
        assert all(item["meter_id"] == test_meter.id for item in data)

    def test_get_anomalies_site_filter_returns_meter_metadata(
        self,
        client,
        db_session,
        test_tenant,
        test_site,
        test_meter,
    ):
        base_time = datetime.now(timezone.utc) - timedelta(hours=3)
        create_telemetry_record(
            db_session,
            tenant_id=test_tenant.id,
            site_id=test_site.id,
            meter_id=test_meter.id,
            timestamp=base_time,
            kwh=100.0,
        )
        create_telemetry_record(
            db_session,
            tenant_id=test_tenant.id,
            site_id=test_site.id,
            meter_id=test_meter.id,
            timestamp=base_time + timedelta(hours=1),
            kwh=140.0,
        )

        response = client.get(f"/api/telemetry/anomalies?site_id={test_site.id}&range=24h&limit=5")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["meter_name"] == test_meter.name
        assert data[0]["site_name"] == test_site.name
