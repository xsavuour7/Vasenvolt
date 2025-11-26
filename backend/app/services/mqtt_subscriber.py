"""
MQTT Subscriber Service for Telemetry Ingestion

Subscribes to MQTT topics following the pattern: tenant/site/meter/data
Parses JSON payloads and stores telemetry data in the database.
"""

import json
import logging
import threading
import time
from datetime import datetime
from typing import Dict, Any, Optional
import paho.mqtt.client as mqtt
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from config import settings
from app.database import SessionLocal
from app.models import Telemetry, Tenant, Site, Meter
from app.services.telemetry_validator import telemetry_validator, TelemetryValidationError

logger = logging.getLogger(__name__)


class MQTTSubscriber:
    """MQTT subscriber for telemetry data ingestion"""
    
    def __init__(self):
        self.mqtt_settings = settings.get_mqtt_settings()
        self.client: Optional[mqtt.Client] = None
        self.is_connected = False
        self.is_running = False
        self.reconnect_thread: Optional[threading.Thread] = None
        self._stop_event = threading.Event()
        
    def _on_connect(self, client, userdata, flags, rc):
        """Callback when MQTT client connects"""
        if rc == 0:
            self.is_connected = True
            logger.info(f"MQTT client connected to {self.mqtt_settings.broker_host}:{self.mqtt_settings.broker_port}")
            
            # Subscribe to telemetry topics
            # Topic pattern: tenant/site/meter/data (required)
            # Optional: {prefix}/tenant/site/meter/data
            topic_pattern = "+/+/+/data"  # tenant/site/meter/data
            
            client.subscribe(topic_pattern, qos=1)
            
            # Also subscribe to prefixed pattern if prefix is configured
            if self.mqtt_settings.topic_prefix:
                topic_pattern_prefixed = f"{self.mqtt_settings.topic_prefix}/+/+/+/data"
                client.subscribe(topic_pattern_prefixed, qos=1)
                logger.info(f"Subscribed to MQTT topics: {topic_pattern}, {topic_pattern_prefixed}")
            else:
                logger.info(f"Subscribed to MQTT topic: {topic_pattern}")
        else:
            self.is_connected = False
            error_messages = {
                1: "Connection refused - incorrect protocol version",
                2: "Connection refused - invalid client identifier",
                3: "Connection refused - server unavailable",
                4: "Connection refused - bad username or password",
                5: "Connection refused - not authorised"
            }
            error_msg = error_messages.get(rc, f"Connection failed with code {rc}")
            logger.error(f"MQTT connection failed: {error_msg}")
    
    def _on_disconnect(self, client, userdata, rc):
        """Callback when MQTT client disconnects"""
        self.is_connected = False
        if rc != 0:
            logger.warning(f"MQTT client disconnected unexpectedly (rc={rc})")
        else:
            logger.info("MQTT client disconnected")
    
    def _on_message(self, client, userdata, msg):
        """Callback when MQTT message is received"""
        try:
            start_time = time.time()
            
            # Parse topic structure: tenant/site/meter/data
            topic_parts = msg.topic.split('/')
            
            # Handle topic patterns:
            # - prefix/tenant/site/meter/data (5 parts)
            # - tenant/site/meter/data (4 parts)
            if len(topic_parts) == 5:
                # Has prefix
                _, tenant_id_str, site_id_str, meter_id_str, _ = topic_parts
            elif len(topic_parts) == 4:
                # No prefix
                tenant_id_str, site_id_str, meter_id_str, _ = topic_parts
            else:
                logger.warning(f"Invalid topic structure: {msg.topic} (expected tenant/site/meter/data)")
                return
            
            # Parse IDs from topic
            try:
                tenant_id = int(tenant_id_str)
                site_id = int(site_id_str)
                meter_id = int(meter_id_str)
            except ValueError as e:
                logger.warning(f"Invalid ID format in topic {msg.topic}: {e}")
                return
            
            # Parse JSON payload
            try:
                payload = json.loads(msg.payload.decode('utf-8'))
            except json.JSONDecodeError as e:
                logger.warning(f"Invalid JSON payload in topic {msg.topic}: {e}")
                return
            
            # Process message
            self._process_telemetry_message(tenant_id, site_id, meter_id, payload)
            
            # Log processing time
            processing_time = time.time() - start_time
            if processing_time > 2.0:
                logger.warning(f"Message processing took {processing_time:.2f}s (target: <2s)")
            else:
                logger.debug(f"Message processed in {processing_time:.2f}s")
                
        except Exception as e:
            logger.error(f"Error processing MQTT message from topic {msg.topic}: {e}", exc_info=True)
    
    def _process_telemetry_message(self, tenant_id: int, site_id: int, meter_id: int, payload: Dict[str, Any]):
        """Process telemetry message and store in database"""
        db: Session = SessionLocal()
        try:
            # Validate foreign key relationships exist
            tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
            if not tenant:
                logger.warning(f"Tenant {tenant_id} not found, skipping message")
                return
            
            site = db.query(Site).filter(Site.id == site_id).first()
            if not site:
                logger.warning(f"Site {site_id} not found, skipping message")
                return
            
            meter = db.query(Meter).filter(Meter.id == meter_id).first()
            if not meter:
                logger.warning(f"Meter {meter_id} not found, skipping message")
                return
            
            # Verify relationships
            if site.tenant_id != tenant_id:
                logger.warning(f"Site {site_id} does not belong to tenant {tenant_id}, skipping message")
                return
            
            if meter.site_id != site_id:
                logger.warning(f"Meter {meter_id} does not belong to site {site_id}, skipping message")
                return
            
            # Prepare telemetry data with IDs from topic
            telemetry_data = {
                'tenant_id': tenant_id,
                'site_id': site_id,
                'meter_id': meter_id,
                'timestamp': payload.get('timestamp'),
                'kwh': payload.get('kwh'),
                'voltage': payload.get('voltage'),
                'current': payload.get('current'),
                'power_factor': payload.get('power_factor')
            }
            
            # Validate and normalize using telemetry validator
            try:
                normalized_data = telemetry_validator.validate_and_normalize(telemetry_data)
            except TelemetryValidationError as e:
                logger.warning(f"Telemetry validation failed for meter {meter_id}: {e.message}")
                return
            
            # Create telemetry record
            db_telemetry = Telemetry(
                tenant_id=normalized_data['tenant_id'],
                site_id=normalized_data['site_id'],
                meter_id=normalized_data['meter_id'],
                timestamp=normalized_data['timestamp'],
                kwh=normalized_data['kwh'],
                voltage=normalized_data.get('voltage'),
                current=normalized_data.get('current'),
                power_factor=normalized_data.get('power_factor'),
                data_quality=normalized_data.get('data_quality', 'good')
            )
            
            db.add(db_telemetry)
            db.commit()
            db.refresh(db_telemetry)
            
            logger.debug(
                f"Telemetry stored from MQTT: meter_id={meter_id}, "
                f"timestamp={normalized_data['timestamp']}, kwh={normalized_data['kwh']}"
            )
            
        except IntegrityError as e:
            db.rollback()
            logger.error(f"Database integrity error storing MQTT telemetry: {str(e)}")
        except Exception as e:
            db.rollback()
            logger.error(f"Error storing MQTT telemetry: {str(e)}", exc_info=True)
        finally:
            db.close()
    
    def _reconnect_loop(self):
        """Background thread to handle reconnection"""
        while not self._stop_event.is_set():
            if not self.is_connected and self.is_running:
                try:
                    logger.info(f"Attempting to reconnect to MQTT broker...")
                    self.client.reconnect()
                except Exception as e:
                    logger.warning(f"Reconnection attempt failed: {e}")
            
            # Wait for reconnect delay or stop event
            self._stop_event.wait(self.mqtt_settings.reconnect_delay)
    
    def start(self):
        """Start MQTT subscriber"""
        if not self.mqtt_settings.enabled:
            logger.info("MQTT subscriber is disabled in configuration")
            return
        
        if self.is_running:
            logger.warning("MQTT subscriber is already running")
            return
        
        try:
            # Create MQTT client
            self.client = mqtt.Client(
                client_id=self.mqtt_settings.client_id,
                clean_session=True
            )
            
            # Set callbacks
            self.client.on_connect = self._on_connect
            self.client.on_disconnect = self._on_disconnect
            self.client.on_message = self._on_message
            
            # Configure authentication
            if self.mqtt_settings.username and self.mqtt_settings.password:
                self.client.username_pw_set(
                    self.mqtt_settings.username,
                    self.mqtt_settings.password
                )
            
            # Configure TLS
            if self.mqtt_settings.use_tls:
                import ssl
                context = ssl.create_default_context(ssl.Purpose.SERVER_AUTH)
                
                if self.mqtt_settings.ca_cert_path:
                    context.load_verify_locations(self.mqtt_settings.ca_cert_path)
                else:
                    context.check_hostname = False
                    context.verify_mode = ssl.CERT_NONE
                
                if self.mqtt_settings.client_cert_path and self.mqtt_settings.client_key_path:
                    context.load_cert_chain(
                        self.mqtt_settings.client_cert_path,
                        self.mqtt_settings.client_key_path
                    )
                
                self.client.tls_set_context(context)
                logger.info("TLS enabled for MQTT connection")
            
            # Connect to broker
            self.is_running = True
            self.client.connect_async(
                self.mqtt_settings.broker_host,
                self.mqtt_settings.broker_port,
                keepalive=self.mqtt_settings.keepalive
            )
            
            # Start client loop in background thread
            self.client.loop_start()
            
            # Start reconnection thread
            self._stop_event.clear()
            self.reconnect_thread = threading.Thread(
                target=self._reconnect_loop,
                daemon=True,
                name="MQTT-Reconnect"
            )
            self.reconnect_thread.start()
            
            logger.info(
                f"MQTT subscriber started (broker: {self.mqtt_settings.broker_host}:{self.mqtt_settings.broker_port})"
            )
            
        except Exception as e:
            self.is_running = False
            logger.error(f"Failed to start MQTT subscriber: {e}", exc_info=True)
            raise
    
    def stop(self):
        """Stop MQTT subscriber"""
        if not self.is_running:
            return
        
        logger.info("Stopping MQTT subscriber...")
        
        self.is_running = False
        self._stop_event.set()
        
        if self.client:
            try:
                self.client.loop_stop()
                self.client.disconnect()
            except Exception as e:
                logger.warning(f"Error disconnecting MQTT client: {e}")
        
        if self.reconnect_thread and self.reconnect_thread.is_alive():
            self.reconnect_thread.join(timeout=5)
        
        logger.info("MQTT subscriber stopped")


# Global MQTT subscriber instance
mqtt_subscriber = MQTTSubscriber()

