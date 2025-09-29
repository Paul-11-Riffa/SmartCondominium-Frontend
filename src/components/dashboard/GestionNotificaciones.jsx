// smartcondominium-frontend/src/components/dashboard/GestionNotificaciones.jsx

import React, { useState } from 'react';
import { FaPaperPlane, FaSpinner } from 'react-icons/fa';
import '../../styles/Gestion.css';
import '../../styles/Comunicados.css'; // Reutilizar estilos

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function GestionNotificaciones() {
  const [notificacion, setNotificacion] = useState({
    tipo: 'General',
    descripcion: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNotificacion(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/enviar-notificacion/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify(notificacion),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'No se pudo enviar la notificación.');
      }

      setSuccess(`¡Notificación enviada a ${data.usuarios_notificados} usuarios!`);
      setNotificacion({ tipo: 'General', descripcion: '' }); // Limpiar formulario
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="gestion-container">
      <div className="gestion-header">
        <h2>Enviar Notificación a Todos los Residentes</h2>
      </div>
      <div className="comunicado-card">
        <div className="comunicado-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="tipo">Tipo de Notificación</label>
              <select
                id="tipo"
                name="tipo"
                value={notificacion.tipo}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="General">General</option>
                <option value="Pagos">Pagos</option>
                <option value="Mantenimiento">Mantenimiento</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="descripcion">Mensaje de la Notificación</label>
              <textarea
                id="descripcion"
                name="descripcion"
                rows="5"
                value={notificacion.descripcion}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Escribe aquí el mensaje que se enviará a todos los residentes..."
                required
              />
            </div>

            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <div className="modal-actions">
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? <FaSpinner className="spinner" /> : <FaPaperPlane />}
                {isLoading ? 'Enviando...' : 'Enviar Notificación'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default GestionNotificaciones;