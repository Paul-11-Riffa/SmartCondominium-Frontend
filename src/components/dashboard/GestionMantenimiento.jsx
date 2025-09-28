// src/components/dashboard/GestionMantenimiento.jsx

import React, { useState, useEffect } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';
import '../../styles/Gestion.css';
import '../../styles/Comunicados.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function GestionMantenimiento({ user }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [servicios, setServicios] = useState([]); // <-- Nuevo: catálogo de servicios
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({ titulo: '', descripcion: '' });

  const isAdmin = user.rol?.tipo === 'admin';

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const headers = { 'Authorization': `Token ${token}` };

      // Peticiones en paralelo
      const [solicitudesRes, serviciosRes] = await Promise.all([
        fetch(`${API_URL}/api/solicitudes-mantenimiento/`, { headers }),
        fetch(`${API_URL}/api/pagos/?tipo=Servicio`, { headers }) // <-- Traemos solo los de tipo Servicio
      ]);

      if (!solicitudesRes.ok) throw new Error('No se pudieron cargar las solicitudes.');
      const solicitudesData = await solicitudesRes.json();
      setSolicitudes(solicitudesData.results || solicitudesData);

      if (!serviciosRes.ok) throw new Error('No se pudo cargar el catálogo de servicios.');
      const serviciosData = await serviciosRes.json();
      setServicios(serviciosData.results || serviciosData);

    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (service) => {
    setSelectedService(service);
    setFormData({
      titulo: service.descripcion, // El título es el nombre del servicio
      descripcion: '' // El usuario puede añadir detalles
    });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    const body = {
      ...formData,
      id_pago: selectedService.id // <-- Enviamos el ID del servicio solicitado
    };
    try {
      const response = await fetch(`${API_URL}/api/solicitudes-mantenimiento/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error('No se pudo enviar la solicitud.');
      closeModal();
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  // ... (La vista de Admin no cambia mucho, puedes pegar el código que ya tenías o este)
  if (isAdmin) {
    // ... Vista de Admin para aprobar solicitudes
    return <div>Admin View Placeholder</div>;
  }

  // --- NUEVA VISTA PARA RESIDENTES ---
  return (
    <>
      <div className="gestion-container">
        <h3>Catálogo de Servicios</h3>
        <p>Selecciona un servicio para solicitarlo. El cobro se añadirá a tu estado de cuenta una vez completado.</p>
        <div className="comunicados-container">
          {servicios.map(service => (
            <div key={service.id} className="comunicado-card">
              <div className="comunicado-header">
                <div className="comunicado-title">
                  <h2>{service.descripcion}</h2>
                  <p style={{fontSize: '1.2em', color: '#43a047', fontWeight: 'bold'}}>
                    Costo: Bs. {parseFloat(service.monto).toFixed(2)}
                  </p>
                </div>
                <button className="btn btn-primary" onClick={() => openModal(service)}>
                  Solicitar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="gestion-container" style={{marginTop: '2rem'}}>
        <h3>Mis Solicitudes Realizadas</h3>
        {/* Aquí puedes mostrar la tabla de solicitudes que ya tenías */}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Confirmar Solicitud de: {selectedService?.descripcion}</h3>
              <button onClick={closeModal} className="btn-icon"><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>Añadir detalles o comentarios (opcional)</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  className="form-input"
                  rows="4"
                  placeholder="Ej: Por favor, realizar el mantenimiento por la tarde."
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn btn-primary">Confirmar y Solicitar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default GestionMantenimiento;