# SolarShare — Backend

Shared Solar Energy Forecasting, Fair Allocation and Time-of-Use Billing Platform for MSME Industrial Estates.

**Current status: Phase 1 — Foundational Architecture only.**
No data ingestion, forecasting, optimization, billing, invoicing, or frontend is implemented yet. See [Roadmap](#roadmap) below.

## Phase 1 scope

- Project structure, FastAPI app foundation
- Configuration management via environment variables (`.env`)
- SQLAlchemy models for core entities: `Estate`, `PVConfig`, `BatteryConfig`, `Tenant`, `Tariff`, `TariffPeriod`, `SolarTariffConfig`, `User`
- Database initialization (`create_all`, SQLite by default)
- Logging
- Basic error handling (validation + unhandled exception handlers)
- Authentication foundation: password hashing (bcrypt), JWT issuance/validation
- ADMIN / TENANT roles with role-enforcing dependency (`require_role`)
- Health-check endpoint
- Test suite (pytest) covering health, config, DB init, and auth/authorization

**Explicitly out of scope for Phase 1** (later phases): NASA POWER ingestion, public electricity dataset ingestion, Prophet forecasting, PuLP allocation, battery simulation, billing engine, PDF invoices, frontend dashboards, analytics.

## Setup

```bash
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # adjust values as needed
```

## Running the app

```bash
uvicorn app.main:app --reload
```

- API root: `http://localhost:8000/`
- Interactive docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/health`

On startup, the app initializes the database schema automatically (`create_all` against the SQLite file configured by `DATABASE_URL`).

## Running tests

```bash
pytest
```

Tests run against an isolated in-memory SQLite database — they never touch the `.env`-configured database file.

## Seeding demo data (optional, for manual verification)

```bash
PYTHONPATH=. python scripts/seed_demo.py
```

Creates one demo `Estate` (Coimbatore, 11.0168/76.9558) and one demo `Tenant`, printing their IDs — useful for manually registering a TENANT user against a real `tenant_id` via `/api/auth/register`. This is a Phase 1 verification convenience only; it does not seed the six locked tenant profiles, PV/battery configs, or tariffs (those are seeded by the phases that consume them).

## Project structure

```
app/
  core/        # config, logging, security (hashing + JWT)
  db/          # SQLAlchemy engine/session, schema init
  models/      # ORM models (Estate, PVConfig, BatteryConfig, Tenant, Tariff*, User)
  schemas/     # Pydantic request/response models
  api/         # FastAPI routers + auth dependencies
  main.py      # app entrypoint
tests/         # pytest suite
```

## Configuration

All settings are environment-driven (see `.env.example`). Notably:
- `DATABASE_URL` — defaults to local SQLite; swap to PostgreSQL later without code changes.
- `JWT_SECRET_KEY` — **must** be replaced with a real secret outside local development.

## Database strategy (Phase 1)

Tables are created via SQLAlchemy `Base.metadata.create_all()` on startup — no Alembic migrations yet. This is intentional for Phase 1 (see `app/db/init_db.py` for rationale) and should be revisited once the schema needs to evolve against data that already exists in a shared environment.

## Data & assumption honesty

Per the locked SolarShare specification, several values that will be introduced in later phases are **prototype assumptions**, not real specifications — and the schema already reflects this:
- `PVConfig` / `BatteryConfig` rows carry a `notes` field defaulting to an explicit prototype-assumption disclosure.
- `Tariff` carries a `label` field defaulting to "Tamil Nadu FY 2025-26 prototype tariff configuration" plus `source` / `source_reference` fields.
- `SolarTariffConfig` carries a `notes` field disclosing it is SolarShare's own internal prototype rate, not an official tariff.

## Public electricity dataset (Phase 2, ingestion scope)

**Source:** Zenodo "Electricity Hourly Dataset", DOI 10.5281/zenodo.4656140 — a public proxy for tenant-load data (NOT actual Coimbatore MSME smart-meter data).

**Locked unit interpretation:**
- Source: "Hourly average electricity demand in kW."
- Internal (SolarShare): "Hourly energy consumption in kWh."
- Conversion: `energy_kwh = hourly_average_kw × interval_hours` (`interval_hours = 1.0` for this dataset) — documented as Energy = Power × Time in `app/integrations/electricity_dataset.py`.

**Sandbox limitation:** this implementation environment cannot reach `zenodo.org` or `huggingface.co`, so the real ~36 MB `.tsf` file could not be downloaded or parsed here. The `.tsf` parser (`app/integrations/tsf_parser.py`) was instead verified against a real, official Monash Archive file (`tests/fixtures/real_monash_sample_ausgrid.tsf`, pulled from `github.com/rakshitha123/TSForecasting`) and exercised against a clearly-labeled synthetic fixture matching the electricity dataset's documented metadata (`tests/fixtures/sample_electricity_hourly_fixture.tsf`).

### Testing the parser against the real file yourself

1. Download the file from Zenodo: https://zenodo.org/records/4656140 — download `electricity_hourly_dataset.zip` and unzip it to get `electricity_hourly_dataset.tsf`.
2. Place it anywhere on your machine, e.g. `C:\data\electricity_hourly_dataset.tsf`.
3. Set the path in your `.env`:
   ```
   ELECTRICITY_DATASET_LOCAL_PATH=C:\data\electricity_hourly_dataset.tsf
   ```
   (Use a forward-slash or raw/escaped path as needed for your shell — e.g. `C:/data/electricity_hourly_dataset.tsf` also works.)
4. From the project root, with the venv activated:
   ```bash
   python -c "from app.integrations.tsf_parser import parse_tsf; ds = parse_tsf(r'C:\data\electricity_hourly_dataset.tsf'); print('series:', len(ds.series)); print('frequency:', ds.metadata.frequency); print('missing:', ds.metadata.missing); print('equallength:', ds.metadata.equallength); print('first series:', ds.series[0].series_name, ds.series[0].start_timestamp, len(ds.series[0].values))"
   ```
5. To run the full ingestion pipeline (parses, validates, converts, and persists to your local SQLite DB):
   ```bash
   python -c "
   from app.db.session import SessionLocal
   from app.db.init_db import init_db
   from app.services.electricity_ingestion import ingest_electricity_dataset
   init_db()
   db = SessionLocal()
   summary = ingest_electricity_dataset(db, local_path=r'C:\data\electricity_hourly_dataset.tsf')
   print(summary)
   "
   ```
6. Compare the printed `series` count against the expected **321** and the frequency against **hourly** — if either differs from what's documented here, that's a genuine discrepancy worth reporting back, not something to silently reconcile.



- **Phase 1 (this phase):** foundational architecture — done, pending your review.
- **Phase 2+:** NASA POWER ingestion, public electricity dataset ingestion + tenant mapping, PV estimation, Prophet forecasting (solar + load), PuLP fair allocation, battery simulation, Tamil Nadu ToU billing engine, PDF invoicing, FastAPI domain endpoints, React frontend (Admin/Tenant dashboards), analytics, Docker/CI.

Each phase begins only on explicit instruction.
