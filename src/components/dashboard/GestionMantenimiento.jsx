// src/components/dashboard/GestionMantenimiento.jsx

import React, { useState, useEffect } from 'react';
import { FaPlus, FaTimes, FaPencilAlt, FaTrash } from 'react-icons/fa';
import '../../styles/Gestion.css';
import '../../styles/Comunicados.css'; // Reutilizamos estilos de modal y tarjetas
import '../../styles/Reservas.css'; // Reutilizamos los estilos de status

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function GestionMantenimiento({ user }) {
  // --- ESTADOS ---
  const [solicitudes, setSolicitudes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para el modal (usado por el residente para crear)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ titulo: '', descripcion: '' });

  const isAdmin = user.rol?.tipo === 'admin';

  // --- OBTENCIÓN DE DATOS ---
  // Ahora se ejecuta para ambos roles, el backend se encarga de filtrar
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const headers = { 'Authorization': `Token ${token}` };

      const response = await fetch(`${API_URL}/api/solicitudes-mantenimiento/`, { headers });
      if (!response.ok) throw new Error('No se pudieron cargar las solicitudes.');
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

  // --- MANEJO DEL MODAL Y FORMULARIO (PARA RESIDENTES) ---
  const openModal = () => {
    setFormData({ titulo: '', descripcion: '' });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

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
      closeModal();
      fetchData(); // Recargar la lista de solicitudes
    } catch (err) {
      setError(err.message);
    }
  };

  // --- MANEJO DE ESTADO (PARA ADMINS) ---
  const handleUpdateStatus = async (solicitudId, nuevoEstado) => {
      const token = localStorage.getItem('authToken');
      try {
          await fetch(`${API_URL}/api/solicitudes-mantenimiento/${solicitudId}/update_status/`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
              body: JSON.stringify({ estado: nuevoEstado }),
          });
          fetchData();
      } catch (e) {
          setError(e.message);
      }
  };


  if (isLoading) return <p>Cargando...</p>;
  if (error) return <p className="error-message">{error}</p>;

  // --- VISTA PARA RESIDENTES ---
  if (!isAdmin) {
    return (
      <>
        <div className="gestion-container">
          <div className="gestion-header">
            <h3>Mis Solicitudes de Mantenimiento</h3>
            <button className="btn btn-primary" onClick={openModal}>
              <FaPlus /> Crear Solicitud
            </button>
          </div>
          <div className="gestion-table-wrapper">
            <table className="gestion-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Título</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.length > 0 ? solicitudes.map(s => (
                  <tr key={s.id}>
                    <td>{new Date(s.fecha_solicitud).toLocaleDateString()}</td>
                    <td>{s.titulo}</td>
                    <td>{s.descripcion}</td>
                    <td><span className={`status-${s.estado.toLowerCase().replace(' ', '')}`}>{s.estado}</span></td>
                  </tr>
                )) : (
                  <tr><td colSpan="4">No has realizado ninguna solicitud.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Nueva Solicitud de Mantenimiento</h3>
                <button onClick={closeModal} className="btn-icon"><FaTimes /></button>
              </div>
              <form onSubmit={handleSubmit} className="modal-body">
                <div className="form-group">
                  <label>Título</label>
                  <input name="titulo" value={formData.titulo} onChange={handleInputChange} className="form-input" placeholder="Ej: Fuga de agua en el baño" required />
                </div>
                <div className="form-group">
                  <label>Descripción</label>
                  <textarea name="descripcion" value={formData.descripcion} onChange={handleInputChange} className="form-input" rows="4" placeholder="Describe el problema con más detalle." required />
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={closeModal} className="btn btn-secondary">Cancelar</button>
                  <button type="submit" className="btn btn-primary">Enviar Solicitud</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

  // --- VISTA PARA ADMINISTRADORES ---
  return (
    <div className="gestion-container">
        <h3>Solicitudes de Mantenimiento Recibidas</h3>
        <div className="gestion-table-wrapper">
            <table className="gestion-table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Residente</th>
                        <th>Unidad</th>
                        <th>Título</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {solicitudes.map(s => (
                        <tr key={s.id}>
                            <td>{new Date(s.fecha_solicitud).toLocaleDateString()}</td>
                            <td>{s.usuario_nombre}</td>
                            <td>{s.propiedad_desc}</td>
                            <td>{s.titulo}</td>
                            <td><span className={`status-${s.estado.toLowerCase().replace(' ', '')}`}>{s.estado}</span></td>
                            <td>
                                {s.estado === 'Pendiente' && (
                                    <select
                                        onChange={(e) => handleUpdateStatus(s.id, e.target.value)}
                                        value=""
                                        className="form-input"
                                        style={{padding: '0.3rem'}}
                                    >
                                        <option value="">Cambiar estado...</option>
                                        <option value="En Progreso">Marcar como "En Progreso"</option>
                                        <option value="Completada">Marcar como "Completada"</option>
                                        <option value="Cancelada">Marcar como "Cancelada"</option>
                                    </select>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
}

export default GestionMantenimiento;