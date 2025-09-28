import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaTrash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import '../../styles/Gestion.css';
import '../../styles/Reservas.css';
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
function GestionReservas({ user }) {
  const [areas, setAreas] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [usuarios, setUsuarios] = useState({});
  const [setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [selectedArea, setSelectedArea] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  const isAdmin = user.rol?.tipo === 'admin';

  // --- FUNCIÓN PARA MOSTRAR MENSAJES TEMPORALMENTE ---
  const showMessage = (setter, message) => {
    setter(message);
    setTimeout(() => {
        setter('');
    }, 4000); // El mensaje desaparecerá después de 4 segundos
  };

  const fetchData = async () => {
    // No limpiamos los mensajes aquí para que se puedan ver
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No autorizado.');
      const headers = { 'Authorization': `Token ${token}` };

      // Cargar áreas y reservas en paralelo para más eficiencia
      const [areasRes, reservasRes] = await Promise.all([
        fetch(`${API_URL}/api/areas-comunes/`, { headers }),
        fetch(`${API_URL}/api/reservas/?ordering=-fecha`, { headers })
      ]);

      if (!areasRes.ok) throw new Error('No se pudieron cargar las áreas comunes.');
      const areasData = await areasRes.json();
      setAreas(areasData.results || areasData);
      if ((areasData.results?.length > 0) && !selectedArea) {
        setSelectedArea(areasData.results[0].id);
      }

      if (!reservasRes.ok) throw new Error('No se pudieron cargar las reservas.');
      const reservasData = await reservasRes.json();
      setReservas(reservasData.results || reservasData);

      if (isAdmin) {
        const usersRes = await fetch(`${API_URL}/api/usuarios/`, { headers });
        if (!usersRes.ok) throw new Error('No se pudieron cargar los usuarios.');
        const usersData = await usersRes.json();
        const usersMap = (usersData.results || usersData).reduce((acc, u) => {
          acc[u.codigo] = `${u.nombre} ${u.apellido}`;
          return acc;
        }, {});
        setUsuarios(usersMap);
      }
    } catch (e) {
      showMessage(setError, e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReservaSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccessMessage(''); // Limpiamos mensajes al inicio de la acción
    try {
      // ... (código para la petición POST no cambia)
      const token = localStorage.getItem('authToken');
      const createRes = await fetch(`${API_URL}/api/reservas/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({
          id_area_c: selectedArea,
          fecha: selectedDate,
        }),
      });

      const resData = await createRes.json();
      if (!createRes.ok) throw new Error(resData.detail || 'No se pudo crear la solicitud.');

      showMessage(setSuccessMessage, '¡Solicitud de reserva enviada con éxito!');
      fetchData();
    } catch (e) {
      showMessage(setError, e.message);
    }
  };

  const handleUpdateStatus = async (reservaId, newStatus) => {
    setError(''); setSuccessMessage('');
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/api/reservas/${reservaId}/update_status/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`,
            },
            body: JSON.stringify({ estado: newStatus }),
        });

        const resData = await response.json();
        if (!response.ok) throw new Error(resData.error || `No se pudo ${newStatus.toLowerCase()}r la reserva.`);

        showMessage(setSuccessMessage, `Reserva ${newStatus.toLowerCase()}a con éxito.`);
        fetchData();
    } catch(e) {
        showMessage(setError, e.message);
    }
  }

  const handleCancelReserva = async (reservaId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta reserva?")) return;
    setError(''); setSuccessMessage('');
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/reservas/${reservaId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` },
      });

      if (response.status !== 204) throw new Error("No se pudo eliminar la reserva.");

      showMessage(setSuccessMessage, "Reserva eliminada con éxito.");
      fetchData();
    } catch (e) {
      showMessage(setError, e.message);
    }
  };

  // El resto del componente (la parte del return) no cambia.
  // ... (Pega el return que ya tenías)
  return (
    <div className="gestion-container">
      {!isAdmin && (
        <div className="reserva-form-container">
          <h3>Hacer una Nueva Solicitud de Reserva</h3>
          <form onSubmit={handleReservaSubmit} className="reserva-form">
            <div className="form-group">
              <label htmlFor="area">Área Común</label>
              <select id="area" value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)} className="form-input">
                {areas.map(area => <option key={area.id} value={area.id}>{area.descripcion}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="fecha">Fecha</label>
              <input type="date" id="fecha" value={selectedDate} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setSelectedDate(e.target.value)} className="form-input"/>
            </div>
            <button type="submit" className="btn btn-primary">Solicitar Reserva</button>
          </form>
        </div>
      )}

      <div className="reservas-list-container">
        <h3>{isAdmin ? 'Panel de Gestión de Reservas' : 'Mis Solicitudes de Reserva'}</h3>
        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
        <div className="gestion-table-wrapper">
          <table className="gestion-table">
            <thead>
              <tr>
                <th>Área Común</th>
                <th>Fecha</th>
                {isAdmin && <th>Solicitado por</th>}
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservas.length > 0 ? reservas.map(reserva => (
                <tr key={reserva.id}>
                  <td>{areas.find(a => a.id === reserva.id_area_c)?.descripcion || 'N/A'}</td>
                  <td>{reserva.fecha}</td>
                  {isAdmin && <td>{usuarios[reserva.codigousuario] || 'Residente'}</td>}
                  <td><span className={`status-${reserva.estado?.toLowerCase()}`}>{reserva.estado}</span></td>
                  <td className="actions-cell">
                    {isAdmin && reserva.estado === 'Pendiente' && (
                      <>
                        <button onClick={() => handleUpdateStatus(reserva.id, 'Aprobada')} className="btn-icon btn-approve"><FaCheckCircle /></button>
                        <button onClick={() => handleUpdateStatus(reserva.id, 'Rechazada')} className="btn-icon btn-reject"><FaTimesCircle /></button>
                      </>
                    )}
                    {(isAdmin || reserva.estado === 'Pendiente') && (
                      <button onClick={() => handleCancelReserva(reserva.id)} className="btn-icon btn-delete"><FaTrash /></button>
                    )}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={isAdmin ? 5 : 4}>No hay reservas para mostrar.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default GestionReservas;