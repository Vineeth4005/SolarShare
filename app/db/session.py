"""
SQLAlchemy engine and session management.

Phase 1 targets SQLite by default (per the locked specification: "SQLite may
be supported for easy local demonstration"), with `DATABASE_URL` making a
future move to PostgreSQL a configuration change, not a code change.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings


class Base(DeclarativeBase):
    """Shared declarative base for all ORM models."""
    pass


def _make_engine():
    connect_args = {}
    if settings.is_sqlite:
        # Needed for SQLite when used with FastAPI's threaded request handling.
        connect_args = {"check_same_thread": False}
    return create_engine(settings.database_url, connect_args=connect_args, future=True)


engine = _make_engine()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)


def get_db():
    """FastAPI dependency that yields a database session and ensures it's closed."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
