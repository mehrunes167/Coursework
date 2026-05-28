from fastapi import APIRouter

router = APIRouter()

@router.post("/bookings")
async def create_booking():
    return {"message": "Booking endpoint"}

@router.patch("/bookings/{booking_id}")
async def update_booking(booking_id: str):
    return {"message": f"Update booking {booking_id}"}