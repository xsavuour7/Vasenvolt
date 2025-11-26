"""
Telemetry Data Validation and Normalization Middleware Layer

This service provides comprehensive validation and normalization for telemetry data
before it's stored in the database. It ensures data quality, consistency, and
compliance with business rules.

Normalization Features:
- Auto-converts timestamps to UTC ISO8601 format
- Rounds all numeric values to 3 decimal places
- Rejects negative kWh values
- Validates data types and ranges

This middleware layer is used by all telemetry ingestion endpoints:
- REST API (POST /api/telemetry)
- CSV Import (POST /api/telemetry/import)
- MQTT Subscriber (real-time streaming)

Invalid records are logged with detailed error information including:
- Field name
- Invalid value
- Error message
- Timestamp of validation failure
"""

import logging
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, Any, Optional, Tuple, List
from pydantic import ValidationError
import json

logger = logging.getLogger(__name__)

class TelemetryValidationError(Exception):
    """Custom exception for telemetry validation errors"""
    def __init__(self, message: str, field: str = None, value: Any = None):
        self.message = message
        self.field = field
        self.value = value
        super().__init__(self.message)

class TelemetryNormalizer:
    """Service for normalizing telemetry data"""
    
    @staticmethod
    def normalize_timestamp(timestamp: Any) -> datetime:
        """
        Normalize timestamp to UTC ISO8601 format.
        
        Args:
            timestamp: Can be datetime, string, or timestamp
            
        Returns:
            datetime: Normalized UTC datetime
            
        Raises:
            TelemetryValidationError: If timestamp cannot be parsed
        """
        try:
            if isinstance(timestamp, datetime):
                # Ensure timezone awareness
                if timestamp.tzinfo is None:
                    # Assume UTC if no timezone info
                    timestamp = timestamp.replace(tzinfo=timezone.utc)
                else:
                    # Convert to UTC
                    timestamp = timestamp.astimezone(timezone.utc)
                return timestamp
            
            elif isinstance(timestamp, str):
                # Try parsing ISO format strings
                try:
                    # Try with timezone info first
                    dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                    return dt.astimezone(timezone.utc)
                except ValueError:
                    # Try parsing common formats
                    for fmt in [
                        '%Y-%m-%d %H:%M:%S',
                        '%Y-%m-%dT%H:%M:%S',
                        '%Y-%m-%d %H:%M:%S.%f',
                        '%Y-%m-%dT%H:%M:%S.%f',
                        '%Y-%m-%d %H:%M:%S.%fZ',
                        '%Y-%m-%dT%H:%M:%S.%fZ'
                    ]:
                        try:
                            dt = datetime.strptime(timestamp, fmt)
                            if 'Z' in fmt or '+00:00' in timestamp:
                                dt = dt.replace(tzinfo=timezone.utc)
                            else:
                                dt = dt.replace(tzinfo=timezone.utc)
                            return dt
                        except ValueError:
                            continue
                    raise ValueError(f"Unable to parse timestamp: {timestamp}")
            
            elif isinstance(timestamp, (int, float)):
                # Unix timestamp
                if timestamp > 1e10:  # Milliseconds
                    timestamp = timestamp / 1000
                return datetime.fromtimestamp(timestamp, tz=timezone.utc)
            
            else:
                raise ValueError(f"Unsupported timestamp type: {type(timestamp)}")
                
        except Exception as e:
            raise TelemetryValidationError(
                f"Invalid timestamp format: {timestamp}",
                field="timestamp",
                value=timestamp
            ) from e
    
    @staticmethod
    def normalize_numeric(value: Any, field_name: str, precision: int = 3) -> Optional[float]:
        """
        Normalize numeric values to specified decimal places.
        
        Args:
            value: Numeric value to normalize
            field_name: Name of the field for error reporting
            precision: Number of decimal places (default: 3)
            
        Returns:
            float: Normalized numeric value or None if input is None/empty
            
        Raises:
            TelemetryValidationError: If value cannot be converted to number
        """
        if value is None or value == "" or value == "null":
            return None
        
        try:
            # Convert to Decimal for precise rounding
            decimal_value = Decimal(str(value))
            # Round to specified precision
            rounded = decimal_value.quantize(
                Decimal('0.1') ** precision,
                rounding=ROUND_HALF_UP
            )
            return float(rounded)
        except (ValueError, TypeError, ArithmeticError) as e:
            raise TelemetryValidationError(
                f"Invalid numeric value for {field_name}: {value}",
                field=field_name,
                value=value
            ) from e
    
    @staticmethod
    def validate_kwh(kwh: Any) -> float:
        """
        Validate and normalize kWh values.
        
        Args:
            kwh: kWh value to validate
            
        Returns:
            float: Normalized kWh value
            
        Raises:
            TelemetryValidationError: If kWh is negative or invalid
        """
        normalized_kwh = TelemetryNormalizer.normalize_numeric(kwh, "kwh")
        
        if normalized_kwh is None:
            raise TelemetryValidationError(
                "kWh value is required and cannot be null",
                field="kwh",
                value=kwh
            )
        
        if normalized_kwh < 0:
            raise TelemetryValidationError(
                "kWh value cannot be negative",
                field="kwh",
                value=normalized_kwh
            )
        
        return normalized_kwh
    
    @staticmethod
    def validate_power_factor(power_factor: Any) -> Optional[float]:
        """
        Validate and normalize power factor values.
        
        Args:
            power_factor: Power factor value to validate
            
        Returns:
            float: Normalized power factor or None
            
        Raises:
            TelemetryValidationError: If power factor is out of range
        """
        if power_factor is None or power_factor == "" or power_factor == "null":
            return None
        
        normalized_pf = TelemetryNormalizer.normalize_numeric(power_factor, "power_factor")
        
        if normalized_pf is not None:
            if normalized_pf < 0 or normalized_pf > 1:
                raise TelemetryValidationError(
                    "Power factor must be between 0.0 and 1.0",
                    field="power_factor",
                    value=normalized_pf
                )
        
        return normalized_pf
    
    @staticmethod
    def validate_positive_numeric(value: Any, field_name: str) -> Optional[float]:
        """
        Validate and normalize positive numeric values.
        
        Args:
            value: Numeric value to validate
            field_name: Name of the field for error reporting
            
        Returns:
            float: Normalized positive numeric value or None
            
        Raises:
            TelemetryValidationError: If value is negative
        """
        normalized_value = TelemetryNormalizer.normalize_numeric(value, field_name)
        
        if normalized_value is not None and normalized_value < 0:
            raise TelemetryValidationError(
                f"{field_name} value cannot be negative",
                field=field_name,
                value=normalized_value
            )
        
        return normalized_value

class TelemetryValidator:
    """Main telemetry validation service"""
    
    def __init__(self):
        self.normalizer = TelemetryNormalizer()
        self.validation_errors: List[Dict[str, Any]] = []
    
    def validate_and_normalize(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate and normalize telemetry data.
        
        Args:
            data: Raw telemetry data dictionary
            
        Returns:
            dict: Normalized and validated telemetry data
            
        Raises:
            TelemetryValidationError: If validation fails
        """
        self.validation_errors.clear()
        normalized_data = {}
        
        try:
            # Required fields validation
            required_fields = ['tenant_id', 'site_id', 'meter_id', 'timestamp', 'kwh']
            for field in required_fields:
                if field not in data or data[field] is None:
                    raise TelemetryValidationError(
                        f"Required field '{field}' is missing or null",
                        field=field,
                        value=data.get(field)
                    )
            
            # Normalize timestamp
            normalized_data['timestamp'] = self.normalizer.normalize_timestamp(data['timestamp'])
            
            # Validate and normalize kWh (required)
            normalized_data['kwh'] = self.normalizer.validate_kwh(data['kwh'])
            
            # Validate and normalize optional numeric fields
            optional_fields = {
                'voltage': 'voltage',
                'current': 'current', 
                'power': 'power',
                'frequency': 'frequency',
                'temperature': 'temperature'
            }
            
            for field, field_name in optional_fields.items():
                normalized_data[field] = self.normalizer.validate_positive_numeric(
                    data.get(field), field_name
                )
            
            # Validate power factor (special case - must be 0-1)
            normalized_data['power_factor'] = self.normalizer.validate_power_factor(
                data.get('power_factor')
            )
            
            # Copy other fields
            normalized_data['tenant_id'] = int(data['tenant_id'])
            normalized_data['site_id'] = int(data['site_id'])
            normalized_data['meter_id'] = int(data['meter_id'])
            
            # Set default data quality if not provided
            normalized_data['data_quality'] = data.get('data_quality', 'good')
            
            # Validate data quality
            if normalized_data['data_quality'] not in ['good', 'bad', 'uncertain']:
                normalized_data['data_quality'] = 'uncertain'
            
            logger.info(f"Successfully validated and normalized telemetry data for meter {normalized_data['meter_id']}")
            return normalized_data
            
        except TelemetryValidationError as e:
            self.validation_errors.append({
                'field': e.field,
                'value': e.value,
                'message': e.message,
                'timestamp': datetime.now(timezone.utc).isoformat()
            })
            logger.error(f"Telemetry validation error: {e.message} (field: {e.field}, value: {e.value})")
            raise
        
        except Exception as e:
            error_msg = f"Unexpected validation error: {str(e)}"
            self.validation_errors.append({
                'field': 'general',
                'value': str(data),
                'message': error_msg,
                'timestamp': datetime.now(timezone.utc).isoformat()
            })
            logger.error(error_msg, exc_info=True)
            raise TelemetryValidationError(error_msg) from e
    
    def get_validation_errors(self) -> List[Dict[str, Any]]:
        """Get list of validation errors from the last validation attempt"""
        return self.validation_errors.copy()
    
    def validate_batch(self, data_list: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Validate and normalize a batch of telemetry data.
        
        Args:
            data_list: List of raw telemetry data dictionaries
            
        Returns:
            tuple: (valid_data_list, error_list)
        """
        valid_data = []
        errors = []
        
        for i, data in enumerate(data_list):
            try:
                normalized = self.validate_and_normalize(data)
                valid_data.append(normalized)
            except TelemetryValidationError as e:
                errors.append({
                    'row_number': i + 1,
                    'field': e.field,
                    'value': e.value,
                    'message': e.message,
                    'timestamp': datetime.now(timezone.utc).isoformat()
                })
                logger.warning(f"Row {i+1} validation failed: {e.message}")
        
        logger.info(f"Batch validation complete: {len(valid_data)} valid, {len(errors)} errors")
        return valid_data, errors

# Global validator instance
telemetry_validator = TelemetryValidator()
