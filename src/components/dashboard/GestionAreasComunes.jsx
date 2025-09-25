import React, { useState, useEffect } from 'react';
import { FaPlus, FaPencilAlt, FaTrash, FaTimes, FaClock } from 'react-icons/fa';
import '../../styles/Gestion.css';
import '../../styles/Comunicados.css'; // Reutilizamos estilos de modal

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function GestionAreasComunes() {
  const [areas, setAreas] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para controlar el modal
  const [modalType, setModalType] = useState(null); // 'area' o 'horario'
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({});

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const headers = { 'Authorization': `Token ${token}` };

      const [areasRes, horariosRes] = await Promise.all([
        fetch(`${API_URL}/api/areas-comunes/`, { headers }),
        fetch(`${API_URL}/api/horarios/`, { headers }),
      ]);

      if (!areasRes.ok) throw new Error('No se pudieron cargar las áreas comunes.');
      const areasData = await areasRes.json();
      setAreas(areasData.results || areasData);

      if (!horariosRes.ok) throw new Error('No se pudieron cargar los horarios.');
      const horariosData = await horariosRes.json();
      setHorarios(horariosData.results || horariosData);

    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (type, edit = false, item = null, parentAreaId = null) => {
    setModalType(type);
    setIsEditMode(edit);
    setCurrentItem(item);
    if (edit) {
      setFormData(item);
    } else {
      if (type === 'area') setFormData({ descripcion: '', costo: '0', capacidad_max: '10', estado: 'disponible' });
      if (type === 'horario') setFormData({ id_area_c: parentAreaId, hora_ini: '09:00', hora_fin: '22:00' });
    }
  };

  const closeModal = () => setModalType(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    const endpoint = modalType === 'area' ? 'areas-comunes' : 'horarios';
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

  if (isLoading) return <p>Cargando...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <>
      <div className="gestion-container">
        <div className="gestion-header">
          <h2>Gestión de Áreas Comunes</h2>
          <button className="btn btn-primary" onClick={() => openModal('area')}>
            <FaPlus /> Añadir Área Común
          </button>
        </div>

        <div className="comunicados-container">
          {areas.map(area => (
            <div key={area.id} className="comunicado-card">
              <div className="comunicado-header">
                <div className="comunicado-title">
                  <h2>{area.descripcion}</h2>
                  <p>Costo: Bs. {area.costo} | Capacidad: {area.capacidad_max} personas | Estado: {area.estado}</p>
                </div>
                <div>
                  <button onClick={() => openModal('area', true, area)} className="btn-icon"><FaPencilAlt /></button>
                </div>
              </div>
              <div className="comunicado-body">
                <h4><FaClock /> Horarios de Disponibilidad</h4>
                <ul className="widget-list">
                  {horarios.filter(h => h.id_area_c === area.id).map(h => (
                    <li key={h.id}>
                      <span>De {h.hora_ini} a {h.hora_fin}</span>
                      <div>
                        <button onClick={() => openModal('horario', true, h)} className="btn-icon"><FaPencilAlt /></button>
                      </div>
                    </li>
                  ))}
                </ul>
                <button onClick={() => openModal('horario', false, null, area.id)} className="btn btn-secondary" style={{marginTop: '1rem'}}>
                    <FaPlus /> Añadir Horario
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODALES */}
      {modalType === 'area' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header"><h3>{isEditMode ? 'Editar Área' : 'Nueva Área'}</h3><button onClick={closeModal} className="btn-icon"><FaTimes /></button></div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group"><label>Descripción</label><input name="descripcion" value={formData.descripcion || ''} onChange={handleInputChange} className="form-input" required /></div>
              <div className="form-group"><label>Costo (Bs.)</label><input type="number" step="0.01" name="costo" value={formData.costo || ''} onChange={handleInputChange} className="form-input" required /></div>
              <div className="form-group"><label>Capacidad Máxima</label><input type="number" name="capacidad_max" value={formData.capacidad_max || ''} onChange={handleInputChange} className="form-input" required /></div>
              <div className="form-group"><label>Estado</label>
                <select name="estado" value={formData.estado || 'disponible'} onChange={handleInputChange} className="form-input">
                  <option value="disponible">Disponible</option><option value="mantenimiento">Mantenimiento</option><option value="cerrado">Cerrado</option>
                </select>
              </div>
              <div className="modal-actions"><button type="button" onClick={closeModal} className="btn btn-secondary">Cancelar</button><button type="submit" className="btn btn-primary">Guardar</button></div>
            </form>
          </div>
        </div>
      )}

      {modalType === 'horario' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header"><h3>{isEditMode ? 'Editar Horario' : 'Nuevo Horario'}</h3><button onClick={closeModal} className="btn-icon"><FaTimes /></button></div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group"><label>Hora de Inicio</label><input type="time" name="hora_ini" value={formData.hora_ini || ''} onChange={handleInputChange} className="form-input" required /></div>
              <div className="form-group"><label>Hora de Fin</label><input type="time" name="hora_fin" value={formData.hora_fin || ''} onChange={handleInputChange} className="form-input" required /></div>
              <div className="modal-actions"><button type="button" onClick={closeModal} className="btn btn-secondary">Cancelar</button><button type="submit" className="btn btn-primary">Guardar</button></div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default GestionAreasComunes;