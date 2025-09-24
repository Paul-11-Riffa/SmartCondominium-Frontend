import React, { useState, useEffect } from 'react';
import { FaBullhorn, FaInfoCircle, FaExclamationTriangle, FaPlus, FaTimes } from 'react-icons/fa';
import '../../styles/Comunicados.css';
import '../../styles/Gestion.css'; // Reutilizamos el estilo de los botones

// El componente ahora recibe { user } como prop
function Comunicados({ user }) {
  const [comunicados, setComunicados] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para el modal y el formulario
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newComunicado, setNewComunicado] = useState({
    titulo: '',
    contenido: '',
    tipo: 'Informativo',
    estado: 'publicado',
  });
  const [submitError, setSubmitError] = useState('');

  const isAdmin = user.rol?.tipo === 'admin';

  const fetchComunicados = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No autorizado.');

      const url = 'http://127.0.0.1:8000/api/comunicados/?estado=publicado&ordering=-fecha';
      const response = await fetch(url, {
        headers: { 'Authorization': `Token ${token}` },
      });

      if (!response.ok) throw new Error('No se pudo obtener la lista de comunicados.');
      const data = await response.json();
      setComunicados(data.results || data);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComunicados();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewComunicado(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!newComunicado.titulo || !newComunicado.contenido) {
      setSubmitError('El título y el contenido son obligatorios.');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://127.0.0.1:8000/api/comunicados/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({
            ...newComunicado,
            fecha: new Date().toISOString().split('T')[0],
            hora: new Date().toTimeString().split(' ')[0],
            codigo_usuario: user.codigo,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(Object.values(errData).join('\n'));
      }

      setIsModalOpen(false);
      setNewComunicado({ titulo: '', contenido: '', tipo: 'Informativo', estado: 'publicado' }); // Limpiar formulario
      fetchComunicados();

    } catch (err) {
      setSubmitError(err.message);
    }
  };

  const getIconForType = (type) => {
    switch (type?.toLowerCase()) {
      case 'informativo':
        return <FaInfoCircle className="icon-info" />;
      case 'alerta':
        return <FaExclamationTriangle className="icon-alerta" />;
      default:
        return <FaBullhorn className="icon-general" />;
    }
  };

  if (isLoading) return <p>Cargando comunicados...</p>;
  if (error) return <p className="error-message">Error: {error}</p>;

  return (
    <>
      <div className="gestion-header">
        <h2>Tablón de Comunicados</h2>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <FaPlus /> Crear Comunicado
          </button>
        )}
      </div>

      <div className="comunicados-container">
        {comunicados.length === 0 ? (
          <p>No hay comunicados para mostrar en este momento.</p>
        ) : (
          comunicados.map((comunicado) => (
            <div key={comunicado.id} className="comunicado-card">
              <div className="comunicado-header">
                <div className="comunicado-icon">
                  {getIconForType(comunicado.tipo)}
                </div>
                <div className="comunicado-title">
                  <h2>{comunicado.titulo}</h2>
                  <p>
                    Publicado el: {new Date(comunicado.fecha).toLocaleDateString('es-ES', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <div className="comunicado-body">
                <p>{comunicado.contenido}</p>
                {comunicado.url && (
                  <a href={comunicado.url} target="_blank" rel="noopener noreferrer">
                    Más información
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Nuevo Comunicado</h3>
              <button onClick={() => setIsModalOpen(false)} className="btn-icon">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="modal-body">
              <div className="form-group">
                <label htmlFor="titulo">Título</label>
                <input
                  type="text"
                  id="titulo"
                  name="titulo"
                  value={newComunicado.titulo}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="contenido">Contenido</label>
                <textarea
                  id="contenido"
                  name="contenido"
                  rows="5"
                  value={newComunicado.contenido}
                  onChange={handleInputChange}
                  className="form-input"
                ></textarea>
              </div>
              <div className="form-group">
                <label htmlFor="tipo">Tipo de Comunicado</label>
                <select
                  id="tipo"
                  name="tipo"
                  value={newComunicado.tipo}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="Informativo">Informativo</option>
                  <option value="Alerta">Alerta</option>
                  <option value="General">General</option>
                </select>
              </div>

              {submitError && <p className="error-message">{submitError}</p>}

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Publicar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Comunicados;