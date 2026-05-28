import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25,41], iconAnchor: [12,41] });
L.Marker.prototype.options.icon = DefaultIcon;

export interface Point {
  lat: number;
  lng: number;
  address: string;
}

interface Props {
  onPointsChange: (from: Point | null, to: Point | null) => void;
}

const getAddress = async (lat: number, lng: number): Promise<string> => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
    const data = await res.json();
    return data.display_name || 'Неизвестный адрес';
  } catch {
    return 'Не удалось определить адрес';
  }
};

const MapEvents: React.FC<{
  setFrom: (p: Point) => void;
  setTo: (p: Point | null) => void;
  from: Point | null;
  to: Point | null;
}> = ({ setFrom, setTo, from, to }) => {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      const address = await getAddress(lat, lng);
      if (!from) {
        setFrom({ lat, lng, address });
      } else if (!to) {
        setTo({ lat, lng, address });
      } else {
        setFrom({ lat, lng, address });
        setTo(null);
      }
    },
  });
  return null;
};

const MapPointSelector: React.FC<Props> = ({ onPointsChange }) => {
  const [from, setFrom] = useState<Point | null>(null);
  const [to, setTo] = useState<Point | null>(null);

  const handleFrom = (p: Point) => {
    setFrom(p);
    onPointsChange(p, to);
  };
  const handleTo = (p: Point | null) => {
    setTo(p);
    onPointsChange(from, p);
  };

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '8px', padding: '10px', background: '#f0f0f0', flexShrink: 0 }}>
        {from ? <b>Откуда:</b> : <span>Кликните, чтобы выбрать точку отправления</span>} {from?.address}
        <br />
        {to ? <b>Куда:</b> : <span>Кликните, чтобы выбрать точку назначения</span>} {to?.address}
      </div>
      <MapContainer
        center={[55.751244, 37.618423]}
        zoom={5}
        style={{ height: '100%', width: '100%', flex: 1 }}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapEvents setFrom={handleFrom} setTo={handleTo} from={from} to={to} />
        {from && <Marker position={[from.lat, from.lng]} />}
        {to && <Marker position={[to.lat, to.lng]} />}
      </MapContainer>
    </div>
  );
};

export default MapPointSelector;