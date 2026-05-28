from pydantic import BaseModel, Field
from typing import Optional

class UserCreate(BaseModel):
    email: str
    password: str
    name: str

class UserInDB(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    email: str
    password_hash: str
    name: str
    
    class Config:
        populate_by_name = True