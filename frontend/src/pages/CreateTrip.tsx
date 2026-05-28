import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MapPointSelector, { type Point } from '../components/Map/MapPointSelector';
import { useAuth } from '../context/AuthContext';
import API from '../api/config';

export default function CreateTrip() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [from, setFrom] = useState<Point | null>(null);
  const [to, setTo] = useState<Point | null>(null);
  const [date, setDate] = useState('');
  const [seats, setSeats] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async () => {
    if (!from || !to || !date) {
      setMessage({ type: 'error', text: 'Выберите точки отправления и назначения, а также дату.' });
      return;
    }
    if (!token) {
      setMessage({ type: 'error', text: 'Необходимо авторизоваться.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${API}/trips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          from_point: {
            address: from.address,
            coordinates: [from.lng, from.lat],
          },
          to_point: {
            address: to.address,
            coordinates: [to.lng, to.lat],
          },
          date,
          available_seats: seats,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Ошибка при создании поездки');

      setMessage({ type: 'success', text: 'Поездка опубликована!' });
      setTimeout(() => navigate('/'), 1500);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Ошибка соединения с сервером' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      width: '100vw',
      height: 'calc(100vh - 60px)',
      overflow: 'hidden',
      margin: 0,
      padding: 0
    }}>
      {/* Левая панель с формой */}
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
        <h2 style={{ marginTop: 0 }}> Создать поездку</h2>

        {message && (
          <div style={{
            background: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '15px',
            fontSize: '14px'
          }}>
            {message.text}
          </div>
        )}

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Дата:</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Свободных мест:</label>
          <input type="number" min="1" max="10" value={seats} onChange={(e) => setSeats(Number(e.target.value))}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <button onClick={handleSubmit} disabled={loading}
          style={{
            width: '100%', padding: '12px', background: '#007bff', color: 'white',
            border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', marginBottom: '15px'
          }}>
          {loading ? ' Публикация...' : ' Опубликовать поездку'}
        </button>

        <button onClick={() => navigate('/')}
          style={{
            width: '100%', padding: '10px', background: '#6c757d', color: 'white',
            border: 'none', borderRadius: '4px', cursor: 'pointer'
          }}>
          ← На главную
        </button>
      </div>

      {/* Правая часть */}
      <div style={{ flex: 1, height: '100%', position: 'relative', zIndex: 1 }}>
        <MapPointSelector onPointsChange={(f, t) => { setFrom(f); setTo(t); }} />
      </div>
    </div>
  );
}