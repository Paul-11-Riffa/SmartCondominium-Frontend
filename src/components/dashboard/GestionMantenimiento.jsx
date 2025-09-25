import React, { useState, useEffect } from 'react';
import { FaPlus, FaTimes, FaCheck, FaHammer } from 'react-icons/fa';
import '../../styles/Gestion.css';
import '../../styles/Comunicados.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function GestionMantenimiento({ user }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ titulo: '', descripcion: '' });

  const isAdmin = user.rol?.tipo === 'admin';

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/solicitudes-mantenimiento/`, {
        headers: { 'Authorization': `Token ${token}` },
      });
      if (!response.ok) throw new Error('No se pudo cargar la lista de solicitudes.');
      const data = await response.json();
      setSolicitudes(data.results || data);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`${API_URL}/api/solicitudes-mantenimiento/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(Object.values(errData).flat().join(' '));
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    const token = localStorage.getItem('authToken');
    try {
      await fetch(`${API_URL}/api/solicitudes-mantenimiento/${id}/update_status/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
        body: JSON.stringify({ estado: newStatus }),
      });
      fetchData();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <div className="gestion-container">
        <div className="gestion-header">
          <h2>{isAdmin ? 'Solicitudes de Mantenimiento' : 'Mis Solicitudes de Mantenimiento'}</h2>
          {!isAdmin && (
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <FaPlus /> Nueva Solicitud
            </button>
          )}
        </div>

        {isLoading && <p>Cargando...</p>}
        {error && <p className="error-message">{error}</p>}

        {!isLoading && !error && (
          <div className="gestion-table-wrapper">
            <table className="gestion-table">
              <thead>
                <tr>
                  {isAdmin && <th>Residente</th>}
                  <th>Título</th>
                  <th>Descripción</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  {isAdmin && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {solicitudes.map(s => (
                  <tr key={s.id}>
                    {isAdmin && <td>{s.usuario_nombre}</td>}
                    <td>{s.titulo}</td>
                    <td>{s.descripcion}</td>
                    <td>{new Date(s.fecha_solicitud).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-${s.estado.toLowerCase().replace(' ', '')}`}>
                        {s.estado}
                      </span>
                    </td>
                    {isAdmin && s.estado === 'Pendiente' && (
                      <td style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => handleUpdateStatus(s.id, 'En Progreso')} className="btn-icon" title="Iniciar Trabajo"><FaHammer /></button>
                      </td>
                    )}
                    {isAdmin && s.estado === 'En Progreso' && (
                        <td style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => handleUpdateStatus(s.id, 'Completada')} className="btn-icon" title="Marcar como Completada"><FaCheck /></button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Nueva Solicitud de Mantenimiento</h3>
              <button onClick={() => setIsModalOpen(false)} className="btn-icon"><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group"><label>Título</label><input name="titulo" onChange={handleInputChange} className="form-input" required placeholder="Ej: Fuga de agua en el lavamanos" /></div>
              <div className="form-group"><label>Descripción Detallada</label><textarea name="descripcion" onChange={handleInputChange} className="form-input" rows="4" required placeholder="Por favor, describe el problema con el mayor detalle posible." /></div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Enviar Solicitud</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default GestionMantenimiento;