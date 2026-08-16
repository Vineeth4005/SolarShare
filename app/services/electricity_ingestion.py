"""
Public electricity dataset ingestion orchestration.

Ties together app/integrations/tsf_parser.py (format parsing) and
app/integrations/electricity_dataset.py (acquisition, conversion,
validation) with the database: persists `PublicLoadSeries` +
`PublicLoadObservation` rows with full source/derived provenance.

Deliberately does NOT perform tenant profile mapping/client selection —
that is a separate, later step per the locked specification.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.core.config import settings
from app.integrations.electricity_dataset import (
    DERIVED_UNIT_DESCRIPTION,
    SOURCE_UNIT_DESCRIPTION,
    ElectricityDatasetSourceConfig,
    ValidationReport,
    acquire_dataset,
    validate_and_convert,
)
from app.integrations.tsf_parser import TsfParseError, parse_tsf
from app.models.public_load import PublicLoadObservation, PublicLoadSeries

logger = logging.getLogger(__name__)


class ElectricityIngestionError(Exception):
    pass


def _persist_series(
    db: Session,
    validated,
    source_config: ElectricityDatasetSourceConfig,
    retrieved_at: datetime,
) -> PublicLoadSeries:
    existing = db.query(PublicLoadSeries).filter(PublicLoadSeries.series_name == validated.series_name).first()
    target = existing or PublicLoadSeries(series_name=validated.series_name)

    target.start_timestamp_local = validated.start_timestamp_local
    target.frequency = validated.frequency
    target.value_count = len(validated.timestamps)
    target.source_name = source_config.source_name
    target.source_doi = source_config.source_doi
    target.source_url = source_config.source_url
    target.source_unit_description = SOURCE_UNIT_DESCRIPTION
    target.retrieved_at = retrieved_at
    target.is_public_proxy = True

    if existing is None:
        db.add(target)
    db.flush()  # ensure target.id is populated for observation FKs
    return target


def _persist_observations(db: Session, series_row: PublicLoadSeries, validated) -> int:
    written = 0
    for ts, kw, kwh in zip(validated.timestamps, validated.hourly_average_kw, validated.energy_kwh):
        existing = (
            db.query(PublicLoadObservation)
            .filter(
                PublicLoadObservation.series_id == series_row.id,
                PublicLoadObservation.timestamp_local == ts,
            )
            .first()
        )
        target = existing or PublicLoadObservation(series_id=series_row.id, timestamp_local=ts)
        target.hourly_average_kw = kw
        target.energy_kwh = kwh
        target.interval_hours = 1.0
        if existing is None:
            db.add(target)
        written += 1
    return written


def ingest_electricity_dataset(
    db: Session,
    local_path: Optional[str] = None,
) -> dict:
    """
    Run the full ingestion pipeline: acquire -> parse -> validate/convert ->
    persist. Returns a summary dict used both by tests and by the final
    milestone report.
    """
    source_config = ElectricityDatasetSourceConfig()

    path = acquire_dataset(local_path=local_path)

    try:
        dataset = parse_tsf(path)
    except TsfParseError as exc:
        raise ElectricityIngestionError(f".tsf parsing failed: {exc}") from exc

    report: ValidationReport = validate_and_convert(dataset, source_config)

    retrieved_at = datetime.now(timezone.utc)
    series_persisted = 0
    observations_persisted = 0
    min_ts = None
    max_ts = None
    for validated in report.valid_series:
        series_row = _persist_series(db, validated, source_config, retrieved_at)
        observations_persisted += _persist_observations(db, series_row, validated)
        series_persisted += 1
        if validated.timestamps:
            series_min, series_max = validated.timestamps[0], validated.timestamps[-1]
            min_ts = series_min if min_ts is None or series_min < min_ts else min_ts
            max_ts = series_max if max_ts is None or series_max > max_ts else max_ts

    db.commit()

    summary = {
        "source_name": source_config.source_name,
        "source_doi": source_config.source_doi,
        "source_unit": SOURCE_UNIT_DESCRIPTION,
        "internal_unit": DERIVED_UNIT_DESCRIPTION,
        "frequency": dataset.metadata.frequency,
        "series_parsed": len(dataset.series),
        "series_persisted": series_persisted,
        "series_rejected": len(report.rejected_series),
        "rejected_series_reasons": report.rejected_series,
        "observations_persisted": observations_persisted,
        "records_considered": report.total_records_considered,
        "records_valid": report.total_records_valid,
        "records_missing_value": report.total_records_missing_value,
        "records_negative_rejected": report.total_records_negative_rejected,
        "date_range_start_local": min_ts.isoformat() if min_ts else None,
        "date_range_end_local": max_ts.isoformat() if max_ts else None,
    }
    logger.info("Electricity dataset ingestion complete: %s", summary)
    return summary
