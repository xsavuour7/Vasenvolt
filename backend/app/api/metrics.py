from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
from datetime import datetime, timedelta, timezone
import re
import logging

from app.database import get_db
from app.models import Telemetry
from app.schemas.telemetry import MetricsResponse, MetricsDataPoint

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["metrics"])


def parse_range(range_str: str) -> tuple[datetime, datetime]:
    """
    Parse range string (e.g., '24h', '7d', '30d') into start and end datetime.
    
    Args:
        range_str: Range string like '24h', '7d', '30d'
        
    Returns:
        tuple: (start_time, end_time) in UTC
    """
    end_time = datetime.now(timezone.utc)
    
    # Parse range string (e.g., '24h', '7d', '30d')
    match = re.match(r'^(\d+)([hdm])$', range_str.lower())
    if not match:
        raise ValueError(f"Invalid range format: {range_str}. Expected format: '24h', '7d', '30d'")
    
    value = int(match.group(1))
    unit = match.group(2)
    
    if unit == 'h':
        delta = timedelta(hours=value)
    elif unit == 'd':
        delta = timedelta(days=value)
    elif unit == 'm':
        delta = timedelta(minutes=value)
    else:
        raise ValueError(f"Unsupported time unit: {unit}. Use 'h' (hours), 'd' (days), or 'm' (minutes)")
    
    start_time = end_time - delta
    return start_time, end_time


@router.get(
    "/metrics",
    response_model=MetricsResponse,
    summary="Get Telemetry Metrics",
    description="Fetch aggregated telemetry data for dashboard charts with timeseries format",
    responses={
        200: {
            "description": "Metrics data in timeseries format",
            "content": {
                "application/json": {
                    "example": {
                        "meter_id": 123,
                        "site_id": 1,
                        "range": "24h",
                        "start_time": "2024-01-15T00:00:00Z",
                        "end_time": "2024-01-15T23:59:59Z",
                        "aggregations": {"kwh": "sum", "voltage": "avg"},
                        "data": [
                            {
                                "timestamp": "2024-01-15T10:00:00Z",
                                "kwh": 1234.56,
                                "voltage": 240.5,
                                "current": 15.2,
                                "power_factor": 0.95
                            }
                        ],
                        "total_points": 24,
                        "page": 1,
                        "page_size": 100,
                        "has_more": False
                    }
                }
            }
        },
        400: {
            "description": "Bad Request - Invalid parameters",
            "content": {
                "application/json": {
                    "example": {"detail": "Invalid range format: 24x. Expected format: '24h', '7d', '30d'"}
                }
            }
        }
    }
)
async def get_metrics(
    meter_id: Optional[int] = Query(None, description="Filter by meter ID", example=123),
    site_id: Optional[int] = Query(None, description="Filter by site ID", example=1),
    range_str: str = Query(..., alias="range", description="Time range (e.g., '24h', '7d', '30d')", example="24h"),
    aggregation: str = Query("sum", description="Aggregation type: sum, avg, min, max", example="sum"),
    fields: Optional[str] = Query(None, description="Fields to aggregate (comma-separated): kwh,voltage,current,power_factor,power", example="kwh,voltage"),
    page: int = Query(1, ge=1, description="Page number", example=1),
    page_size: int = Query(100, ge=1, le=1000, description="Number of data points per page", example=100),
    db: Session = Depends(get_db)
):
    """
    Get telemetry metrics for dashboard charts.
    
    **Query Parameters:**
    - meter_id: Filter by meter ID (optional, but meter_id or site_id required)
    - site_id: Filter by site ID (optional, but meter_id or site_id required)
    - range: Time range (required) - format: '24h', '7d', '30d', '60m', etc.
    - aggregation: Aggregation type - 'sum', 'avg', 'min', 'max' (default: 'sum')
    - fields: Comma-separated fields to aggregate (default: all fields)
    - page: Page number (default: 1)
    - page_size: Points per page (default: 100, max: 1000)
    
    **Aggregations:**
    - sum: Sum of values (for kwh, power)
    - avg: Average of values (for voltage, current, power_factor)
    - min: Minimum value
    - max: Maximum value
    
    **Returns:**
    - Timeseries data in JSON format suitable for charts
    - Paginated results for large datasets
    """
    try:
        # Parse range string
        try:
            start_time, end_time = parse_range(range_str)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
        
        # Validate at least one filter is provided
        if meter_id is None and site_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one of meter_id or site_id must be provided"
            )
        
        # Parse aggregation and fields
        aggregation = aggregation.lower()
        if aggregation not in ['sum', 'avg', 'min', 'max']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid aggregation: {aggregation}. Must be one of: sum, avg, min, max"
            )
        
        # Default fields if not specified
        if fields:
            requested_fields = [f.strip() for f in fields.split(',')]
            valid_fields = ['kwh', 'voltage', 'current', 'power_factor', 'power']
            requested_fields = [f for f in requested_fields if f in valid_fields]
            if not requested_fields:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid fields. Must be one or more of: {', '.join(valid_fields)}"
                )
        else:
            requested_fields = ['kwh', 'voltage', 'current', 'power_factor', 'power']
        
        # Build base query
        query = db.query(Telemetry).filter(
            Telemetry.timestamp >= start_time,
            Telemetry.timestamp <= end_time
        )
        
        # Apply filters
        if meter_id is not None:
            query = query.filter(Telemetry.meter_id == meter_id)
        
        if site_id is not None:
            query = query.filter(Telemetry.site_id == site_id)
        
        # Determine time grouping interval based on range
        # For ranges <= 24h, group by hour; for >24h, group by day
        total_hours = (end_time - start_time).total_seconds() / 3600
        dialect_name = db.bind.dialect.name

        if dialect_name == "sqlite":
            if total_hours <= 24:
                time_group = func.strftime('%Y-%m-%d %H:00:00', Telemetry.timestamp)
                interval_desc = "hour"
            else:
                time_group = func.strftime('%Y-%m-%d 00:00:00', Telemetry.timestamp)
                interval_desc = "day"
        else:
            if total_hours <= 24:
                time_group = func.date_trunc('hour', Telemetry.timestamp)
                interval_desc = "hour"
            else:
                time_group = func.date_trunc('day', Telemetry.timestamp)
                interval_desc = "day"
        
        # Build aggregation query
        select_fields = [time_group.label('timestamp')]
        aggregations_dict = {}
        
        # Map aggregation function
        agg_func_map = {
            'sum': func.sum,
            'avg': func.avg,
            'min': func.min,
            'max': func.max
        }
        agg_func = agg_func_map[aggregation]
        
        # Add aggregations for requested fields
        if 'kwh' in requested_fields:
            select_fields.append(agg_func(Telemetry.kwh).label('kwh'))
            aggregations_dict['kwh'] = aggregation
        
        if 'voltage' in requested_fields:
            select_fields.append(agg_func(Telemetry.voltage).label('voltage'))
            aggregations_dict['voltage'] = aggregation
        
        if 'current' in requested_fields:
            select_fields.append(agg_func(Telemetry.current).label('current'))
            aggregations_dict['current'] = aggregation
        
        if 'power_factor' in requested_fields:
            select_fields.append(agg_func(Telemetry.power_factor).label('power_factor'))
            aggregations_dict['power_factor'] = aggregation
        
        if 'power' in requested_fields:
            select_fields.append(agg_func(Telemetry.power).label('power'))
            aggregations_dict['power'] = aggregation
        
        # Execute aggregation query
        agg_query = query.with_entities(*select_fields).group_by(time_group).order_by(time_group)
        
        # Get total count for pagination
        total_count = agg_query.count()
        
        # Apply pagination
        offset = (page - 1) * page_size
        paginated_query = agg_query.offset(offset).limit(page_size)
        
        # Execute query
        results = paginated_query.all()
        
        # Format results as timeseries data points
        data_points = []
        for row in results:
            point = {
                'timestamp': row.timestamp,
                'kwh': round(row.kwh, 3) if hasattr(row, 'kwh') and row.kwh is not None else None,
                'voltage': round(row.voltage, 3) if hasattr(row, 'voltage') and row.voltage is not None else None,
                'current': round(row.current, 3) if hasattr(row, 'current') and row.current is not None else None,
                'power_factor': round(row.power_factor, 3) if hasattr(row, 'power_factor') and row.power_factor is not None else None,
                'power': round(row.power, 3) if hasattr(row, 'power') and row.power is not None else None
            }
            data_points.append(MetricsDataPoint(**point))
        
        logger.info(
            f"Metrics query: meter_id={meter_id}, site_id={site_id}, range={range_str}, "
            f"aggregation={aggregation}, total_points={total_count}, page={page}"
        )
        
        return MetricsResponse(
            meter_id=meter_id,
            site_id=site_id,
            range=range_str,
            start_time=start_time,
            end_time=end_time,
            aggregations=aggregations_dict,
            data=data_points,
            total_points=total_count,
            page=page,
            page_size=page_size,
            has_more=(offset + page_size) < total_count
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error querying metrics: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error while querying metrics: {str(e)}"
        )

