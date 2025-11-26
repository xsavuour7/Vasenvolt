# Telemetry API Tests

This directory contains unit and integration tests for telemetry ingestion and retrieval APIs.

## Test Files

- `test_telemetry.py` - Tests for REST API endpoints (JSON POST, CSV import, retrieval)
- `test_mqtt.py` - Tests for MQTT message ingestion
- `conftest.py` - Shared pytest fixtures (database, test data, client)

## Running Tests

### Run all tests:
```bash
cd backend
pytest tests/
```

### Run with coverage:
```bash
pytest tests/ --cov=app --cov-report=term-missing --cov-report=html
```

### Run specific test file:
```bash
pytest tests/test_telemetry.py -v
pytest tests/test_mqtt.py -v
```

### Run specific test:
```bash
pytest tests/test_telemetry.py::TestTelemetryJSONIngestion::test_create_telemetry_success -v
```

## Test Coverage

Tests cover:
- ✅ JSON POST endpoint (POST /api/telemetry)
- ✅ CSV import endpoint (POST /api/telemetry/import)
- ✅ MQTT message ingestion
- ✅ Data retrieval endpoints (GET /api/telemetry, GET /api/metrics)
- ✅ Validation and normalization
- ✅ Error handling
- ✅ Pagination

## CI/CD Integration

Tests are configured to run in CI/CD with:
- Coverage reporting (≥90% required)
- XML output for CI tools
- HTML report for local viewing

Configuration is in `pytest.ini`.

