import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import API from '../api/config';
export default function Login() {
  const { token, user, setAuth, logout } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [myTrips, setMyTrips] = useState<any[]>([]);
  const [tripsLoading, setTripsLoading] = useState(false);

  useEffect(() => {
    if (token) {
      setTripsLoading(true);
      fetch(`${API}/my-trips`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setMyTrips(data))
        .catch(() => {})
        .finally(() => setTripsLoading(false));
    }
  }, [token]);

  // Удаление поездки
  const handleDeleteTrip = async (tripId: number) => {
    try {
      const res = await fetch(`${API}/trips/${tripId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token!}` },
      });
      if (res.ok) {
        setMyTrips((prev) => prev.filter((trip) => trip.id !== tripId));
      } else {
        const err = await res.json();
        alert(err.detail || 'Ошибка удаления');
      }
    } catch {
      alert('Ошибка соединения');
    }
  };

  // Если пользователь авторизован
  if (token && user) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        minHeight: 'calc(100vh - 60px)',
        background: '#f0f2f5',
        padding: '30px',
      }}>
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          maxWidth: '600px',
          width: '100%',
        }}>
          <h2>Вы авторизованы</h2>
          <p style={{ fontSize: '18px', margin: '20px 0' }}>
            Добро пожаловать, <strong>{user.name}</strong>!
          </p>
          <p style={{ color: '#666' }}>{user.email}</p>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Выйти из аккаунта
          </button>

          <hr style={{ margin: '30px 0 20px' }} />
          <h3>Мои поездки</h3>
          {tripsLoading ? (
            <p>Загрузка...</p>
          ) : myTrips.length === 0 ? (
            <p style={{ color: '#888' }}>У вас пока нет опубликованных поездок.</p>
          ) : (
            <div style={{ marginTop: '15px' }}>
              {myTrips.map((trip) => (
                <div
                  key={trip.id}
                  style={{
                    background: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    borderRadius: '6px',
                    padding: '10px',
                    marginBottom: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <strong>{trip.from_point.address}</strong> → {trip.to_point.address}
                    <br />
                     {trip.date} |  {trip.availableSeats} | {trip.status}
                  </div>
                  <button
                    onClick={() => handleDeleteTrip(trip.id)}
                    style={{
                      background: '#ffc107',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '5px 10px',
                      cursor: 'pointer',
                      color: '#212529',
                    }}
                  >
                    Удалить
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Форма входа/регистрации
  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/login' : '/register';
      const body: any = { email, password };
      if (!isLogin) body.name = name;

      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401 && isLogin) {
          setError('Пользователь не найден. Хотите зарегистрироваться?');
        } else {
          setError(data.detail || 'Ошибка');
        }
        return;
      }

      setAuth(data.access_token, { name: data.name, email });
      navigate('/');
    } catch (err) {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 'calc(100vh - 60px)',
      background: '#f0f2f5'
    }}>
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
          {isLogin ? 'Вход' : 'Регистрация'}
        </h2>

        {error && (
          <div style={{
            background: '#fff3cd',
            color: '#856404',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '15px',
            fontSize: '14px'
          }}>
            {error}
            {error.includes('не найден') && (
              <button
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                }}
                style={{
                  marginLeft: '10px',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '5px 10px',
                  cursor: 'pointer'
                }}
              >
                Зарегистрироваться
              </button>
            )}
          </div>
        )}

        {!isLogin && (
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>Имя:</label>
            <input
              type="text"
              placeholder="Ваше имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                boxSizing: 'border-box'
              }}
            />
          </div>
        )}

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Email:</label>
          <input
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Пароль:</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          {isLogin ? (
            <span>
              Нет аккаунта?{' '}
              <button
                onClick={() => { setIsLogin(false); setError(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#007bff',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Зарегистрироваться
              </button>
            </span>
          ) : (
            <span>
              Уже есть аккаунт?{' '}
              <button
                onClick={() => { setIsLogin(true); setError(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#007bff',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Войти
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}