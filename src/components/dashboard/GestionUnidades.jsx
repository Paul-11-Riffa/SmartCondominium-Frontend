import React, { useState, useEffect } from 'react';
import { FaPlus, FaPencilAlt, FaTimes, FaUserPlus, FaUserSlash } from 'react-icons/fa';
import '../../styles/Gestion.css';
import '../../styles/Comunicados.css'; // Reutilizamos el estilo del modal

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function GestionUnidades() {
  const [unidades, setUnidades] = useState([]);
  const [usuarios, setUsuarios] = useState([]); // Para el dropdown de asignación
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal para crear/editar una unidad
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUnidad, setCurrentUnidad] = useState(null);
  const [formData, setFormData] = useState({});

  // Modal para asignar un residente a una unidad
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [unidadParaAsignar, setUnidadParaAsignar] = useState(null);
  const [assignFormData, setAssignFormData] = useState({});

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const headers = { 'Authorization': `Token ${token}` };

      // Hacemos las dos peticiones en paralelo para mejorar la velocidad
      const [unidadesRes, usuariosRes] = await Promise.all([
        fetch(`${API_URL}/api/propiedades/`, { headers }),
        fetch(`${API_URL}/api/usuarios/?estado=activo`, { headers }) // Solo traemos usuarios activos para asignar
      ]);

      if (!unidadesRes.ok) throw new Error('No se pudo obtener la lista de unidades.');
      const unidadesData = await unidadesRes.json();
      setUnidades(unidadesData.results || unidadesData);

      if (!usuariosRes.ok) throw new Error('No se pudo obtener la lista de usuarios.');
      const usuariosData = await usuariosRes.json();
      setUsuarios(usuariosData.results || usuariosData);

    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Handlers para el MODAL DE CREAR/EDITAR UNIDAD ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openModalForCreate = () => {
    setIsEditMode(false);
    setCurrentUnidad(null);
    setFormData({ nro_casa: '', piso: '', descripcion: '', tamano_m2: '' });
    setIsEditModalOpen(true);
  };

  const openModalForEdit = (unidad) => {
    setIsEditMode(true);
    setCurrentUnidad(unidad);
    setFormData({
        nro_casa: unidad.nro_casa,
        piso: unidad.piso,
        descripcion: unidad.descripcion,
        tamano_m2: unidad.tamano_m2
    });
    setIsEditModalOpen(true);
  };

  const handleUnitSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    const url = isEditMode ? `${API_URL}/api/propiedades/${currentUnidad.codigo}/` : `${API_URL}/api/propiedades/`;
    const method = isEditMode ? 'PATCH' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'No se pudo guardar la unidad.');
      }
      setIsEditModalOpen(false);
      fetchData();
    } catch (err) { setError(err.message); }
  };

  // --- Handlers para el MODAL DE ASIGNACIÓN DE RESIDENTE ---
  const handleAssignInputChange = (e) => {
    const { name, value } = e.target;
    setAssignFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAssignModal = (unidad) => {
    setUnidadParaAsignar(unidad);
    setAssignFormData({
      codigo_usuario: '',
      rol_en_propiedad: 'Inquilino', // Valor por defecto
      fecha_ini: new Date().toISOString().split('T')[0],
      fecha_fin: ''
    });
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    const body = {
      ...assignFormData,
      codigo_propiedad: unidadParaAsignar.codigo,
    };
    if (!body.fecha_fin) {
      delete body.fecha_fin;
    }
    try {
      const response = await fetch(`${API_URL}/api/pertenece/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
        body: JSON.stringify(body),
      });
       if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'No se pudo asignar el residente.');
      }
      setIsAssignModalOpen(false);
      fetchData();
    } catch (err) { setError(err.message); }
  };

  // --- Handler para QUITAR ASIGNACIÓN DE RESIDENTE ---
  const handleRemoveAssignment = async (perteneceId) => {
    if (!window.confirm("¿Seguro que quieres quitar a este residente de la unidad?")) return;
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`${API_URL}/api/pertenece/${perteneceId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` },
      });
      if (response.status !== 204) throw new Error('No se pudo quitar la asignación.');
      fetchData();
    } catch (err) { setError(err.message); }
  };

  if (isLoading) return <p>Cargando unidades y residentes...</p>;
  if (error) return <p className="error-message">Error: {error}</p>;

  return (
    <>
      <div className="gestion-container">
        <div className="gestion-header">
          <h2>Gestión de Unidades y Residentes</h2>
          <button className="btn btn-primary" onClick={openModalForCreate}>
            <FaPlus /> Añadir Unidad
          </button>
        </div>

        <div className="unidades-grid">
          {unidades.map((unidad) => (
            <div key={unidad.codigo} className="unidad-card">
              <div className="unidad-card-header">
                <h4>{unidad.descripcion} (Casa {unidad.nro_casa})</h4>
                <button onClick={() => openModalForEdit(unidad)} className="btn-icon" title="Editar detalles de la unidad"><FaPencilAlt /></button>
              </div>
              <div className="unidad-card-body">
                <h5>Residentes Asignados:</h5>
                {unidad.residentes_actuales && unidad.residentes_actuales.length > 0 ? (
                  <ul className="residentes-list">
                    {unidad.residentes_actuales.map(res => (
                      <li key={res.pertenece_id}>
                        <span>
                          <strong>{res.nombre_completo}</strong> ({res.rol_en_propiedad})
                        </span>
                        <button onClick={() => handleRemoveAssignment(res.pertenece_id)} className="btn-icon" title="Quitar Residente"><FaUserSlash/></button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-residentes">No hay residentes asignados a esta unidad.</p>
                )}
              </div>
              <div className="unidad-card-footer">
                <button className="btn btn-secondary" onClick={() => openAssignModal(unidad)}><FaUserPlus /> Asignar Residente</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL PARA ASIGNAR RESIDENTE */}
      {isAssignModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Asignar Residente a {unidadParaAsignar?.descripcion}</h3>
              <button onClick={() => setIsAssignModalOpen(false)} className="btn-icon"><FaTimes /></button>
            </div>
            <form onSubmit={handleAssignSubmit} className="modal-body">
              <div className="form-group">
                <label>Usuario</label>
                <select name="codigo_usuario" value={assignFormData.codigo_usuario} onChange={handleAssignInputChange} className="form-input" required>
                  <option value="">Seleccione un usuario...</option>
                  {usuarios.map(u => <option key={u.codigo} value={u.codigo}>{u.nombre} {u.apellido}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Rol en la Propiedad</label>
                <select name="rol_en_propiedad" value={assignFormData.rol_en_propiedad} onChange={handleAssignInputChange} className="form-input" required>
                  <option value="Propietario">Propietario</option>
                  <option value="Copropietario">Copropietario</option>
                  <option value="Inquilino">Inquilino</option>
                  <option value="Familiar">Familiar Residente</option>
                </select>
              </div>
              <div className="form-group">
                <label>Fecha de Inicio</label>
                <input type="date" name="fecha_ini" value={assignFormData.fecha_ini} onChange={handleAssignInputChange} className="form-input" required/>
              </div>
              <div className="form-group">
                <label>Fecha de Fin (Opcional, dejar en blanco si es indefinido)</label>
                <input type="date" name="fecha_fin" value={assignFormData.fecha_fin} onChange={handleAssignInputChange} className="form-input" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAssignModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Asignar Usuario</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Crear/Editar Unidad */}
      {isEditModalOpen && (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                <h3>{isEditMode ? 'Editar Unidad' : 'Nueva Unidad'}</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="btn-icon"><FaTimes /></button>
                </div>
                <form onSubmit={handleUnitSubmit} className="modal-body">
                    <div className="form-group"><label>Número de Casa/Dpto</label><input type="number" name="nro_casa" value={formData.nro_casa} onChange={handleInputChange} className="form-input" required /></div>
                    <div className="form-group"><label>Piso</label><input type="number" name="piso" value={formData.piso} onChange={handleInputChange} className="form-input" required /></div>
                    <div className="form-group"><label>Descripción</label><input name="descripcion" value={formData.descripcion} onChange={handleInputChange} className="form-input" placeholder="Ej: Departamento con vista a la piscina" required /></div>
                    <div className="form-group"><label>Tamaño (m²)</label><input type="number" step="0.01" name="tamano_m2" value={formData.tamano_m2} onChange={handleInputChange} className="form-input" placeholder="Ej: 85.50" /></div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </>
  );
}

export default GestionUnidades;