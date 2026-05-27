from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from typing import Optional, List
from datetime import datetime, timedelta, timezone
import csv
import io
import re
from app.database import get_db
from app.models import Telemetry, Tenant, Site, Meter
from app.schemas.telemetry import (
    TelemetryCreate,
    TelemetryResponse,
    AnomalyItem,
)
from app.services.telemetry_validator import telemetry_validator, TelemetryValidationError
from app.services.anomaly_detector import detect_anomalies
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/telemetry", tags=["telemetry"])


def parse_range_string(range_str: str) -> tuple[datetime, datetime]:
    """Parse a simple relative time range like 24h, 7d, or 30d."""

    match = re.match(r'^(\d+)([hdm])$', range_str.lower())
    if not match:
        raise ValueError(f"Invalid range format: {range_str}. Expected format: '24h', '7d', '30d'")

    value = int(match.group(1))
    unit = match.group(2)
    end_time = datetime.now(timezone.utc)

    if unit == 'h':
        delta = timedelta(hours=value)
    elif unit == 'd':
        delta = timedelta(days=value)
    elif unit == 'm':
        delta = timedelta(minutes=value)
    else:
        raise ValueError(f"Unsupported time unit: {unit}. Use 'h', 'd', or 'm'")

    return end_time - delta, end_time


@router.post(
    "/",
    response_model=TelemetryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Ingest Telemetry Data",
    description="Submit raw telemetry data from IoT devices or meters",
    responses={
        201: {
            "description": "Telemetry data successfully stored",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "tenant_id": 1,
                        "site_id": 1,
                        "meter_id": 1,
                        "timestamp": "2024-01-15T10:30:00Z",
                        "kwh": 1234.56,
                        "voltage": 240.5,
                        "current": 15.2,
                        "power_factor": 0.95,
                        "power": None,
                        "frequency": None,
                        "temperature": None,
                        "data_quality": "good",
                        "is_validated": "N",
                        "created_at": "2024-01-15T10:30:05Z",
                        "updated_at": None
                    }
                }
            }
        },
        400: {
            "description": "Bad Request - Invalid or missing required fields",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Required field 'kwh' is missing or null"
                    }
                }
            }
        },
        422: {
            "description": "Validation Error - Invalid input data",
            "content": {
                "application/json": {
                    "example": {
                        "detail": [
                            {
                                "loc": ["body", "kwh"],
                                "msg": "kWh value cannot be negative",
                                "type": "value_error"
                            }
                        ]
                    }
                }
            }
        }
    }
)
async def create_telemetry(
    telemetry_data: TelemetryCreate,
    db: Session = Depends(get_db)
):
    """
    Ingest raw telemetry data from IoT devices or meters.
    
    **Required Fields:**
    - tenant_id: Tenant identifier
    - site_id: Site identifier
    - meter_id: Meter identifier
    - timestamp: Timestamp of the telemetry reading (ISO 8601 format)
    - kwh: Energy consumption in kilowatt-hours (must be >= 0)
    
    **Optional Fields:**
    - voltage: Voltage in volts (must be >= 0 if provided)
    - current: Current in amperes (must be >= 0 if provided)
    - power_factor: Power factor between 0.0 and 1.0
    
    **Returns:**
    - Created telemetry record with generated ID
    """
    try:
        # Validate foreign key relationships exist
        tenant = db.query(Tenant).filter(Tenant.id == telemetry_data.tenant_id).first()
        if not tenant:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tenant with ID {telemetry_data.tenant_id} does not exist"
            )
        
        site = db.query(Site).filter(Site.id == telemetry_data.site_id).first()
        if not site:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Site with ID {telemetry_data.site_id} does not exist"
            )
        
        meter = db.query(Meter).filter(Meter.id == telemetry_data.meter_id).first()
        if not meter:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Meter with ID {telemetry_data.meter_id} does not exist"
            )
        
        # Verify site belongs to tenant
        if site.tenant_id != telemetry_data.tenant_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Site {telemetry_data.site_id} does not belong to tenant {telemetry_data.tenant_id}"
            )
        
        # Verify meter belongs to site
        if meter.site_id != telemetry_data.site_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Meter {telemetry_data.meter_id} does not belong to site {telemetry_data.site_id}"
            )
        
        # Normalize and validate telemetry data using validation middleware
        # This ensures:
        # - Timestamps are converted to UTC ISO8601
        # - Numeric values are rounded to 3 decimal places
        # - Negative kWh values are rejected
        try:
            # Convert Pydantic model to dict for validator
            telemetry_dict = {
                'tenant_id': telemetry_data.tenant_id,
                'site_id': telemetry_data.site_id,
                'meter_id': telemetry_data.meter_id,
                'timestamp': telemetry_data.timestamp,
                'kwh': telemetry_data.kwh,
                'voltage': telemetry_data.voltage,
                'current': telemetry_data.current,
                'power_factor': telemetry_data.power_factor,
                'power': telemetry_data.power,
                'frequency': telemetry_data.frequency,
                'temperature': telemetry_data.temperature,
                'data_quality': telemetry_data.data_quality
            }
            
            # Validate and normalize using middleware layer
            normalized_data = telemetry_validator.validate_and_normalize(telemetry_dict)
            
        except TelemetryValidationError as e:
            # Log invalid record with details
            logger.warning(
                f"Telemetry validation failed: field={e.field}, value={e.value}, "
                f"message={e.message}, meter_id={telemetry_data.meter_id}"
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Validation error: {e.message}"
            )
        
        # Create telemetry record with normalized data
        db_telemetry = Telemetry(
            tenant_id=normalized_data['tenant_id'],
            site_id=normalized_data['site_id'],
            meter_id=normalized_data['meter_id'],
            timestamp=normalized_data['timestamp'],
            kwh=normalized_data['kwh'],
            voltage=normalized_data.get('voltage'),
            current=normalized_data.get('current'),
            power_factor=normalized_data.get('power_factor'),
            power=normalized_data.get('power'),
            frequency=normalized_data.get('frequency'),
            temperature=normalized_data.get('temperature'),
            data_quality=normalized_data.get('data_quality', 'good')
        )
        
        db.add(db_telemetry)
        db.commit()
        db.refresh(db_telemetry)
        
        logger.info(
            f"Telemetry data ingested (normalized): meter_id={normalized_data['meter_id']}, "
            f"timestamp={normalized_data['timestamp']}, kwh={normalized_data['kwh']}"
        )
        
        return db_telemetry
        
    except HTTPException:
        # Re-raise HTTP exceptions (validation errors)
        raise
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Database integrity error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Database constraint violation. Please check foreign key relationships."
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Unexpected error creating telemetry: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while storing telemetry data"
        )


@router.get(
    "/",
    response_model=List[TelemetryResponse],
    summary="Query Telemetry Data",
    description="Retrieve telemetry records with optional filtering by meter_id, site_id, tenant_id, and time range",
    responses={
        200: {
            "description": "List of telemetry records",
            "content": {
                "application/json": {
                    "example": [
                        {
                            "id": 1,
                            "tenant_id": 1,
                            "site_id": 1,
                            "meter_id": 1,
                            "timestamp": "2024-01-15T10:30:00Z",
                            "kwh": 1234.56,
                            "voltage": 240.5,
                            "current": 15.2,
                            "power_factor": 0.95,
                            "power": None,
                            "frequency": None,
                            "temperature": None,
                            "data_quality": "good",
                            "is_validated": "N",
                            "created_at": "2024-01-15T10:30:05Z",
                            "updated_at": None
                        }
                    ]
                }
            }
        },
        400: {
            "description": "Bad Request - Invalid query parameters",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Invalid query parameters"
                    }
                }
            }
        }
    }
)
async def get_telemetry(
    meter_id: Optional[int] = Query(None, description="Filter by meter ID", example=1),
    site_id: Optional[int] = Query(None, description="Filter by site ID", example=1),
    tenant_id: Optional[int] = Query(None, description="Filter by tenant ID", example=1),
    start_time: Optional[datetime] = Query(None, description="Start time for time range filter (ISO 8601)", example="2024-01-01T00:00:00Z"),
    end_time: Optional[datetime] = Query(None, description="End time for time range filter (ISO 8601)", example="2024-01-31T23:59:59Z"),
    limit: Optional[int] = Query(100, ge=1, le=1000, description="Maximum number of records to return", example=100),
    offset: Optional[int] = Query(0, ge=0, description="Number of records to skip", example=0),
    db: Session = Depends(get_db)
):
    """
    Query telemetry records with optional filtering.
    
    **Query Parameters:**
    - meter_id: Filter by meter ID (primary filter as per ticket requirements)
    - site_id: Filter by site ID
    - tenant_id: Filter by tenant ID
    - start_time: Start timestamp for time range (ISO 8601 format)
    - end_time: End timestamp for time range (ISO 8601 format)
    - limit: Maximum number of records (1-1000, default: 100)
    - offset: Number of records to skip (default: 0)
    
    **Returns:**
    - List of telemetry records matching the query criteria
    - Results are ordered by timestamp (descending) for time-series queries
    """
    try:
        # Build query
        query = db.query(Telemetry)
        
        # Apply filters
        if meter_id is not None:
            query = query.filter(Telemetry.meter_id == meter_id)
        
        if site_id is not None:
            query = query.filter(Telemetry.site_id == site_id)
        
        if tenant_id is not None:
            query = query.filter(Telemetry.tenant_id == tenant_id)
        
        if start_time is not None:
            query = query.filter(Telemetry.timestamp >= start_time)
        
        if end_time is not None:
            query = query.filter(Telemetry.timestamp <= end_time)
        
        # Validate time range
        if start_time is not None and end_time is not None:
            if start_time > end_time:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="start_time must be before end_time"
                )
        
        # Order by timestamp descending (most recent first) for time-series queries
        query = query.order_by(Telemetry.timestamp.desc())
        
        # Apply pagination
        query = query.offset(offset).limit(limit)
        
        # Execute query
        telemetry_records = query.all()
        
        logger.info(
            f"Telemetry query executed: meter_id={meter_id}, site_id={site_id}, "
            f"tenant_id={tenant_id}, limit={limit}, offset={offset}, "
            f"results={len(telemetry_records)}"
        )
        
        return telemetry_records
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Unexpected error querying telemetry: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while querying telemetry data"
        )


@router.get(
    "/anomalies",
    response_model=List[AnomalyItem],
    summary="Get recent telemetry anomalies",
    description="Return the latest telemetry anomalies using a simple previous-point deviation rule.",
)
async def get_recent_anomalies(
    meter_id: Optional[int] = Query(None, description="Filter by meter ID", example=1),
    site_id: Optional[int] = Query(None, description="Filter by site ID", example=1),
    range_str: str = Query(..., alias="range", description="Time range (e.g., '24h', '7d', '30d')", example="24h"),
    limit: int = Query(5, ge=1, le=5, description="Maximum number of anomalies to return", example=5),
    db: Session = Depends(get_db),
):
    """Fetch recent anomalies based on >20% kWh deviation from the previous point per meter."""

    try:
        if meter_id is None and site_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one of meter_id or site_id must be provided",
            )

        try:
            start_time, end_time = parse_range_string(range_str)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(exc),
            ) from exc

        query = (
            db.query(Telemetry)
            .options(joinedload(Telemetry.meter), joinedload(Telemetry.site))
            .filter(Telemetry.timestamp >= start_time, Telemetry.timestamp <= end_time)
        )

        if meter_id is not None:
            query = query.filter(Telemetry.meter_id == meter_id)

        if site_id is not None:
            query = query.filter(Telemetry.site_id == site_id)

        telemetry_records = query.order_by(Telemetry.timestamp.asc()).all()
        anomalies = detect_anomalies(telemetry_records)

        logger.info(
            f"Anomaly query executed: meter_id={meter_id}, site_id={site_id}, "
            f"range={range_str}, results={len(anomalies)}"
        )

        return anomalies[:limit]
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Unexpected error querying anomalies: {str(exc)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while querying anomalies",
        ) from exc


@router.post(
    "/import",
    summary="Bulk CSV Import",
    description="Upload CSV file with historical telemetry data for bulk import",
    responses={
        200: {
            "description": "CSV import completed",
            "content": {
                "application/json": {
                    "example": {
                        "total_rows": 1000,
                        "successful": 950,
                        "failed": 50,
                        "errors": [
                            {
                                "row_number": 5,
                                "field": "kwh",
                                "message": "kWh value cannot be negative",
                                "value": "-100"
                            }
                        ]
                    }
                }
            }
        },
        400: {
            "description": "Bad Request - Invalid file or missing required parameters",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "CSV file is required"
                    }
                }
            }
        }
    }
)
async def import_telemetry_csv(
    file: UploadFile = File(..., description="CSV file with telemetry data"),
    tenant_id: int = Form(..., description="Tenant ID for all records"),
    site_id: int = Form(..., description="Site ID for all records"),
    meter_id: int = Form(..., description="Meter ID for all records"),
    db: Session = Depends(get_db)
):
    """
    Import telemetry data from CSV file.
    
    **CSV Format:**
    - Required columns: timestamp, kwh
    - Optional columns: voltage, current, power_factor
    - Header row expected
    
    **Form Parameters:**
    - tenant_id: Tenant ID (applied to all records)
    - site_id: Site ID (applied to all records)
    - meter_id: Meter ID (applied to all records)
    
    **CSV Example:**
    ```
    timestamp,kwh,voltage,current,power_factor
    2024-01-15T10:30:00Z,1234.56,240.5,15.2,0.95
    2024-01-15T11:30:00Z,1250.10,240.3,15.5,0.94
    ```
    
    **Returns:**
    - Total rows processed
    - Number of successful inserts
    - Number of failed rows
    - List of errors for failed rows
    """
    # Validate file type
    if not file.filename or not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a CSV file"
        )
    
    # Validate foreign key relationships exist
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tenant with ID {tenant_id} does not exist"
        )
    
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Site with ID {site_id} does not exist"
        )
    
    meter = db.query(Meter).filter(Meter.id == meter_id).first()
    if not meter:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Meter with ID {meter_id} does not exist"
        )
    
    # Verify site belongs to tenant
    if site.tenant_id != tenant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Site {site_id} does not belong to tenant {tenant_id}"
        )
    
    # Verify meter belongs to site
    if meter.site_id != site_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Meter {meter_id} does not belong to site {site_id}"
        )
    
    # Read and parse CSV file
    try:
        contents = await file.read()
        file_content = io.StringIO(contents.decode('utf-8'))
        csv_reader = csv.DictReader(file_content)
        
        # Validate CSV has required columns
        required_columns = {'timestamp', 'kwh'}
        csv_columns = set(csv_reader.fieldnames or [])
        
        if not required_columns.issubset(csv_columns):
            missing = required_columns - csv_columns
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"CSV missing required columns: {', '.join(missing)}"
            )
        
        # Process rows
        valid_records = []
        errors = []
        total_rows = 0
        batch_size = 1000  # Insert in batches of 1000 for large files
        
        for row_num, row in enumerate(csv_reader, start=2):  # Start at 2 (1 is header)
            total_rows += 1
            
            try:
                # Prepare data dict with tenant/site/meter IDs
                telemetry_data = {
                    'tenant_id': tenant_id,
                    'site_id': site_id,
                    'meter_id': meter_id,
                    'timestamp': row.get('timestamp', '').strip(),
                    'kwh': row.get('kwh', '').strip(),
                    'voltage': row.get('voltage', '').strip() or None,
                    'current': row.get('current', '').strip() or None,
                    'power_factor': row.get('power_factor', '').strip() or None
                }
                
                # Validate and normalize using telemetry validator
                normalized_data = telemetry_validator.validate_and_normalize(telemetry_data)
                valid_records.append(normalized_data)
                
            except TelemetryValidationError as e:
                errors.append({
                    'row_number': row_num,
                    'field': e.field or 'unknown',
                    'message': e.message,
                    'value': str(e.value) if e.value is not None else None
                })
                logger.warning(f"CSV row {row_num} validation failed: {e.message}")
            except Exception as e:
                errors.append({
                    'row_number': row_num,
                    'field': 'general',
                    'message': f"Unexpected error: {str(e)}",
                    'value': None
                })
                logger.error(f"CSV row {row_num} unexpected error: {str(e)}", exc_info=True)
        
        # Batch insert valid records
        successful_count = 0
        if valid_records:
            try:
                # Insert in batches to handle large files efficiently
                for i in range(0, len(valid_records), batch_size):
                    batch = valid_records[i:i + batch_size]
                    
                    # Convert to dictionary format for bulk_insert_mappings (more efficient)
                    batch_dicts = []
                    for record in batch:
                        batch_dicts.append({
                            'tenant_id': record['tenant_id'],
                            'site_id': record['site_id'],
                            'meter_id': record['meter_id'],
                            'timestamp': record['timestamp'],
                            'kwh': record['kwh'],
                            'voltage': record.get('voltage'),
                            'current': record.get('current'),
                            'power_factor': record.get('power_factor'),
                            'data_quality': record.get('data_quality', 'good')
                        })
                    
                    # Bulk insert batch using bulk_insert_mappings for better performance
                    db.bulk_insert_mappings(Telemetry, batch_dicts)
                    db.commit()
                    successful_count += len(batch)
                    
                    logger.info(f"Inserted batch {i//batch_size + 1}: {len(batch)} records")
                
            except IntegrityError as e:
                db.rollback()
                logger.error(f"Database integrity error during bulk insert: {str(e)}")
                # Try individual inserts to identify problematic records
                successful_count = 0
                batch_errors = []
                
                for record in valid_records:
                    try:
                        telemetry_obj = Telemetry(
                            tenant_id=record['tenant_id'],
                            site_id=record['site_id'],
                            meter_id=record['meter_id'],
                            timestamp=record['timestamp'],
                            kwh=record['kwh'],
                            voltage=record.get('voltage'),
                            current=record.get('current'),
                            power_factor=record.get('power_factor'),
                            data_quality=record.get('data_quality', 'good')
                        )
                        db.add(telemetry_obj)
                        db.commit()
                        successful_count += 1
                    except Exception as e:
                        db.rollback()
                        batch_errors.append({
                            'row_number': 'unknown',
                            'field': 'database',
                            'message': f"Database error: {str(e)}",
                            'value': None
                        })
                        logger.warning(f"Failed to insert record: {str(e)}")
                
                errors.extend(batch_errors)
                
            except Exception as e:
                db.rollback()
                logger.error(f"Unexpected error during bulk insert: {str(e)}", exc_info=True)
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Error inserting records: {str(e)}"
                )
        
        logger.info(
            f"CSV import completed: total_rows={total_rows}, "
            f"successful={successful_count}, failed={len(errors)}"
        )
        
        return {
            "total_rows": total_rows,
            "successful": successful_count,
            "failed": len(errors),
            "errors": errors[:100] if len(errors) > 100 else errors  # Limit error details to 100
        }
        
    except HTTPException:
        raise
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CSV file must be UTF-8 encoded"
        )
    except Exception as e:
        logger.error(f"Unexpected error processing CSV: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing CSV file: {str(e)}"
        )
