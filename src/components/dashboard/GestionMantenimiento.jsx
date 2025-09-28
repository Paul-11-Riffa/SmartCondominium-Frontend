// src/components/dashboard/GestionMantenimiento.jsx

import React, { useState, useEffect } from 'react';
import { FaTools } from 'react-icons/fa';
import '../../styles/Gestion.css';
import '../../styles/Comunicados.css';
import '../../styles/Reservas.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function GestionMantenimiento({ user }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [servicios, setServicios] = useState([]); // <-- NUEVO: para guardar el catálogo de servicios
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  const isAdmin = user.rol?.tipo === 'admin';

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess('');
    try {
      const token = localStorage.getItem('authToken');
      const headers = { 'Authorization': `Token ${token}` };

      // Hacemos las peticiones en paralelo
      const [solicitudesRes, serviciosRes] = await Promise.all([
        fetch(`${API_URL}/api/solicitudes-mantenimiento/`, { headers }),
        fetch(`${API_URL}/api/solicitudes-mantenimiento/servicios-disponibles/`, { headers })
      ]);

      if (!solicitudesRes.ok) throw new Error('No se pudieron cargar las solicitudes.');
      const solicitudesData = await solicitudesRes.json();
      setSolicitudes(solicitudesData.results || solicitudesData);

      if (!serviciosRes.ok) throw new Error('No se pudo cargar el catálogo de servicios.');
      const serviciosData = await serviciosRes.json();
      setServicios(serviciosData);

    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- NUEVA FUNCIÓN PARA SOLICITAR UN SERVICIO ---
  const handleRequestService = async (servicio) => {
    if (!window.confirm(`¿Seguro que quieres solicitar el servicio "${servicio.descripcion}" por Bs. ${servicio.monto}? El cobro se añadirá a tu estado de cuenta una vez completado.`)) {
      return;
    }
    setError(null);
    setSuccess('');
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/solicitudes-mantenimiento/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
        body: JSON.stringify({
          titulo: `Solicitud de: ${servicio.descripcion}`,
          descripcion: `Solicitud automática del servicio del catálogo.`,
          id_pago: servicio.id // <-- Enviamos el ID del servicio para el cobro
        }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(Object.values(errData).flat().join(' '));
      }
      setSuccess('¡Servicio solicitado con éxito!');
      fetchData(); // Recargamos la lista
    } catch (err) {
      setError(err.message);
    }
  };

  // --- LÓGICA DE ADMIN (No cambia mucho) ---
  const handleUpdateStatus = async (solicitudId, nuevoEstado) => {
      // ... (esta función no necesita cambios)
  };

  if (isLoading) return <p>Cargando...</p>;

  // --- VISTA PARA RESIDENTES (COMPLETAMENTE NUEVA) ---
  if (!isAdmin) {
    return (
      <>
        <div className="gestion-container" style={{ marginBottom: '2rem' }}>
          <h3>Catálogo de Servicios</h3>
          <p>Selecciona un servicio para solicitarlo. El cobro se añadirá a tu estado de cuenta una vez completado.</p>
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
          <div className="gestion-table-wrapper">
            <table className="gestion-table">
              <thead>
                <tr>
                  <th>Servicio</th>
                  <th>Costo (Bs.)</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {servicios.length > 0 ? servicios.map(s => (
                  <tr key={s.id}>
                    <td>{s.descripcion}</td>
                    <td style={{ textAlign: 'right' }}>{parseFloat(s.monto).toFixed(2)}</td>
                    <td>
                      <button className="btn btn-primary" onClick={() => handleRequestService(s)}>
                        <FaTools /> Solicitar
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="3">No hay servicios disponibles en el catálogo en este momento.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="gestion-container">
          <h3>Mis Solicitudes Realizadas</h3>
          <div className="gestion-table-wrapper">
            <table className="gestion-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Título</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.length > 0 ? solicitudes.map(s => (
                  <tr key={s.id}>
                    <td>{new Date(s.fecha_solicitud).toLocaleDateString()}</td>
                    <td>{s.titulo}</td>
                    <td><span className={`status-${s.estado.toLowerCase().replace(' ', '')}`}>{s.estado}</span></td>
                  </tr>
                )) : (
                  <tr><td colSpan="3">No has realizado ninguna solicitud.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  }

  // --- VISTA PARA ADMINISTRADORES (SIN CAMBIOS) ---
  return (
     <div className="gestion-container">
        <h3>Solicitudes de Mantenimiento Recibidas</h3>
        {error && <p className="error-message">{error}</p>}
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
                                {(s.estado === 'Pendiente' || s.estado === 'En Progreso') && (
                                    <select
                                        onChange={(e) => handleUpdateStatus(s.id, e.target.value)}
                                        value={s.estado}
                                        className="form-input"
                                        style={{padding: '0.3rem'}}
                                    >
                                        <option value="Pendiente" disabled>Pendiente</option>
                                        <option value="En Progreso">Marcar "En Progreso"</option>
                                        <option value="Completada">Marcar "Completada"</option>
                                        <option value="Cancelada">Marcar "Cancelada"</option>
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