import React, { useState } from 'react';
import './Login.css'; // Importamos los nuevos estilos


const API_URL = import.meta.env.VITE_API_URL;

function Login({ onLogin })  {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [usuario, setUsuario] = useState(() => {
    const savedUser = localStorage.getItem('smartCondoUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Error al iniciar sesión. Verifique sus credenciales.');
      }
      setUsuario(data.user);
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('smartCondoUser', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleLogout = () => {
    setUsuario(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('smartCondoUser');
  };

  return (
    <div className="login-wrapper">
      {/* Panel Izquierdo */}
      <div className="left-panel">
        <div className="logo">SmartCondominium</div>
        <h1>Bienvenido a tu Hogar Digital</h1>
        <p>Gestiona, conecta y vive mejor en tu condominio.</p>
      </div>

      {/* Panel Derecho */}
      <div className="right-panel">
        {usuario ? (
          // Vista de Bienvenida si ya se inició sesión
          <div className="form-container welcome-container">
            <h2>¡Bienvenido de nuevo, {usuario.nombre}!</h2>
            <p>Estás listo para continuar.</p>
            <button onClick={handleLogout} className="submit-btn logout-btn">
              Cerrar Sesión
            </button>
          </div>
        ) : (
          // Formulario de Login si no se ha iniciado sesión
          <div className="form-container">
            <h2>Iniciar Sesión</h2>
            <p className="register-link">
              ¿No tienes una cuenta? <a href="#">Regístrate aquí</a>
            </p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Correo Electrónico</label>
                <input
                  id="email"
                  className="form-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <input
                  id="password"
                  className="form-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="error-message">{error}</p>}
              <button type="submit" className="submit-btn">Entrar</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;