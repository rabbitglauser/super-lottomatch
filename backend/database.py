import os

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker


def _build_database_url() -> str:
    host = os.environ.get("DATABASE_HOST", "localhost")
    name = os.environ.get("DATABASE_NAME", "lottomatch")
    user = os.environ.get("DATABASE_USER", "lottomatch")
    password = os.environ.get("DATABASE_PASSWORD", "")
    return f"mysql+pymysql://{user}:{password}@{host}/{name}"


engine = create_engine(_build_database_url(), pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
