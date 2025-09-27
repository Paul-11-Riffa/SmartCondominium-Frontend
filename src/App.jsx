// src/App.jsx

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './pages/Dashboard';
import PagoExitoso from './pages/PagoExitoso'; // <-- Importamos la nueva página

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // <-- Añadimos estado de carga

  useEffect(() => {
    const storedUser = localStorage.getItem('smartCondoUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false); // <-- Terminamos de cargar
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('smartCondoUser');
  };

  // Mientras carga el estado inicial, no mostramos nada
  if (loading) {
    return <div>Cargando...</div>; 
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          user ? <Navigate to="/" /> : (
            <div className="login-page-container">
              <Login onLogin={handleLogin} switchToRegister={() => window.location.href = '/register'} />
            </div>
          )
        }/>
        <Route path="/register" element={
          user ? <Navigate to="/" /> : (
             <div className="login-page-container">
               <Register switchToLogin={() => window.location.href = '/login'} />
             </div>
          )
        }/>
        
        {/* --- NUEVAS RUTAS DE PAGO --- */}
        <Route path="/pago-exitoso" element={
            user ? <PagoExitoso /> : <Navigate to="/login" />
        }/>
        
        {/* Ruta principal protegida */}
        <Route path="/*" element={
          user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />
        }/>
      </Routes>
    </Router>
  );
}

export default App;