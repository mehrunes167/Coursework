import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateTrip from './pages/CreateTrip';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '0 30px',
          height: '60px',
          background: '#f8f9fa',
          borderBottom: '2px solid #dee2e6',
          fontSize: '18px'
        }}>
          <NavLink to="/" style={({ isActive }) => ({
            textDecoration: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            background: isActive ? '#007bff' : 'transparent',
            color: isActive ? 'white' : '#212529',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          })}>
            Главная
          </NavLink>
          <NavLink to="/create" style={({ isActive }) => ({
            textDecoration: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            background: isActive ? '#007bff' : 'transparent',
            color: isActive ? 'white' : '#212529',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          })}>
            Создать
          </NavLink>
          <NavLink to="/login" style={({ isActive }) => ({
            textDecoration: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            background: isActive ? '#007bff' : 'transparent',
            color: isActive ? 'white' : '#212529',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          })}>
            Войти
          </NavLink>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateTrip />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;