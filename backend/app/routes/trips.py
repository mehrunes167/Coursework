from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.models.trip import TripCreate, TripInDB, RoutePoint
from app.services.trip_service import create_trip, search_trips
from app.services.db import get_session
from app.utils.security import get_current_user
from app.models.db_models import TripDB
from sqlalchemy import select
from fastapi import HTTPException


router = APIRouter()

@router.get("/my-trips", response_model=list[TripInDB])
async def get_my_trips(
    user_id: int = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    stmt = select(TripDB).where(TripDB.driver_id == user_id)
    result = await session.execute(stmt)
    trips = result.scalars().all()
    return [
        TripInDB(
            id=t.id,
            driver_id=t.driver_id,
            from_point=RoutePoint(address=t.from_address, coordinates=t.from_coordinates),
            to_point=RoutePoint(address=t.to_address, coordinates=t.to_coordinates),
            date=t.date,
            available_seats=t.available_seats,
            status=t.status
        ) for t in trips
    ]

@router.post("/trips", response_model=TripInDB)
async def create_new_trip(
    trip_data: TripCreate,
    user_id: int = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    trip = await create_trip(session, user_id, trip_data)
    # преобразуем SQLAlchemy объект в Pydantic-модель
    return TripInDB(
        id=trip.id,
        driver_id=trip.driver_id,
        from_point=RoutePoint(address=trip.from_address, coordinates=trip.from_coordinates),
        to_point=RoutePoint(address=trip.to_address, coordinates=trip.to_coordinates),
        date=trip.date,
        available_seats=trip.available_seats,
        status=trip.status
    )

@router.delete("/trips/{trip_id}")
async def delete_trip(
    trip_id: int,
    user_id: int = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    stmt = select(TripDB).where(TripDB.id == trip_id)
    result = await session.execute(stmt)
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Поездка не найдена")
    if trip.driver_id != user_id:
        raise HTTPException(status_code=403, detail="Вы не можете удалить чужую поездку")
    await session.delete(trip)
    await session.commit()
    return {"message": "Поездка удалена"}

@router.get("/trips", response_model=list[TripInDB])
async def get_trips(
    from_addr: Optional[str] = Query(None, alias="from"),
    to_addr: Optional[str] = Query(None, alias="to"),
    date: Optional[str] = Query(None),
    session: AsyncSession = Depends(get_session)
):
    filters = {}
    if from_addr:
        filters["from_address"] = from_addr
    if to_addr:
        filters["to_address"] = to_addr
    if date:
        filters["date"] = date
    trips = await search_trips(session, filters)
    return [
        TripInDB(
            id=t.id,
            driver_id=t.driver_id,
            from_point=RoutePoint(address=t.from_address, coordinates=t.from_coordinates),
            to_point=RoutePoint(address=t.to_address, coordinates=t.to_coordinates),
            date=t.date,
            available_seats=t.available_seats,
            status=t.status
        ) for t in trips
    ]