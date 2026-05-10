from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings


# SQLAlchemy base class for models
Base = declarative_base()


def _get_engine():
    """
    Create the SQLAlchemy engine.

    For this app we always use SQLite (see settings.SQLALCHEMY_DATABASE_URI),
    but the conditional keeps things flexible and sets the recommended
    connect_args for SQLite so FastAPI can reuse connections across threads.
    """
    url = settings.SQLALCHEMY_DATABASE_URI
    connect_args = {"check_same_thread": False} if url.startswith("sqlite") else {}
    return create_engine(url, connect_args=connect_args)


engine = _get_engine()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """
    FastAPI dependency that provides a database session and ensures it is closed.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

