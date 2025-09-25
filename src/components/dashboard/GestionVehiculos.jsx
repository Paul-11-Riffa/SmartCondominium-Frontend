import React, { useState, useEffect } from 'react';
import { FaPlus, FaPencilAlt, FaTrash, FaTimes } from 'react-icons/fa';
import '../../styles/Gestion.css';
import '../../styles/Comunicados.css'; // Reutilizamos estilos de modal

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function GestionVehiculos({ user }) {
  const [vehiculos, setVehiculos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados del modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentVehiculo, setCurrentVehiculo] = useState(null);
  const [formData, setFormData] = useState({ nro_placa: '', descripcion: '' });

  const isAdmin = user.rol?.tipo === 'admin';

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/vehiculos/`, {
        headers: { 'Authorization': `Token ${token}` },
      });
      if (!response.ok) throw new Error('No se pudo cargar la lista de vehículos.');
      const data = await response.json();
      setVehiculos(data.results || data);
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
    setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
  };

  const openModalForCreate = () => {
    setIsEditMode(false);
    setCurrentVehiculo(null);
    setFormData({ nro_placa: '', descripcion: '' });
    setIsModalOpen(true);
  };

  const openModalForEdit = (vehiculo) => {
    setIsEditMode(true);
    setCurrentVehiculo(vehiculo);
    setFormData({ nro_placa: vehiculo.nro_placa, descripcion: vehiculo.descripcion });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    const url = isEditMode
      ? `${API_URL}/api/vehiculos/${currentVehiculo.id}/`
      : `${API_URL}/api/vehiculos/`;
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
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
      if (!window.confirm("¿Estás seguro de que quieres eliminar este vehículo?")) return;
      const token = localStorage.getItem('authToken');
      try {
          await fetch(`${API_URL}/api/vehiculos/${id}/`, {
              method: 'DELETE',
              headers: { 'Authorization': `Token ${token}` }
          });
          fetchData();
      } catch(e) {
          setError(e.message);
      }
  };

  return (
    <>
    <div className="gestion-container">
      <div className="gestion-header">
        <h2>{isAdmin ? 'Gestión de Vehículos' : 'Mis Vehículos'}</h2>
        <button className="btn btn-primary" onClick={openModalForCreate}>
          <FaPlus /> Añadir Vehículo
        </button>
      </div>

      {isLoading && <p>Cargando...</p>}
      {error && <p className="error-message">{error}</p>}

      {!isLoading && !error && (
        <div className="gestion-table-wrapper">
          <table className="gestion-table">
            <thead>
              <tr>
                <th>Nro. de Placa</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vehiculos.map(v => (
                <tr key={v.id}>
                  <td>{v.nro_placa}</td>
                  <td>{v.descripcion}</td>
                  <td>
                    <span className={`status-${v.estado === 'activo' ? 'aprobada' : 'rechazada'}`}>
                        {v.estado}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => openModalForEdit(v)} className="btn-icon" title="Editar"><FaPencilAlt /></button>
                    <button onClick={() => handleDelete(v.id)} className="btn-icon" title="Eliminar"><FaTrash /></button>
                  </td>
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
              <h3>{isEditMode ? 'Editar Vehículo' : 'Nuevo Vehículo'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="btn-icon"><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group"><label>Nro. de Placa</label><input name="nro_placa" value={formData.nro_placa} onChange={handleInputChange} className="form-input" required /></div>
              <div className="form-group"><label>Descripción</label><input name="descripcion" value={formData.descripcion} onChange={handleInputChange} className="form-input" required placeholder="Ej: Toyota Corolla Blanco" /></div>
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

export default GestionVehiculos;