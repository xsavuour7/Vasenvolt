from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class SiteOut(BaseModel):
    """Minimal site information returned with a meter."""

    id: int = Field(..., description="Site ID", example=1)
    name: str = Field(..., description="Site name", example="Main Campus")
    slug: Optional[str] = Field(None, description="Site slug", example="main-campus")

    class Config:
        from_attributes = True


class MeterOut(BaseModel):
    """Meter response used by the site/meter filter UI."""

    id: int = Field(..., description="Meter ID", example=1)
    name: str = Field(..., description="Meter name", example="Building A Main Meter")
    serial_number: str = Field(..., description="Meter serial number", example="SN-001")
    model: Optional[str] = Field(None, description="Meter model", example="SmartMeter Pro")
    manufacturer: Optional[str] = Field(None, description="Meter manufacturer", example="VasenVolt")
    meter_type: str = Field(..., description="Meter type", example="electricity")
    status: str = Field(..., description="Meter status", example="active")
    voltage_rating: Optional[float] = Field(None, description="Voltage rating", example=240.0)
    current_rating: Optional[float] = Field(None, description="Current rating", example=100.0)
    power_rating: Optional[float] = Field(None, description="Power rating", example=24000.0)
    accuracy_class: Optional[str] = Field(None, description="Accuracy class", example="0.5")
    installation_date: Optional[datetime] = Field(None, description="Installation date")
    last_calibration: Optional[datetime] = Field(None, description="Last calibration date")
    next_calibration: Optional[datetime] = Field(None, description="Next calibration date")
    communication_protocol: Optional[str] = Field(None, description="Communication protocol", example="MQTT")
    ip_address: Optional[str] = Field(None, description="Meter IP address", example="192.168.1.100")
    port: Optional[int] = Field(None, description="Meter network port", example=1883)
    site_id: int = Field(..., description="Associated site ID", example=1)
    site: SiteOut = Field(..., description="Associated site")
    created_at: datetime = Field(..., description="Meter creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Meter update timestamp")

    class Config:
        from_attributes = True
