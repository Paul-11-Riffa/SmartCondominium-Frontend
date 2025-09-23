import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register'; // 1. Importamos el nuevo componente
import Dashboard from './pages/Dashboard';

function App() {
  const [user, setUser] = useState(null);
  // 2. Nuevo estado para controlar qué vista mostrar: 'login' o 'register'
  const [currentView, setCurrentView] = useState('login');

  // Este useEffect no cambia, sigue buscando un usuario al cargar la app
  useEffect(() => {
    const storedUser = localStorage.getItem('smartCondoUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Esta función se pasa a Login y Register para actualizar el estado principal
  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('smartCondoUser');
  };

  // 3. Función que decide si renderizar el Login o el Register
  const renderAuthView = () => {
    if (currentView === 'login') {
      return <Login onLogin={handleLogin} switchToRegister={() => setCurrentView('register')} />;
    } else {
      return <Register switchToLogin={() => setCurrentView('login')} />;
    }
  };

  // 4. El renderizado final cambia ligeramente
  if (user) {
    // Si el usuario existe, muestra el Dashboard (esto no cambia)
    return <Dashboard user={user} onLogout={handleLogout} />;
  } else {
    // Si no hay usuario, muestra el contenedor de centrado
    // y dentro, el resultado de renderAuthView() (Login o Register)
    return (
      <div className="login-page-container">
        {renderAuthView()}
      </div>
    );
  }
}

export default App;

