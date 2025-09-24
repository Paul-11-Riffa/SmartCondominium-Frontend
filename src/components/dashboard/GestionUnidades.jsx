import React, { useState, useEffect } from 'react';
import { FaPlus, FaPencilAlt } from 'react-icons/fa';
import '../../styles/Gestion.css';

const API_URL = import.meta.env.VITE_API_URL;

function GestionUnidades() {
  const [unidades, setUnidades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // Ahora sí usaremos setError

  // --- Conexión real con la API ---
  const fetchUnidades = async () => {
    setIsLoading(true);
    setError(null); // Limpiamos errores previos

    try {
      // Obtenemos el token de autenticación guardado en el login
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No se encontró token de autenticación.');
      }

      const response = await fetch(`${API_URL}/api/propiedades/`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('No se pudo obtener la lista de unidades.');
      }

      const data = await response.json();
      // La API de Django anida los resultados en 'results' cuando hay paginación
      setUnidades(data.results || data);

    } catch (e) {
      // ¡Aquí usamos setError!
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnidades();
  }, []);

  // El resto del componente se mantiene igual para mostrar los datos
  return (
    <div className="gestion-container">
      <div className="gestion-header">
        <h2>Gestión de Unidades Habitacionales</h2>
        <button className="btn btn-primary">
          <FaPlus /> Añadir Unidad
        </button>
      </div>

      {isLoading && <p>Cargando unidades desde la base de datos...</p>}
      {error && <p className="error-message">Error: {error}</p>}

      {!isLoading && !error && (
        <div className="gestion-table-wrapper">
          <table className="gestion-table">
            <thead>
              <tr>
                <th>Nro. Casa</th>
                <th>Piso</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {unidades.map((unidad) => (
                <tr key={unidad.codigo}>
                  <td>{unidad.nro_casa}</td>
                  <td>{unidad.piso}</td>
                  <td>{unidad.descripcion}</td>
                  <td>
                    <button className="btn-icon">
                      <FaPencilAlt />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default GestionUnidades;