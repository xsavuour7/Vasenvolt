"""
Unit and integration tests for MQTT telemetry ingestion
"""
import pytest
import json
from datetime import datetime, timezone
from unittest.mock import Mock, patch, MagicMock
from sqlalchemy.orm import Session

from app.services.mqtt_subscriber import MQTTSubscriber
from app.models import Telemetry
# Fixtures are automatically available from conftest.py


class TestMQTTIngestion:
    """Tests for MQTT message ingestion"""
    
    @pytest.fixture
    def mock_mqtt_client(self):
        """Mock MQTT client"""
        mock_client = Mock()
        mock_client.is_connected.return_value = True
        return mock_client
    
    @pytest.fixture
    def sample_mqtt_message(self, test_tenant, test_site, test_meter):
        """Sample MQTT message payload"""
        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "kwh": 1234.56,
            "voltage": 240.5,
            "current": 15.2,
            "power_factor": 0.95
        }
    
    @patch('app.services.mqtt_subscriber.SessionLocal')
    def test_mqtt_message_processing(self, mock_session_local, db_session: Session, 
                                     test_tenant, test_site, test_meter):
        """Test that MQTT message is processed and stored in database"""
        # Mock SessionLocal to return test session
        mock_session_local.return_value = db_session
        
        subscriber = MQTTSubscriber()
        
        # Create mock MQTT message
        topic = f"{test_tenant.id}/{test_site.id}/{test_meter.id}/data"
        payload = json.dumps({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "kwh": 1234.56,
            "voltage": 240.5,
            "current": 15.2,
            "power_factor": 0.95
        })
        
        # Create mock message object
        mock_msg = Mock()
        mock_msg.topic = topic
        mock_msg.payload = payload.encode('utf-8')
        
        # Process message
        subscriber._process_telemetry_message(test_tenant.id, test_site.id, test_meter.id, json.loads(payload))
        
        # Verify data stored in database
        db_telemetry = db_session.query(Telemetry).filter(
            Telemetry.meter_id == test_meter.id
        ).first()
        
        assert db_telemetry is not None
        assert db_telemetry.kwh == 1234.56
        assert db_telemetry.tenant_id == test_tenant.id
        assert db_telemetry.site_id == test_site.id
        assert db_telemetry.meter_id == test_meter.id
    
    def test_mqtt_message_invalid_topic(self, db_session: Session):
        """Test MQTT message with invalid topic structure"""
        subscriber = MQTTSubscriber()
        
        mock_msg = Mock()
        mock_msg.topic = "invalid/topic/structure"
        mock_msg.payload = json.dumps({"kwh": 1000.0}).encode('utf-8')
        
        # Should not crash, just log warning and return early
        subscriber._on_message(None, None, mock_msg)
        
        # No data should be stored (invalid topic structure)
        count = db_session.query(Telemetry).count()
        assert count == 0
    
    def test_mqtt_message_invalid_json(self, db_session: Session, test_tenant, test_site, test_meter):
        """Test MQTT message with invalid JSON payload"""
        subscriber = MQTTSubscriber()
        
        topic = f"{test_tenant.id}/{test_site.id}/{test_meter.id}/data"
        mock_msg = Mock()
        mock_msg.topic = topic
        mock_msg.payload = b"invalid json"
        
        # Should not crash, just log warning and return early
        subscriber._on_message(None, None, mock_msg)
        
        # No data should be stored (invalid JSON)
        count = db_session.query(Telemetry).filter(
            Telemetry.meter_id == test_meter.id
        ).count()
        assert count == 0
    
    @patch('app.services.mqtt_subscriber.SessionLocal')
    def test_mqtt_message_validation_error(self, mock_session_local, db_session: Session, 
                                          test_tenant, test_site, test_meter):
        """Test MQTT message with validation error (negative kWh)"""
        mock_session_local.return_value = db_session
        
        subscriber = MQTTSubscriber()
        
        payload = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "kwh": -100.0,  # Invalid: negative value
            "voltage": 240.0
        }
        
        # Process message directly (bypassing topic parsing)
        subscriber._process_telemetry_message(test_tenant.id, test_site.id, test_meter.id, payload)
        
        # No data should be stored (validation failed)
        count = db_session.query(Telemetry).filter(
            Telemetry.meter_id == test_meter.id
        ).count()
        assert count == 0
    
    @patch('app.services.mqtt_subscriber.SessionLocal')
    def test_mqtt_message_timestamp_normalization(self, mock_session_local, db_session: Session, 
                                                  test_tenant, test_site, test_meter):
        """Test that MQTT message timestamps are normalized to UTC"""
        mock_session_local.return_value = db_session
        
        subscriber = MQTTSubscriber()
        
        # Timestamp without timezone
        payload = {
            "timestamp": "2024-01-15T10:30:00",  # No timezone
            "kwh": 1000.0
        }
        
        # Process message directly
        subscriber._process_telemetry_message(test_tenant.id, test_site.id, test_meter.id, payload)
        
        # Verify data stored (timestamp should be normalized)
        db_telemetry = db_session.query(Telemetry).filter(
            Telemetry.meter_id == test_meter.id
        ).first()
        
        assert db_telemetry is not None
        assert db_telemetry.timestamp is not None
        # Verify timestamp is timezone-aware (UTC)
        assert db_telemetry.timestamp.tzinfo is not None
    
    @patch('app.services.mqtt_subscriber.mqtt.Client')
    @patch('app.services.mqtt_subscriber.settings')
    def test_mqtt_subscriber_start(self, mock_settings, mock_mqtt_client_class):
        """Test MQTT subscriber startup"""
        # Mock settings to enable MQTT
        mock_mqtt_settings = Mock()
        mock_mqtt_settings.enabled = True
        mock_mqtt_settings.broker_host = 'localhost'
        mock_mqtt_settings.broker_port = 1883
        mock_mqtt_settings.username = ''
        mock_mqtt_settings.password = ''
        mock_mqtt_settings.use_tls = False
        mock_mqtt_settings.ca_cert_path = ''
        mock_mqtt_settings.client_cert_path = ''
        mock_mqtt_settings.client_key_path = ''
        mock_mqtt_settings.topic_prefix = ''
        mock_mqtt_settings.client_id = 'test-client'
        mock_mqtt_settings.keepalive = 60
        mock_mqtt_settings.reconnect_delay = 10
        
        mock_settings.get_mqtt_settings.return_value = mock_mqtt_settings
        
        mock_client_instance = Mock()
        mock_mqtt_client_class.return_value = mock_client_instance
        
        subscriber = MQTTSubscriber()
        subscriber.start()
        
        # Verify client was created and configured
        assert subscriber.client is not None
        assert subscriber.is_running is True
    
    def test_mqtt_subscriber_stop(self):
        """Test MQTT subscriber shutdown"""
        subscriber = MQTTSubscriber()
        subscriber.is_running = True
        subscriber.client = Mock()
        subscriber.reconnect_thread = Mock()
        subscriber.reconnect_thread.is_alive.return_value = False
        
        subscriber.stop()
        
        assert subscriber.is_running is False

