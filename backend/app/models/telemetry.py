from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, String, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Telemetry(Base):
    __tablename__ = "telemetry"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Required fields from the API specification
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    site_id = Column(Integer, ForeignKey("sites.id"), nullable=False, index=True)
    meter_id = Column(Integer, ForeignKey("meters.id"), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    
    # Energy consumption data
    kwh = Column(Float, nullable=False)  # Energy consumption in kilowatt-hours
    voltage = Column(Float, nullable=True)  # Voltage in volts
    current = Column(Float, nullable=True)  # Current in amperes
    power_factor = Column(Float, nullable=True)  # Power factor (0.0 to 1.0)
    
    # Additional telemetry data that might be useful
    power = Column(Float, nullable=True)  # Instantaneous power in watts
    frequency = Column(Float, nullable=True)  # Frequency in Hz
    temperature = Column(Float, nullable=True)  # Temperature in Celsius
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Data quality indicators
    data_quality = Column(String(20), nullable=True)  # good, bad, uncertain
    is_validated = Column(String(1), default='N')  # Y/N flag for data validation
    
    # Relationships
    tenant = relationship("Tenant", back_populates="telemetry")
    site = relationship("Site", back_populates="telemetry")
    meter = relationship("Meter", back_populates="telemetry")
    
    # Composite indexes for efficient time-series queries
    __table_args__ = (
        Index('idx_telemetry_meter_timestamp', 'meter_id', 'timestamp'),
        Index('idx_telemetry_site_timestamp', 'site_id', 'timestamp'),
        Index('idx_telemetry_tenant_timestamp', 'tenant_id', 'timestamp'),
        Index('idx_telemetry_timestamp_range', 'timestamp'),
    )
