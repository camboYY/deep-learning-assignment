from sqlalchemy import Column, String, Integer, LargeBinary
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel

Base = declarative_base()

class Staff(Base):
    __tablename__ = "staff"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    embedding = Column(LargeBinary, nullable=False)  # 512-d vector stored as bytes

# Pydantic schemas
class StaffCreate(BaseModel):
    name: str
    email: str
    embedding: bytes

class StaffOut(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        orm_mode = True
