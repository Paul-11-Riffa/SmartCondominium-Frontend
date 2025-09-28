// src/components/dashboard/ConfiguracionPerfil.jsx

import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaUpload, FaTrash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import '../../styles/Gestion.css';
import '../../styles/Configuracion.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function ConfiguracionPerfil({ user }) {
  const [perfilFacial, setPerfilFacial] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const fetchPerfil = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/perfiles-faciales/?codigo_usuario=${user.codigo}`, {
        headers: { 'Authorization': `Token ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.results.length > 0) {
        setPerfilFacial(data.results[0]);
      } else {
        setPerfilFacial(null);
      }
    } catch (err) {
      setError('No se pudo cargar la información del perfil.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPerfil();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
      setError(null);
      setSuccess(null);
    }
  };

  const handleRegister = async () => {
    if (!imageFile) {
      setError('Por favor, selecciona una imagen para subir.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('image', imageFile);
    const token = localStorage.getItem('authToken');

    try {
      const response = await fetch(`${API_URL}/api/ai-detection/register_current_user/`, {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo registrar el perfil.');
      }
      setSuccess('¡Perfil facial registrado con éxito!');
      setImageFile(null);
      setPreview(null);
      fetchPerfil();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!perfilFacial || !window.confirm('¿Estás seguro de que quieres eliminar tu perfil facial?')) {
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    const token = localStorage.getItem('authToken');

    try {
      const response = await fetch(`${API_URL}/api/ai-detection/${perfilFacial.id}/delete_profile/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'No se pudo eliminar el perfil.');
      }
      setSuccess('Perfil facial eliminado correctamente.');
      fetchPerfil();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="gestion-container">
      <h2>Mi Perfil y Configuración</h2>

      {error && <p className="error-message"><FaTimesCircle /> {error}</p>}
      {success && <p className="success-message"><FaCheckCircle /> {success}</p>}

      <div className="profile-card">
        <div className="profile-info">
          <h3>Información de Usuario</h3>
          <p><strong>Nombre:</strong> {user.nombre} {user.apellido}</p>
          <p><strong>Correo:</strong> {user.correo}</p>
          <p><strong>Rol:</strong> {user.rol?.descripcion}</p>
        </div>

        <div className="facial-profile-section">
          <h3>Perfil de Reconocimiento Facial</h3>
          {isLoading && <p>Cargando perfil...</p>}
          {!isLoading && perfilFacial ? (
            <div className="profile-display">
              <p>Ya tienes un perfil facial registrado.</p>
              {/* --- CÓDIGO MODIFICADO PARA MOSTRAR LA IMAGEN --- */}
              <img src={perfilFacial.imagen_url} alt="Perfil Facial" className="profile-image" />
              <button onClick={handleDelete} className="btn btn-danger" disabled={isLoading}>
                <FaTrash /> Eliminar Perfil
              </button>
            </div>
          ) : (
            !isLoading && (
              <div className="profile-upload">
                <p>No tienes un perfil facial. Sube una foto clara de tu rostro para registrarte.</p>
                <input type="file" id="file-upload" accept="image/jpeg, image/png" onChange={handleFileChange} style={{ display: 'none' }} />
                <label htmlFor="file-upload" className="btn btn-secondary">
                  <FaUpload /> Seleccionar Imagen
                </label>
                {preview && (
                  <div className="image-preview-container">
                    <img src={preview} alt="Vista previa" className="profile-image-preview" />
                  </div>
                )}
                <button onClick={handleRegister} className="btn btn-primary" disabled={isLoading || !imageFile}>
                  Registrar mi Rostro
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default ConfiguracionPerfil;