from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import UserCreate
from app.services.auth_service import create_user, authenticate_user
from app.services.db import get_session
from app.utils.security import create_access_token
from pydantic import BaseModel

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    name: str


@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserCreate, session: AsyncSession = Depends(get_session)):
    user = await create_user(session, user_data)
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "name": user.name}

@router.post("/login", response_model=TokenResponse)
async def login(login_data: LoginRequest, session: AsyncSession = Depends(get_session)):
    user = await authenticate_user(session, login_data.email, login_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Неверный email или пароль")
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "name": user.name}