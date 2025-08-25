from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, Text, Boolean, String
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class MeterReading(Base):
    __tablename__ = "meter_readings"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Reading values
    value = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False)  # kWh, m³, etc.
    
    # Reading metadata
    reading_type = Column(String(50), nullable=False)  # cumulative, instantaneous, peak
    quality = Column(String(20), nullable=True)  # good, bad, uncertain
    is_validated = Column(Boolean, default=False)
    
    # Timestamps
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Foreign keys
    meter_id = Column(Integer, ForeignKey("meters.id"), nullable=False)
    
    # Additional data (JSON string for flexibility)
    metadata = Column(Text, nullable=True)
    
    # Relationships
    meter = relationship("Meter", back_populates="readings")
