import React, { useState, useEffect } from 'react';
import { FaPlus, FaTimes, FaTrash, FaQrcode } from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import '../../styles/Gestion.css';
import '../../styles/Comunicados.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function GestionVisitantes({ user }) {
  const [visitantes, setVisitantes] = useState([]);
  const [propiedadId, setPropiedadId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVisitante, setNewVisitante] = useState({
    nombre: '',
    apellido: '',
    carnet: '',
    motivo_visita: '',
    fecha_ini: new Date().toISOString().split('T')[0],
    fecha_fin: new Date().toISOString().split('T')[0],
  });

  const [qrCodeData, setQrCodeData] = useState(null);
  const [currentVisitor, setCurrentVisitor] = useState(null);

  const fetchUserProperty = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/pertenece/?codigo_usuario=${user.codigo}&activas=true`, {
        headers: { 'Authorization': `Token ${token}` },
      });
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        setPropiedadId(data.results[0].codigo_propiedad);
        return data.results[0].codigo_propiedad;
      }
      throw new Error('No se encontró una propiedad activa vinculada a este usuario.');
    } catch (e) {
      setError(e.message);
      return null;
    }
  };

  const fetchVisitantes = async (propId) => {
    if (!propId) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/lista-visitantes/?codigo_propiedad=${propId}`, {
        headers: { 'Authorization': `Token ${token}` },
      });
      if (!response.ok) throw new Error('No se pudo cargar la lista de visitantes.');
      const data = await response.json();
      setVisitantes(data.results || data);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      const propId = await fetchUserProperty();
      if (propId) {
        await fetchVisitantes(propId);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVisitante(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!propiedadId) {
        setError("No se puede registrar un visitante sin una propiedad asociada.");
        return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/lista-visitantes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({ ...newVisitante, codigo_propiedad: propiedadId }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(Object.values(errData).join('\n'));
      }
      setIsModalOpen(false);
      fetchVisitantes(propiedadId);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (visitanteId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar a este visitante?")) return;
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/api/lista-visitantes/${visitanteId}/`, {
            method: 'DELETE',
            headers: { 'Authorization': `Token ${token}` },
        });
        if (response.status !== 204) throw new Error("No se pudo eliminar el visitante.");
        fetchVisitantes(propiedadId);
    } catch (e) {
        setError(e.message);
    }
  };

  const handleGeneratePass = async (visitante) => {
    setError(null);
    setCurrentVisitor(visitante);
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/api/lista-visitantes/${visitante.id}/generar_pase/`, {
            headers: { 'Authorization': `Token ${token}` },
        });
        if (!response.ok) throw new Error("No se pudo generar el pase de acceso.");
        const data = await response.json();
        setQrCodeData(data.qr_data);
    } catch (e) {
        setError(e.message);
    }
  };

  return (
    <>
      <div className="gestion-container">
        <div className="gestion-header">
          <h2>Mis Visitantes Registrados</h2>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <FaPlus /> Registrar Visitante
          </button>
        </div>

        {isLoading && <p>Cargando...</p>}
        {error && <p className="error-message">{error}</p>}

        {!isLoading && !error && (
          <div className="gestion-table-wrapper">
            <table className="gestion-table">
              <thead>
                <tr>
                  <th>Nombre Completo</th>
                  <th>Carnet</th>
                  <th>Motivo</th>
                  <th>Válido Desde</th>
                  <th>Válido Hasta</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visitantes.length > 0 ? visitantes.map((v) => (
                  <tr key={v.id}>
                    <td>{v.nombre} {v.apellido}</td>
                    <td>{v.carnet}</td>
                    <td>{v.motivo_visita}</td>
                    <td>{v.fecha_ini}</td>
                    <td>{v.fecha_fin}</td>
                    <td className="actions-cell" style={{ display: 'flex', gap: '1rem' }}>
                      <button onClick={() => handleGeneratePass(v)} className="btn-icon" title="Generar Pase QR"><FaQrcode /></button>
                      <button onClick={() => handleDelete(v.id)} className="btn-icon" title="Eliminar Visitante"><FaTrash /></button>
                    </td>
                  </tr>
                )) : (
                    <tr><td colSpan="6">No tienes visitantes registrados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- CÓDIGO DEL MODAL DE REGISTRO RESTAURADO --- */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Registrar Nuevo Visitante</h3>
              <button onClick={() => setIsModalOpen(false)} className="btn-icon"><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group"><label>Nombre</label><input name="nombre" value={newVisitante.nombre} onChange={handleInputChange} className="form-input" required /></div>
              <div className="form-group"><label>Apellido</label><input name="apellido" value={newVisitante.apellido} onChange={handleInputChange} className="form-input" required /></div>
              <div className="form-group"><label>Carnet de Identidad</label><input name="carnet" value={newVisitante.carnet} onChange={handleInputChange} className="form-input" required /></div>
              <div className="form-group"><label>Motivo de la Visita</label><input name="motivo_visita" value={newVisitante.motivo_visita} onChange={handleInputChange} className="form-input" /></div>
              <div className="form-group"><label>Fecha de Inicio</label><input type="date" name="fecha_ini" value={newVisitante.fecha_ini} onChange={handleInputChange} className="form-input" required /></div>
              <div className="form-group"><label>Fecha de Fin</label><input type="date" name="fecha_fin" value={newVisitante.fecha_fin} onChange={handleInputChange} className="form-input" required /></div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {qrCodeData && currentVisitor && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ textAlign: 'center' }}>
            <div className="modal-header">
              <h3>Pase de Acceso QR</h3>
              <button onClick={() => setQrCodeData(null)} className="btn-icon"><FaTimes /></button>
            </div>
            <div className="modal-body">
              <h4>{currentVisitor.nombre} {currentVisitor.apellido}</h4>
              <p>CI: {currentVisitor.carnet}</p>
              <QRCodeSVG value={qrCodeData} size={256} includeMargin={true} />
              <p style={{ marginTop: '1rem' }}>Muestre este código al guardia de seguridad para un ingreso rápido.</p>
              <p>Válido del <strong>{currentVisitor.fecha_ini}</strong> al <strong>{currentVisitor.fecha_fin}</strong>.</p>
            </div>
            <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => setQrCodeData(null)}>Cerrar</button></div>
          </div>
        </div>
      )}
    </>
  );
}

export default GestionVisitantes;