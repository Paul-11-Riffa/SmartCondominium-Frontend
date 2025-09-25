import React, { useState, useEffect } from 'react';
import { FaPlus, FaPencilAlt, FaTrash, FaTimes } from 'react-icons/fa';
import '../../styles/Gestion.css';
import '../../styles/Comunicados.css'; // Reutilizamos estilos de modal

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function GestionCuotas() {
  const [cuotas, setCuotas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados del modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCuota, setCurrentCuota] = useState(null);
  const [formData, setFormData] = useState({
    tipo: 'Mantenimiento',
    descripcion: '',
    monto: ''
  });

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/pagos/`, {
        headers: { 'Authorization': `Token ${token}` },
      });
      if (!response.ok) throw new Error('No se pudo cargar la lista de cuotas.');
      const data = await response.json();
      setCuotas(data.results || data);
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

  const openModalForCreate = () => {
    setIsEditMode(false);
    setCurrentCuota(null);
    setFormData({ tipo: 'Mantenimiento', descripcion: '', monto: '' });
    setIsModalOpen(true);
  };

  const openModalForEdit = (cuota) => {
    setIsEditMode(true);
    setCurrentCuota(cuota);
    setFormData({ tipo: cuota.tipo, descripcion: cuota.descripcion, monto: cuota.monto });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    const url = isEditMode ? `${API_URL}/api/pagos/${currentCuota.id}/` : `${API_URL}/api/pagos/`;
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
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta cuota?")) return;
    const token = localStorage.getItem('authToken');
    try {
      await fetch(`${API_URL}/api/pagos/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` },
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
          <h2>Configuración de Cuotas y Servicios</h2>
          <button className="btn btn-primary" onClick={openModalForCreate}>
            <FaPlus /> Añadir Cuota/Servicio
          </button>
        </div>

        {isLoading && <p>Cargando...</p>}
        {error && <p className="error-message">{error}</p>}

        {!isLoading && !error && (
          <div className="gestion-table-wrapper">
            <table className="gestion-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Descripción</th>
                  <th>Monto (Bs.)</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cuotas.map(c => (
                  <tr key={c.id}>
                    <td>{c.tipo}</td>
                    <td>{c.descripcion}</td>
                    <td>{parseFloat(c.monto).toFixed(2)}</td>
                    <td style={{ display: 'flex', gap: '1rem' }}>
                      <button onClick={() => openModalForEdit(c)} className="btn-icon" title="Editar"><FaPencilAlt /></button>
                      <button onClick={() => handleDelete(c.id)} className="btn-icon" title="Eliminar"><FaTrash /></button>
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
              <h3>{isEditMode ? 'Editar Cuota' : 'Nueva Cuota'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="btn-icon"><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>Tipo</label>
                <select name="tipo" value={formData.tipo} onChange={handleInputChange} className="form-input">
                  <option value="Mantenimiento">Mantenimiento</option>
                  <option value="Servicio">Servicio</option>
                  <option value="Extraordinaria">Extraordinaria</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div className="form-group"><label>Descripción</label><input name="descripcion" value={formData.descripcion} onChange={handleInputChange} className="form-input" required placeholder="Ej: Cuota de mantenimiento mensual" /></div>
              <div className="form-group"><label>Monto (Bs.)</label><input type="number" step="0.01" name="monto" value={formData.monto} onChange={handleInputChange} className="form-input" required placeholder="Ej: 500.00" /></div>
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

export default GestionCuotas;