// src/components/dashboard/GestionMantenimientoPreventivo.jsx

import React, { useState, useEffect } from 'react';
import { FaPlus, FaPencilAlt, FaTrash, FaTimes } from 'react-icons/fa';
import '../../styles/Gestion.css';
import '../../styles/Comunicados.css'; // Reutilizamos estilos de modal

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function GestionMantenimientoPreventivo() {
  const [programaciones, setProgramaciones] = useState([]);
  const [tareas, setTareas] = useState([]); // El catálogo de tareas para el <select>
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados del modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({});

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const headers = { 'Authorization': `Token ${token}` };

      // Traemos las programaciones y el catálogo de tareas en paralelo
      const [programacionesRes, tareasRes] = await Promise.all([
        fetch(`${API_URL}/api/mantenimientos-preventivos/`, { headers }),
        fetch(`${API_URL}/api/tareas/`, { headers }),
      ]);

      if (!programacionesRes.ok) throw new Error('No se pudieron cargar las programaciones.');
      const programacionesData = await programacionesRes.json();
      setProgramaciones(programacionesData.results || programacionesData);

      if (!tareasRes.ok) throw new Error('No se pudo cargar el catálogo de tareas.');
      const tareasData = await tareasRes.json();
      setTareas(tareasData.results || tareasData);

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

  const openModal = (edit = false, item = null) => {
    setIsEditMode(edit);
    setCurrentItem(item);
    if (edit) {
      setFormData({
        id_tarea: item.id_tarea,
        frecuencia_dias: item.frecuencia_dias,
        fecha_inicio: item.fecha_inicio,
        estado: item.estado,
        descripcion_adicional: item.descripcion_adicional || ''
      });
    } else {
      setFormData({
        id_tarea: '',
        frecuencia_dias: '30',
        fecha_inicio: new Date().toISOString().split('T')[0],
        estado: 'activo',
        descripcion_adicional: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    const url = isEditMode
      ? `${API_URL}/api/mantenimientos-preventivos/${currentItem.id}/`
      : `${API_URL}/api/mantenimientos-preventivos/`;
    const method = isEditMode ? 'PATCH' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(Object.values(errData).flat().join(' '));
      }
      closeModal();
      fetchData();
    } catch (err) {
      setError(err.message); // Muestra el error en la UI si algo falla
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta programación?")) return;

    const token = localStorage.getItem('authToken');
    try {
      await fetch(`${API_URL}/api/mantenimientos-preventivos/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` },
      });
      fetchData(); // Recarga los datos
    } catch (e) {
      setError(e.message);
    }
  };

  if (isLoading) return <p>Cargando programaciones...</p>;

  return (
    <>
      <div className="gestion-container">
        <div className="gestion-header">
          <h2>Programación de Mantenimiento Preventivo</h2>
          <button className="btn btn-primary" onClick={() => openModal(false)}>
            <FaPlus /> Nueva Programación
          </button>
        </div>

        {error && <p className="error-message" style={{marginBottom: '1rem'}}>{error}</p>}

        <div className="gestion-table-wrapper">
          <table className="gestion-table">
            <thead>
              <tr>
                <th>Tarea</th>
                <th>Frecuencia</th>
                <th>Próxima Ejecución</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {programaciones.map(p => (
                <tr key={p.id}>
                  <td>{p.tarea_descripcion}</td>
                  <td>Cada {p.frecuencia_dias} días</td>
                  <td>{p.proxima_fecha}</td>
                  <td>
                    <span className={`status-${p.estado === 'activo' ? 'aprobada' : 'rechazada'}`}>
                      {p.estado}
                    </span>
                  </td>
                  <td className="actions-cell" style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => openModal(true, p)} className="btn-icon" title="Editar"><FaPencilAlt /></button>
                    <button onClick={() => handleDelete(p.id)} className="btn-icon" title="Eliminar"><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{isEditMode ? 'Editar Programación' : 'Nueva Programación'}</h3>
              <button onClick={closeModal} className="btn-icon"><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">

              <div className="form-group">
                <label>Tarea a Programar</label>
                <select name="id_tarea" value={formData.id_tarea} onChange={handleInputChange} className="form-input" required>
                  <option value="">Seleccione una tarea del catálogo...</option>
                  {tareas.map(t => <option key={t.id} value={t.id}>{t.descripcion}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Frecuencia (en días)</label>
                <input type="number" name="frecuencia_dias" value={formData.frecuencia_dias} onChange={handleInputChange} className="form-input" required />
              </div>

              <div className="form-group">
                <label>Fecha de Inicio de la Programación</label>
                <input type="date" name="fecha_inicio" value={formData.fecha_inicio} onChange={handleInputChange} className="form-input" required />
              </div>

              <div className="form-group">
                <label>Estado</label>
                <select name="estado" value={formData.estado} onChange={handleInputChange} className="form-input">
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default GestionMantenimientoPreventivo;