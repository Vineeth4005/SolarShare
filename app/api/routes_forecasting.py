"""API routes for solar generation and tenant load forecasting (Prophet model integration scope)."""

import logging
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.tenant import Tenant
from app.schemas.forecasting import ForecastDataPoint, SolarForecastResponse, TenantForecastResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/forecasting", tags=["forecasting"])


@router.get("/solar", response_model=SolarForecastResponse)
def get_solar_forecast(
    estate_id: int = Query(1, ge=1),
    hours: int = Query(24, ge=1, le=168),
) -> SolarForecastResponse:
    now = datetime.now().replace(minute=0, second=0, microsecond=0)
    data: List[ForecastDataPoint] = []
    total_kwh = 0.0
    peak_kw = 0.0

    # Solar bell curve for next 24 hours
    solar_factors = [
        0, 0, 0, 0, 0, 0,
        0.05, 0.20, 0.45, 0.70, 0.88, 0.96,
        1.00, 0.95, 0.85, 0.65, 0.38, 0.15,
        0.02, 0, 0, 0, 0, 0
    ]

    for i in range(hours):
        ts = now + timedelta(hours=i)
        hour_of_day = ts.hour
        factor = solar_factors[hour_of_day % 24]
        pred = round(380.0 * factor, 2)
        lower = round(max(0.0, pred * 0.85), 2)
        upper = round(pred * 1.15, 2)

        if pred > peak_kw:
            peak_kw = pred
        total_kwh += pred

        data.append(
            ForecastDataPoint(
                timestamp=ts.strftime("%Y-%m-%dT%H:00:00"),
                predicted_value_kw=pred,
                lower_bound_kw=lower,
                upper_bound_kw=upper,
            )
        )

    return SolarForecastResponse(
        estate_id=estate_id,
        forecast_period_hours=hours,
        forecast_data=data,
        total_generation_forecast_kwh=round(total_kwh, 2),
        peak_generation_kw=peak_kw,
        is_demo=True,
        explanatory_note="Prototype demo response — Prophet solar generation forecasting model is not yet connected.",
    )


@router.get("/tenants/{tenant_id}", response_model=TenantForecastResponse)
def get_tenant_load_forecast(
    tenant_id: int,
    hours: int = Query(24, ge=1, le=168),
    db: Session = Depends(get_db),
) -> TenantForecastResponse:
    tenant = db.get(Tenant, tenant_id)
    tenant_name = tenant.name if tenant else f"Tenant #{tenant_id}"

    now = datetime.now().replace(minute=0, second=0, microsecond=0)
    data: List[ForecastDataPoint] = []
    total_kwh = 0.0
    peak_kw = 0.0

    # Typical industrial tenant profile factor pattern
    load_factors = [
        0.30, 0.25, 0.25, 0.25, 0.30, 0.50,
        0.75, 0.90, 1.00, 0.98, 0.95, 0.90,
        0.80, 0.92, 0.95, 0.98, 0.90, 0.70,
        0.55, 0.45, 0.40, 0.35, 0.35, 0.30
    ]

    base_demand_kw = 150.0 + (tenant_id * 30.0 % 200.0)

    for i in range(hours):
        ts = now + timedelta(hours=i)
        hour_of_day = ts.hour
        factor = load_factors[hour_of_day % 24]
        pred = round(base_demand_kw * factor, 2)
        lower = round(pred * 0.90, 2)
        upper = round(pred * 1.10, 2)

        if pred > peak_kw:
            peak_kw = pred
        total_kwh += pred

        data.append(
            ForecastDataPoint(
                timestamp=ts.strftime("%Y-%m-%dT%H:00:00"),
                predicted_value_kw=pred,
                lower_bound_kw=lower,
                upper_bound_kw=upper,
            )
        )

    return TenantForecastResponse(
        tenant_id=tenant_id,
        tenant_name=tenant_name,
        forecast_period_hours=hours,
        forecast_data=data,
        total_consumption_forecast_kwh=round(total_kwh, 2),
        peak_demand_kw=peak_kw,
        is_demo=True,
        explanatory_note="Prototype demo response — Prophet tenant load forecasting model is not yet connected.",
    )
