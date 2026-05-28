export interface RoutePoint {
  address: string;
  coordinates: [number, number]; // [lng, lat]
}

export interface Trip {
  _id: string;
  driverId: string;
  from_point: RoutePoint;
  to_point: RoutePoint;
  date: string;
  availableSeats: number;
  status: 'active' | 'cancelled' | 'completed';
  createdAt: number;
}