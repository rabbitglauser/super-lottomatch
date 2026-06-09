import os
from functools import lru_cache

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker


def _build_database_url() -> str:
    explicit_url = os.environ.get("DATABASE_URL")
    if explicit_url:
        return explicit_url

    host = os.environ.get("DATABASE_HOST", "localhost")
    port = os.environ.get("DATABASE_PORT", "5432")
    name = os.environ.get("DATABASE_NAME", "super_lottomatch")
    user = os.environ.get("DATABASE_USER", "app_user")
    password = os.environ.get("DATABASE_PASSWORD", "")
    return f"postgresql+psycopg://{user}:{password}@{host}:{port}/{name}"


@lru_cache
def get_engine() -> Engine:
    return create_engine(_build_database_url(), pool_pre_ping=True)


@lru_cache
def get_session_factory() -> sessionmaker[Session]:
    return sessionmaker(bind=get_engine(), autoflush=False, autocommit=False)


def get_db() -> Session:
    db = get_session_factory()()
    try:
        yield db
    finally:
        db.close()
