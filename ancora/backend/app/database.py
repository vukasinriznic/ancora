from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from .config import settings

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    """Bazna klasa za sve ORM modele."""
    pass


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency — daje DB sesiju i zatvara je posle requesta."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
