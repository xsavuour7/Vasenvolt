from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime

class TelemetryCreate(BaseModel):
    """Schema for creating telemetry data"""
    tenant_id: int = Field(..., description="Tenant ID", example=1)
    site_id: int = Field(..., description="Site ID", example=1)
    meter_id: int = Field(..., description="Meter ID", example=1)
    timestamp: datetime = Field(..., description="Timestamp of the telemetry reading", example="2024-01-15T10:30:00Z")
    kwh: float = Field(..., description="Energy consumption in kilowatt-hours", example=1234.56)
    voltage: Optional[float] = Field(None, description="Voltage in volts", example=240.5)
    current: Optional[float] = Field(None, description="Current in amperes", example=15.2)
    power_factor: Optional[float] = Field(None, description="Power factor (0.0 to 1.0)", example=0.95)
    
    # Optional additional fields
    power: Optional[float] = Field(None, description="Instantaneous power in watts", example=3650.0)
    frequency: Optional[float] = Field(None, description="Frequency in Hz", example=50.0)
    temperature: Optional[float] = Field(None, description="Temperature in Celsius", example=25.5)
    data_quality: Optional[str] = Field("good", description="Data quality indicator", example="good")
    
    @validator('kwh')
    def validate_kwh(cls, v):
        if v < 0:
            raise ValueError('kWh value cannot be negative')
        return v
    
    @validator('voltage')
    def validate_voltage(cls, v):
        if v is not None and v < 0:
            raise ValueError('Voltage value cannot be negative')
        return v
    
    @validator('current')
    def validate_current(cls, v):
        if v is not None and v < 0:
            raise ValueError('Current value cannot be negative')
        return v
    
    @validator('power_factor')
    def validate_power_factor(cls, v):
        if v is not None and (v < 0 or v > 1):
            raise ValueError('Power factor must be between 0.0 and 1.0')
        return v
    
    @validator('power')
    def validate_power(cls, v):
        if v is not None and v < 0:
            raise ValueError('Power value cannot be negative')
        return v
    
    @validator('frequency')
    def validate_frequency(cls, v):
        if v is not None and v <= 0:
            raise ValueError('Frequency must be positive')
        return v
    
    @validator('data_quality')
    def validate_data_quality(cls, v):
        if v not in ['good', 'bad', 'uncertain']:
            raise ValueError('Data quality must be one of: good, bad, uncertain')
        return v

class TelemetryResponse(BaseModel):
    """Schema for telemetry response data"""
    id: int = Field(..., description="Telemetry record ID", example=1)
    tenant_id: int = Field(..., description="Tenant ID", example=1)
    site_id: int = Field(..., description="Site ID", example=1)
    meter_id: int = Field(..., description="Meter ID", example=1)
    timestamp: datetime = Field(..., description="Timestamp of the telemetry reading", example="2024-01-15T10:30:00Z")
    kwh: float = Field(..., description="Energy consumption in kilowatt-hours", example=1234.56)
    voltage: Optional[float] = Field(None, description="Voltage in volts", example=240.5)
    current: Optional[float] = Field(None, description="Current in amperes", example=15.2)
    power_factor: Optional[float] = Field(None, description="Power factor (0.0 to 1.0)", example=0.95)
    power: Optional[float] = Field(None, description="Instantaneous power in watts", example=3650.0)
    frequency: Optional[float] = Field(None, description="Frequency in Hz", example=50.0)
    temperature: Optional[float] = Field(None, description="Temperature in Celsius", example=25.5)
    data_quality: Optional[str] = Field(None, description="Data quality indicator", example="good")
    is_validated: str = Field(..., description="Validation status", example="N")
    created_at: datetime = Field(..., description="Record creation timestamp", example="2024-01-15T10:30:05Z")
    updated_at: Optional[datetime] = Field(None, description="Record update timestamp", example="2024-01-15T10:30:05Z")
    
    class Config:
        from_attributes = True

class TelemetryQuery(BaseModel):
    """Schema for telemetry query parameters"""
    meter_id: Optional[int] = Field(None, description="Filter by meter ID", example=1)
    site_id: Optional[int] = Field(None, description="Filter by site ID", example=1)
    tenant_id: Optional[int] = Field(None, description="Filter by tenant ID", example=1)
    start_time: Optional[datetime] = Field(None, description="Start time for time range filter", example="2024-01-01T00:00:00Z")
    end_time: Optional[datetime] = Field(None, description="End time for time range filter", example="2024-01-31T23:59:59Z")
    limit: Optional[int] = Field(100, description="Maximum number of records to return", example=100)
    offset: Optional[int] = Field(0, description="Number of records to skip", example=0)
    
    @validator('limit')
    def validate_limit(cls, v):
        if v is not None and (v < 1 or v > 1000):
            raise ValueError('Limit must be between 1 and 1000')
        return v
    
    @validator('offset')
    def validate_offset(cls, v):
        if v is not None and v < 0:
            raise ValueError('Offset cannot be negative')
        return v

class TelemetryBatchCreate(BaseModel):
    """Schema for batch telemetry creation"""
    telemetry_data: List[TelemetryCreate] = Field(..., description="List of telemetry records to create")
    
    @validator('telemetry_data')
    def validate_batch_size(cls, v):
        if len(v) > 1000:
            raise ValueError('Batch size cannot exceed 1000 records')
        if len(v) == 0:
            raise ValueError('Batch must contain at least one record')
        return v

class TelemetryStats(BaseModel):
    """Schema for telemetry statistics"""
    total_records: int = Field(..., description="Total number of telemetry records", example=1500)
    date_range: dict = Field(..., description="Date range of the data", example={"start": "2024-01-01T00:00:00Z", "end": "2024-01-31T23:59:59Z"})
    meters: List[int] = Field(..., description="List of meter IDs in the dataset", example=[1, 2, 3])
    sites: List[int] = Field(..., description="List of site IDs in the dataset", example=[1, 2])
    total_kwh: float = Field(..., description="Total energy consumption in kWh", example=123456.78)
    avg_voltage: Optional[float] = Field(None, description="Average voltage", example=240.2)
    avg_current: Optional[float] = Field(None, description="Average current", example=12.5)
    avg_power_factor: Optional[float] = Field(None, description="Average power factor", example=0.92)
