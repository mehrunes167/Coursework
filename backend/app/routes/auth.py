from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import UserCreate
from app.services.auth_service import create_user, authenticate_user
from app.services.db import get_session
from app.utils.security import create_access_token
from pydantic import BaseModel
import re

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
    if not user_data.name or len(user_data.name.strip()) == 0:
        raise HTTPException(status_code=422, detail="Имя не может быть пустым")
    if len(user_data.name.strip()) > 50:
        raise HTTPException(status_code=422, detail="Имя не должно превышать 50 символов")

    email_regex = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
    if not re.match(email_regex, user_data.email):
        raise HTTPException(status_code=422, detail="Некорректный формат email")

    if not user_data.password or len(user_data.password.strip()) == 0:
        raise HTTPException(status_code=422, detail="Пароль не может быть пустым")

    user = await create_user(session, user_data)
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "name": user.name, "token_type": "bearer"}

@router.post("/login", response_model=TokenResponse)
async def login(login_data: LoginRequest, session: AsyncSession = Depends(get_session)):
    if not login_data.email or not login_data.password:
        raise HTTPException(status_code=422, detail="Email и пароль обязательны")

    user = await authenticate_user(session, login_data.email, login_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Неверный email или пароль")
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "name": user.name, "token_type": "bearer"}