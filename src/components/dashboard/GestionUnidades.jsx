import React, { useState, useEffect } from 'react';
import { FaPlus, FaPencilAlt, FaTrash, FaTimes } from 'react-icons/fa';
import '../../styles/Gestion.css';
import '../../styles/Comunicados.css'; // Reutilizamos el estilo del modal

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function GestionUnidades() {
  const [unidades, setUnidades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Estados para el modal y el formulario ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUnidad, setCurrentUnidad] = useState(null);
  const [formData, setFormData] = useState({
    nro_casa: '',
    piso: '',
    descripcion: '',
    tamano_m2: ''
  });

  // --- Función para obtener los datos ---
  const fetchUnidades = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No se encontró token de autenticación.');

      const response = await fetch(`${API_URL}/api/propiedades/`, {
        headers: { 'Authorization': `Token ${token}` },
      });

      if (!response.ok) throw new Error('No se pudo obtener la lista de unidades.');

      const data = await response.json();
      setUnidades(data.results || data);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnidades();
  }, []);

  // --- Handlers para el modal ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openModalForCreate = () => {
    setIsEditMode(false);
    setCurrentUnidad(null);
    setFormData({ nro_casa: '', piso: '', descripcion: '', tamano_m2: '' });
    setIsModalOpen(true);
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
    setIsModalOpen(true);
  };

  // --- Handlers para las acciones CRUD ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    const url = isEditMode
        ? `${API_URL}/api/propiedades/${currentUnidad.codigo}/`
        : `${API_URL}/api/propiedades/`;
    const method = isEditMode ? 'PATCH' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || Object.values(errData).flat().join(' '));
      }

      setIsModalOpen(false);
      fetchUnidades();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta unidad? Esta acción no se puede deshacer.")) return;

    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`${API_URL}/api/propiedades/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` },
      });

      if (response.status !== 204) throw new Error("No se pudo eliminar la unidad.");

      fetchUnidades();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <div className="gestion-container">
        <div className="gestion-header">
          <h2>Gestión de Unidades Habitacionales</h2>
          <button className="btn btn-primary" onClick={openModalForCreate}>
            <FaPlus /> Añadir Unidad
          </button>
        </div>

        {isLoading && <p>Cargando unidades...</p>}
        {error && <p className="error-message">Error: {error}</p>}

        {!isLoading && !error && (
          <div className="gestion-table-wrapper">
            <table className="gestion-table">
              <thead>
                <tr>
                  <th>Nro. Casa</th>
                  <th>Piso</th>
                  <th>Descripción</th>
                  <th>Tamaño (m²)</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {unidades.map((unidad) => (
                  <tr key={unidad.codigo}>
                    <td>{unidad.nro_casa}</td>
                    <td>{unidad.piso}</td>
                    <td>{unidad.descripcion}</td>
                    <td>{unidad.tamano_m2}</td>
                    <td style={{ display: 'flex', gap: '1rem' }}>
                      <button onClick={() => openModalForEdit(unidad)} className="btn-icon" title="Editar"><FaPencilAlt /></button>
                      <button onClick={() => handleDelete(unidad.codigo)} className="btn-icon" title="Eliminar"><FaTrash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- Modal para Crear/Editar Unidades --- */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{isEditMode ? 'Editar Unidad' : 'Nueva Unidad'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="btn-icon"><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group"><label>Número de Casa/Dpto</label><input type="number" name="nro_casa" value={formData.nro_casa} onChange={handleInputChange} className="form-input" required /></div>
              <div className="form-group"><label>Piso</label><input type="number" name="piso" value={formData.piso} onChange={handleInputChange} className="form-input" required /></div>
              <div className="form-group"><label>Descripción</label><input name="descripcion" value={formData.descripcion} onChange={handleInputChange} className="form-input" placeholder="Ej: Departamento con vista a la piscina" required /></div>
              <div className="form-group"><label>Tamaño (m²)</label><input type="number" step="0.01" name="tamano_m2" value={formData.tamano_m2} onChange={handleInputChange} className="form-input" placeholder="Ej: 85.50" /></div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
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