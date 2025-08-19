from databases import Database
from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker
import os
import aioredis

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
redis = aioredis.from_url(REDIS_URL, encoding="utf-8", decode_responses=True)

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://admin:admin123@postgres:5432/attendance_db")

# Async database connection
database = Database(DATABASE_URL)
metadata = MetaData()

# Optional synchronous engine for migrations / raw SQL
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
