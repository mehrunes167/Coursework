from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
import bcrypt
from app.models.db_models import UserDB
from app.models.user import UserCreate

async def create_user(session: AsyncSession, user_data: UserCreate):
    # Проверка, существует ли уже пользователь с таким email
    stmt = select(UserDB).where(UserDB.email == user_data.email)
    result = await session.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email уже зарегистрирован")

    # Хеширование пароля с помощью bcrypt напрямую
    hashed_pw = bcrypt.hashpw(
        user_data.password.encode('utf-8'),
        bcrypt.gensalt()
    )

    user = UserDB(
        email=user_data.email,
        password_hash=hashed_pw.decode('utf-8'),
        name=user_data.name
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user

async def authenticate_user(session: AsyncSession, email: str, password: str):
    stmt = select(UserDB).where(UserDB.email == email)
    result = await session.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        return None

    # Проверка пароля
    if not bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
        return None
    return user