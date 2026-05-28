from pydantic import BaseModel, Field
from typing import Optional

class BookingCreate(BaseModel):
    trip_id: str

class BookingInDB(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    trip_id: str
    passenger_id: str
    status: str = "pending"
    
    class Config:
        populate_by_name = True