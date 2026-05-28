from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.db_models import TripDB
from app.models.trip import TripCreate, RoutePoint

async def create_trip(session: AsyncSession, driver_id: int, trip_data: TripCreate):
    trip = TripDB(
        driver_id=driver_id,
        from_address=trip_data.from_point.address,
        from_coordinates=trip_data.from_point.coordinates,
        to_address=trip_data.to_point.address,
        to_coordinates=trip_data.to_point.coordinates,
        date=trip_data.date,
        available_seats=trip_data.available_seats,
        status="active"
    )
    session.add(trip)
    await session.commit()
    await session.refresh(trip)
    return trip

async def search_trips(session: AsyncSession, filters: dict):
    stmt = select(TripDB)
    if "from_address" in filters:
        stmt = stmt.where(TripDB.from_address.ilike(f"%{filters['from_address']}%"))
    if "to_address" in filters:
        stmt = stmt.where(TripDB.to_address.ilike(f"%{filters['to_address']}%"))
    if "date" in filters:
        stmt = stmt.where(TripDB.date == filters["date"])
    result = await session.execute(stmt)
    return result.scalars().all()