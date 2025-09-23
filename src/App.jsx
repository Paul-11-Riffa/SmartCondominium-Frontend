import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('smartCondoUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    // Quitamos el guardado de localStorage de aquí para evitar duplicados
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('smartCondoUser');
  };

  // Usamos una estructura if/else para más claridad
  if (user) {
    // Si hay usuario, muestra el Dashboard directamente (ocupará toda la pantalla)
    return <Dashboard user={user} onLogout={handleLogout} />;
  } else {
    // Si NO hay usuario, muestra el Login dentro de un contenedor que lo centrará
    return (
      <div className="login-page-container">
        <Login onLogin={handleLogin} />
      </div>
    );
  }
}

export default App;