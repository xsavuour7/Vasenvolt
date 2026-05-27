from collections import defaultdict
from datetime import datetime
from typing import Any, Dict, Iterable, List


def calculate_deviation_percent(previous_kwh: float, current_kwh: float) -> float:
    """Return absolute percentage deviation while handling a zero baseline."""

    if previous_kwh == 0:
        return 100.0 if current_kwh != 0 else 0.0

    return abs((current_kwh - previous_kwh) / previous_kwh) * 100.0


def detect_anomalies(
    telemetry_records: Iterable[Any],
    threshold_percent: float = 20.0,
) -> List[Dict[str, Any]]:
    """
    Detect anomalies by comparing each reading to the previous reading per meter.

    Records are grouped by meter so site-level queries do not compare unrelated meters.
    The result is sorted newest-first for dashboard preview consumption.
    """

    grouped_records: dict[int, list[Any]] = defaultdict(list)
    for record in telemetry_records:
        grouped_records[record.meter_id].append(record)

    anomalies: List[Dict[str, Any]] = []

    for meter_records in grouped_records.values():
        sorted_records = sorted(meter_records, key=lambda record: record.timestamp)

        previous_record = None
        for record in sorted_records:
            if previous_record is None:
                previous_record = record
                continue

            deviation_percent = calculate_deviation_percent(previous_record.kwh, record.kwh)
            if deviation_percent > threshold_percent:
                anomalies.append(
                    {
                        "timestamp": record.timestamp,
                        "meter_id": record.meter_id,
                        "meter_name": getattr(getattr(record, "meter", None), "name", None),
                        "site_id": record.site_id,
                        "site_name": getattr(getattr(record, "site", None), "name", None),
                        "kwh": record.kwh,
                        "previous_kwh": previous_record.kwh,
                        "deviation_percent": round(deviation_percent, 3),
                    }
                )

            previous_record = record

    return sorted(anomalies, key=lambda anomaly: anomaly["timestamp"], reverse=True)
