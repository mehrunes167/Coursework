import { useState, useEffect } from 'react';
import { fetchTrips } from '../api/trips';
import type { Trip } from '../types';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25,41], iconAnchor: [12,41] });
L.Marker.prototype.options.icon = DefaultIcon;

function MapInvalidator() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100);
  }, [map]);
  return null;
}

export default function Home() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const filters: Record<string, string> = {};
      if (from.trim()) filters.from = from.trim();
      if (to.trim()) filters.to = to.trim();
      if (date) filters.date = date;
      const data = await fetchTrips(filters);
      setTrips(data);
    } catch (error) {
      console.error('Ошибка поиска:', error);
    } finally {
      setLoading(false);
    }
  };

  const resultCenter: [number, number] =
    trips.length > 0
      ? [trips[0].from_point.coordinates[1], trips[0].from_point.coordinates[0]]
      : [55.751244, 37.618423];

  return (
    <div style={{
      display: 'flex',
      width: '100vw',
      height: 'calc(100vh - 60px)',
      overflow: 'hidden',
      margin: 0,
      padding: 0
    }}>
      {/* ЛЕВАЯ ПАНЕЛЬ */}
      <div style={{
        width: '350px',
        minWidth: '350px',
        maxWidth: '350px',
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        background: '#f8f9fa',
        borderRight: '2px solid #dee2e6',
        padding: '20px',
        boxSizing: 'border-box',
        zIndex: 10
      }}>
        <h2 style={{ marginTop: 0 }}> Поиск попутчиков</h2>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Откуда:</label>
          <input
            type="text"
            placeholder="Город или адрес"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Куда:</label>
          <input
            type="text"
            placeholder="Город или адрес"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Дата:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          style={{
            padding: '12px 20px',
            width: '100%',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          {loading ? ' Поиск...' : ' Найти поездки'}
        </button>

        <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>
          Результаты ({trips.length})
        </h3>

        {trips.length > 0 ? (
          trips.map((trip) => <TripCard key={trip._id} trip={trip} />)
        ) : (
          !loading && <p style={{ color: '#6c757d' }}>Нет найденных поездок</p>
        )}
      </div>

      {/* КАРТА */}
      <div style={{
        flex: 1,
        height: '100%',
        position: 'relative',
        zIndex: 1
      }}>
        <MapContainer
          center={resultCenter}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
          attributionControl={false}
          whenReady={() => {}}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapInvalidator />
          {trips.map((trip) => (
            <Marker
              key={trip._id}
              position={[
                trip.from_point.coordinates[1],
                trip.from_point.coordinates[0],
              ]}
            >
              <Popup>
                <strong>{trip.from_point.address}</strong>
                <br />
                 {trip.to_point.address}
                <br />
                 {trip.date} |  {trip.availableSeats} мест
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

function TripCard({ trip }: { trip: Trip }) {
  return (
    <div style={{
      background: 'white',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '10px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>
        {trip.from_point.address}
      </div>
      <div style={{ color: '#007bff', marginBottom: '6px' }}>
         {trip.to_point.address}
      </div>
      <div style={{ fontSize: '0.9em', color: '#666' }}>
         {trip.date} |  {trip.availableSeats} мест | {trip.status}
      </div>
    </div>
  );
}