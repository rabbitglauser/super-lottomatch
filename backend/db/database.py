import os

from collections.abc import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from dotenv import load_dotenv

load_dotenv()

class Base(DeclarativeBase):
    pass


def _build_database_url() -> str:
    host = os.environ.get(
        "DATABASE_HOST",
        "aws-0-eu-west-1.pooler.supabase.com")
    port = os.environ.get("DATABASE_PORT", "6543")
    name = os.environ.get("DATABASE_NAME", "postgres")
    user = os.environ.get(
        "DATABASE_USER",
        "postgres.uisckkfnveuufpebaxxt"
    )
    password = os.environ.get("DATABASE_PASSWORD", "uUXytOFu6Py4ath3uSsZ")
    return (
        f"postgresql+psycopg://"
        f"{user}:{password}@{host}:{port}/{name}"
    )

engine = create_engine(
    _build_database_url(),
    pool_pre_ping=True
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()