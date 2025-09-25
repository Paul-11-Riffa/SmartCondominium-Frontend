import React, { useState, useEffect } from 'react';
import { FaPlus, FaPencilAlt, FaTrash, FaTimes } from 'react-icons/fa';
import '../../styles/Gestion.css';
import '../../styles/Comunicados.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function GestionMultas() {
  // --- ESTADOS ---
  const [multas, setMultas] = useState([]); // Catálogo de tipos de multa
  const [multasAplicadas, setMultasAplicadas] = useState([]); // Multas ya asignadas
  const [propiedades, setPropiedades] = useState([]); // Para el dropdown
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para controlar el modal
  const [modalType, setModalType] = useState(null); // 'catalogo' o 'aplicar'
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({});

  // --- OBTENCIÓN DE DATOS ---
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const headers = { 'Authorization': `Token ${token}` };

      const requests = [
        fetch(`${API_URL}/api/multas/`, { headers }),
        fetch(`${API_URL}/api/detalle-multa/`, { headers }),
        fetch(`${API_URL}/api/propiedades/`, { headers }),
      ];

      const responses = await Promise.all(requests);
      const data = await Promise.all(responses.map(res => res.json()));

      setMultas(data[0].results || data[0]);
      setMultasAplicadas(data[1].results || data[1]);
      setPropiedades(data[2].results || data[2]);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- MANEJO DE MODALES ---
  const openModal = (type, edit = false, item = null) => {
    setModalType(type);
    setIsEditMode(edit);
    setCurrentItem(item);
    if (edit) {
      setFormData(item);
    } else {
      if (type === 'catalogo') setFormData({ descripcion: '', monto: '', estado: 'activo' });
      if (type === 'aplicar') setFormData({ codigo_propiedad: '', id_multa: '', fecha_emi: new Date().toISOString().split('T')[0], fecha_lim: '' });
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
    const endpoint = modalType === 'catalogo' ? 'multas' : 'detalle-multa';
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

  // --- RENDERIZADO ---
  if (isLoading) return <p>Cargando...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <>
      {/* SECCIÓN 1: Catálogo de Tipos de Multa */}
      <div className="gestion-container" style={{marginBottom: '2rem'}}>
        <div className="gestion-header">
          <h3>Tipos de Multa (Catálogo)</h3>
          <button className="btn btn-primary" onClick={() => openModal('catalogo')}>
            <FaPlus /> Añadir Tipo de Multa
          </button>
        </div>
        <table className="gestion-table">
          <thead><tr><th>Descripción</th><th>Monto (Bs.)</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            {multas.map(m => (
              <tr key={m.id}>
                <td>{m.descripcion}</td><td>{parseFloat(m.monto).toFixed(2)}</td>
                <td><span className={`status-${m.estado === 'activo' ? 'aprobada' : 'rechazada'}`}>{m.estado}</span></td>
                <td><button onClick={() => openModal('catalogo', true, m)} className="btn-icon"><FaPencilAlt /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SECCIÓN 2: Multas Aplicadas a Unidades */}
      <div className="gestion-container">
        <div className="gestion-header">
          <h3>Multas Aplicadas</h3>
          <button className="btn btn-primary" onClick={() => openModal('aplicar')}>
            <FaPlus /> Aplicar Multa a Unidad
          </button>
        </div>
        <table className="gestion-table">
            <thead><tr><th>Unidad</th><th>Tipo de Multa</th><th>Fecha Emisión</th><th>Fecha Límite</th><th>Acciones</th></tr></thead>
            <tbody>
              {multasAplicadas.map(ma => (
                 <tr key={ma.id}>
                   <td>Casa {propiedades.find(p => p.codigo === ma.codigo_propiedad)?.nro_casa || 'N/A'}</td>
                   <td>{multas.find(m => m.id === ma.id_multa)?.descripcion || 'N/A'}</td>
                   <td>{ma.fecha_emi}</td><td>{ma.fecha_lim}</td>
                   <td><button onClick={() => openModal('aplicar', true, ma)} className="btn-icon"><FaPencilAlt /></button></td>
                 </tr>
              ))}
            </tbody>
          </table>
      </div>

      {/* --- MODALES --- */}
      {modalType === 'catalogo' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header"><h3>{isEditMode ? 'Editar Tipo de Multa' : 'Nuevo Tipo de Multa'}</h3><button onClick={closeModal} className="btn-icon"><FaTimes /></button></div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group"><label>Descripción</label><input name="descripcion" value={formData.descripcion || ''} onChange={handleInputChange} className="form-input" required /></div>
              <div className="form-group"><label>Monto (Bs.)</label><input type="number" step="0.01" name="monto" value={formData.monto || ''} onChange={handleInputChange} className="form-input" required /></div>
              <div className="form-group"><label>Estado</label>
                <select name="estado" value={formData.estado || 'activo'} onChange={handleInputChange} className="form-input">
                  <option value="activo">Activo</option><option value="inactivo">Inactivo</option>
                </select>
              </div>
              <div className="modal-actions"><button type="button" onClick={closeModal} className="btn btn-secondary">Cancelar</button><button type="submit" className="btn btn-primary">Guardar</button></div>
            </form>
          </div>
        </div>
      )}

      {modalType === 'aplicar' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header"><h3>{isEditMode ? 'Editar Multa Aplicada' : 'Aplicar Nueva Multa'}</h3><button onClick={closeModal} className="btn-icon"><FaTimes /></button></div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group"><label>Aplicar a la Unidad</label>
                <select name="codigo_propiedad" value={formData.codigo_propiedad || ''} onChange={handleInputChange} className="form-input" required>
                  <option value="">Seleccione una unidad...</option>
                  {propiedades.map(p => <option key={p.codigo} value={p.codigo}>{`Casa ${p.nro_casa} - ${p.descripcion}`}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Tipo de Multa</label>
                <select name="id_multa" value={formData.id_multa || ''} onChange={handleInputChange} className="form-input" required>
                  <option value="">Seleccione una multa del catálogo...</option>
                  {multas.filter(m => m.estado === 'activo').map(m => <option key={m.id} value={m.id}>{m.descripcion}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Fecha de Emisión</label><input type="date" name="fecha_emi" value={formData.fecha_emi || ''} onChange={handleInputChange} className="form-input" required /></div>
              <div className="form-group"><label>Fecha Límite de Pago</label><input type="date" name="fecha_lim" value={formData.fecha_lim || ''} onChange={handleInputChange} className="form-input" required /></div>
              <div className="modal-actions"><button type="button" onClick={closeModal} className="btn btn-secondary">Cancelar</button><button type="submit" className="btn btn-primary">Guardar</button></div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default GestionMultas;