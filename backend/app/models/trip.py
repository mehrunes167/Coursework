from pydantic import BaseModel
from typing import List, Optional

class RoutePoint(BaseModel):
    address: str
    coordinates: List[float]

class TripCreate(BaseModel):
    from_point: RoutePoint
    to_point: RoutePoint
    date: str
    available_seats: int

class TripInDB(BaseModel):
    id: int
    driver_id: int
    from_point: RoutePoint
    to_point: RoutePoint
    date: str
    available_seats: int
    status: str = "active"

    class Config:
        from_attributes = True