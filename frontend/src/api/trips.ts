import type { Trip } from '../types';
import API from './config';
export async function fetchTrips(filters?: { from?: string; to?: string; date?: string }): Promise<Trip[]> {
  const params = new URLSearchParams(filters as any);
  const res = await fetch(`${API}/trips?${params}`);
  return res.json();
}

export async function createTrip(trip: Omit<Trip, '_id' | 'driverId' | 'status' | 'createdAt'>, token: string): Promise<Trip> {
  const res = await fetch(`${API}/trips`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(trip),
  });
  return res.json();
}