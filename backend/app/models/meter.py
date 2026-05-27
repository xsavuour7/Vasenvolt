from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Float, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class MeterType(enum.Enum):
    ELECTRICITY = "electricity"
    WATER = "water"
    GAS = "gas"
    HEAT = "heat"
    SOLAR = "solar"

class MeterStatus(enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"
    OFFLINE = "offline"

class Meter(Base):
    __tablename__ = "meters"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    serial_number = Column(String(100), unique=True, nullable=False, index=True)
    model = Column(String(100), nullable=True)
    manufacturer = Column(String(100), nullable=True)
    
    # Meter specifications
    meter_type = Column(Enum(MeterType), nullable=False)
    status = Column(Enum(MeterStatus), default=MeterStatus.ACTIVE)
    
    # Technical details
    voltage_rating = Column(Float, nullable=True)  # in volts
    current_rating = Column(Float, nullable=True)  # in amperes
    power_rating = Column(Float, nullable=True)    # in watts
    accuracy_class = Column(String(50), nullable=True)
    
    # Installation details
    installation_date = Column(DateTime(timezone=True), nullable=True)
    last_calibration = Column(DateTime(timezone=True), nullable=True)
    next_calibration = Column(DateTime(timezone=True), nullable=True)
    
    # Communication
    communication_protocol = Column(String(100), nullable=True)  # Modbus, MQTT, etc.
    ip_address = Column(String(45), nullable=True)  # IPv4 or IPv6
    port = Column(Integer, nullable=True)
    
    # Foreign keys
    site_id = Column(Integer, ForeignKey("sites.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    site = relationship("Site", back_populates="meters")
    readings = relationship("MeterReading", back_populates="meter")
    telemetry = relationship("Telemetry", back_populates="meter")
