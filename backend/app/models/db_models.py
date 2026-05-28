from sqlalchemy import Column, Integer, String, Float, JSON
from sqlalchemy.orm import DeclarativeBase
from app.services.db import Base

class UserDB(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    name = Column(String)

class TripDB(Base):
    __tablename__ = "trips"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    driver_id = Column(Integer)
    from_address = Column(String)
    from_coordinates = Column(JSON)  # [lng, lat]
    to_address = Column(String)
    to_coordinates = Column(JSON)
    date = Column(String)
    available_seats = Column(Integer)
    status = Column(String, default="active")