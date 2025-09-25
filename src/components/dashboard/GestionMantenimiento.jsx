import React, { useState, useEffect } from 'react';
import { FaPlus, FaTimes, FaCheck, FaHammer, FaPencilAlt, FaTrash } from 'react-icons/fa';
import '../../styles/Gestion.css';
import '../../styles/Comunicados.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function GestionMantenimiento({ user }) {
  // --- ESTADOS ---
  const [solicitudes, setSolicitudes] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [personal, setPersonal] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para controlar el modal activo
  const [modalType, setModalType] = useState(null); // 'tarea' o 'asignacion'
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({});

  const isAdmin = user.rol?.tipo === 'admin';

  // --- OBTENCIÓN DE DATOS ---
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const headers = { 'Authorization': `Token ${token}` };

      const requests = [
        fetch(`${API_URL}/api/solicitudes-mantenimiento/`, { headers }),
        fetch(`${API_URL}/api/tareas/`, { headers }),
        fetch(`${API_URL}/api/asignaciones/`, { headers }),
        fetch(`${API_URL}/api/usuarios/?idrol__tipo=admin`, { headers }), // Asumimos que asignamos a otros admins/personal
      ];

      const responses = await Promise.all(requests);
      const data = await Promise.all(responses.map(res => res.json()));

      setSolicitudes(data[0].results || data[0]);
      setTareas(data[1].results || data[1]);
      setAsignaciones(data[2].results || data[2]);
      setPersonal(data[3].results || data[3]);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin]);

  // --- MANEJO DE MODALES ---
  const openModal = (type, edit = false, item = null) => {
    setModalType(type);
    setIsEditMode(edit);
    setCurrentItem(item);
    if (edit) {
      setFormData(item);
    } else {
      // Valores por defecto para cada tipo de formulario
      if (type === 'tarea') setFormData({ tipo: 'Preventivo', descripcion: '', costos: '' });
      if (type === 'asignacion') setFormData({ idtarea: '', codigousuario: '', fechaini: '', fechafin: '', estado: 'Pendiente' });
    }
  };

  const closeModal = () => setModalType(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- ACCIONES CRUD ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    const endpoint = modalType === 'tarea' ? 'tareas' : 'asignaciones';
    const url = isEditMode ? `${API_URL}/api/${endpoint}/${currentItem.id}/` : `${API_URL}/api/${endpoint}/`;
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
      setError(err.message);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar este elemento?`)) return;
    const token = localStorage.getItem('authToken');
    try {
      await fetch(`${API_URL}/api/${type}/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` },
      });
      fetchData();
    } catch (e) {
      setError(e.message);
    }
  };

  // (La vista de residente se puede añadir aquí si es necesario)
  if (!isAdmin) return <p>Acceso denegado.</p>
  if (isLoading) return <p>Cargando...</p>
  if (error) return <p className="error-message">{error}</p>

  return (
    <>
      {/* Solicitudes de Residentes (Solo vista) */}
      <div className="gestion-container" style={{marginBottom: '2rem'}}>
        <h3>Solicitudes Recibidas de Residentes</h3>
        {/* ... (Tabla de solicitudes) ... */}
      </div>

      {/* Catálogo de Tareas */}
      <div className="gestion-container" style={{marginBottom: '2rem'}}>
        <div className="gestion-header">
          <h3>Catálogo de Tareas de Mantenimiento</h3>
          <button className="btn btn-primary" onClick={() => openModal('tarea')}>
            <FaPlus /> Añadir Tipo de Tarea
          </button>
        </div>
        <table className="gestion-table">
          <thead><tr><th>Tipo</th><th>Descripción</th><th>Costo (Bs.)</th><th>Acciones</th></tr></thead>
          <tbody>
            {tareas.map(t => (
              <tr key={t.id}>
                <td>{t.tipo}</td><td>{t.descripcion}</td><td>{parseFloat(t.costos).toFixed(2)}</td>
                <td>
                  <button onClick={() => openModal('tarea', true, t)} className="btn-icon"><FaPencilAlt /></button>
                  <button onClick={() => handleDelete('tareas', t.id)} className="btn-icon"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Asignación de Tareas */}
      <div className="gestion-container">
        <div className="gestion-header">
          <h3>Tareas Asignadas</h3>
          <button className="btn btn-primary" onClick={() => openModal('asignacion')}>
            <FaPlus /> Asignar Nueva Tarea
          </button>
        </div>
        <table className="gestion-table">
            <thead><tr><th>Tarea</th><th>Asignado a</th><th>Fechas</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {asignaciones.map(a => (
                 <tr key={a.id}>
                   <td>{tareas.find(t => t.id === a.idtarea)?.descripcion || 'N/A'}</td>
                   <td>{`${personal.find(p => p.codigo === a.codigousuario)?.nombre || ''} ${personal.find(p => p.codigo === a.codigousuario)?.apellido || ''}`}</td>
                   <td>{a.fechaini} - {a.fechafin}</td>
                   <td><span className={`status-${a.estado?.toLowerCase()}`}>{a.estado}</span></td>
                   <td>
                     <button onClick={() => openModal('asignacion', true, a)} className="btn-icon"><FaPencilAlt /></button>
                     <button onClick={() => handleDelete('asignaciones', a.id)} className="btn-icon"><FaTrash /></button>
                   </td>
                 </tr>
              ))}
            </tbody>
          </table>
      </div>

      {/* --- MODALES --- */}
      {modalType === 'tarea' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header"><h3>{isEditMode ? 'Editar Tarea' : 'Nueva Tarea'}</h3><button onClick={closeModal} className="btn-icon"><FaTimes /></button></div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group"><label>Tipo</label><input name="tipo" value={formData.tipo || ''} onChange={handleInputChange} className="form-input" /></div>
              <div className="form-group"><label>Descripción</label><input name="descripcion" value={formData.descripcion || ''} onChange={handleInputChange} className="form-input" required /></div>
              <div className="form-group"><label>Costo Base (Bs.)</label><input type="number" step="0.01" name="costos" value={formData.costos || ''} onChange={handleInputChange} className="form-input" required /></div>
              <div className="modal-actions"><button type="button" onClick={closeModal} className="btn btn-secondary">Cancelar</button><button type="submit" className="btn btn-primary">Guardar</button></div>
            </form>
          </div>
        </div>
      )}

      {modalType === 'asignacion' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header"><h3>{isEditMode ? 'Editar Asignación' : 'Nueva Asignación'}</h3><button onClick={closeModal} className="btn-icon"><FaTimes /></button></div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group"><label>Tarea a Asignar</label>
                <select name="idtarea" value={formData.idtarea || ''} onChange={handleInputChange} className="form-input" required>
                  <option value="">Seleccione una tarea...</option>
                  {tareas.map(t => <option key={t.id} value={t.id}>{t.descripcion}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Asignar a Personal</label>
                <select name="codigousuario" value={formData.codigousuario || ''} onChange={handleInputChange} className="form-input" required>
                  <option value="">Seleccione un usuario...</option>
                  {personal.map(p => <option key={p.codigo} value={p.codigo}>{`${p.nombre} ${p.apellido}`}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Fecha de Inicio</label><input type="date" name="fechaini" value={formData.fechaini || ''} onChange={handleInputChange} className="form-input" required /></div>
              <div className="form-group"><label>Fecha de Fin</label><input type="date" name="fechafin" value={formData.fechafin || ''} onChange={handleInputChange} className="form-input" required /></div>
              <div className="form-group"><label>Estado</label>
                <select name="estado" value={formData.estado || 'Pendiente'} onChange={handleInputChange} className="form-input">
                  <option>Pendiente</option><option>En Progreso</option><option>Completada</option><option>Cancelada</option>
                </select>
              </div>
              <div className="modal-actions"><button type="button" onClick={closeModal} className="btn btn-secondary">Cancelar</button><button type="submit" className="btn btn-primary">Guardar</button></div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default GestionMantenimiento;