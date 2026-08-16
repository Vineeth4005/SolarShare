"""
Phase 1 demo seed script.

Creates a minimal Estate + one Tenant row so ADMIN/TENANT registration and
role-based access can be exercised against the live API.

IMPORTANT: this seeds only enough data to test the Phase 1 auth foundation.
It does NOT seed the 6 locked tenant profiles, PV/battery config rows, or
tariff rows — that seeding belongs to the phase that actually consumes
those values (data ingestion / billing), so it isn't duplicated here and
then invalidated later.

Usage:
    PYTHONPATH=. python scripts/seed_demo.py

(Run from the `solarshare-backend/` project root with the venv activated so
the `app` package resolves; PYTHONPATH=. is required since this is a plain
script, not an installed package.)

Must be run as a script (not `python -c ...` importing individual model
modules) or with `app.models.base` imported first, so that every ORM model
is registered on the shared mapper registry before SQLAlchemy resolves
string-based relationship() references (e.g. Estate.pv_configs ->
"PVConfig"). Importing only `app.models.estate` and `app.models.tenant`
directly, without triggering `app.models.base`, is what caused the earlier
`InvalidRequestError: ... failed to locate a name ('PVConfig')` failure
during manual verification — this script exists specifically to avoid that
class of mistake going forward.
"""

import logging

from app.core.logging_config import configure_logging
from app.db.init_db import init_db
from app.db.session import SessionLocal
from app.models import base as _register_all_models  # noqa: F401  (see module docstring)
from app.models.enums import TenantProfileType
from app.models.estate import Estate
from app.models.tenant import Tenant

configure_logging()
logger = logging.getLogger(__name__)


def seed() -> None:
    init_db()
    db = SessionLocal()
    try:
        estate = db.query(Estate).filter(Estate.name == "Coimbatore Demo Estate").first()
        if estate is None:
            estate = Estate(name="Coimbatore Demo Estate", latitude=11.0168, longitude=76.9558)
            db.add(estate)
            db.commit()
            db.refresh(estate)
            logger.info("Created estate id=%s", estate.id)
        else:
            logger.info("Estate already exists id=%s", estate.id)

        tenant = db.query(Tenant).filter(Tenant.estate_id == estate.id).first()
        if tenant is None:
            tenant = Tenant(
                estate_id=estate.id,
                name="Textile Manufacturing",
                profile_type=TenantProfileType.TEXTILE_MANUFACTURING,
            )
            db.add(tenant)
            db.commit()
            db.refresh(tenant)
            logger.info("Created tenant id=%s", tenant.id)
        else:
            logger.info("Tenant already exists id=%s", tenant.id)

        print(f"ESTATE_ID={estate.id}")
        print(f"TENANT_ID={tenant.id}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
