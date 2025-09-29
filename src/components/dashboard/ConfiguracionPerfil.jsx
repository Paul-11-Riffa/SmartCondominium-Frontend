// src/components/dashboard/ConfiguracionPerfil.jsx

import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaUpload, FaTrash, FaCheckCircle, FaTimesCircle, FaCamera, FaHome } from 'react-icons/fa';
import '../../styles/Gestion.css';
import '../../styles/Configuracion.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function ConfiguracionPerfil({ user }) {
  const [perfilFacial, setPerfilFacial] = useState(null);
  const [propiedad, setPropiedad] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Estados para el perfil facial
  const [facialImageFile, setFacialImageFile] = useState(null);
  const [facialPreview, setFacialPreview] = useState(null);

  // Estados para la foto de perfil (avatar)
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('authToken');
      const headers = { 'Authorization': `Token ${token}` };

      const [perfilRes, propiedadRes] = await Promise.all([
          fetch(`${API_URL}/api/perfiles-faciales/?codigo_usuario=${user.codigo}`, { headers }),
          fetch(`${API_URL}/api/mi-propiedad/`, { headers })
      ]);

      const perfilData = await perfilRes.json();
      if (perfilRes.ok && perfilData.results.length > 0) setPerfilFacial(perfilData.results[0]);

      if (propiedadRes.ok) {
        const propiedadData = await propiedadRes.json();
        setPropiedad(propiedadData);
      }

    } catch (err) {
      setError('No se pudo cargar toda la información del perfil.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFacialFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFacialImageFile(file);
      setFacialPreview(URL.createObjectURL(file));
      setError(null);
      setSuccess(null);
    }
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) {
        setError("Por favor, selecciona una nueva foto de perfil.");
        return;
    }
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('avatar', avatarFile);
    const token = localStorage.getItem('authToken');

    try {
        const response = await fetch(`${API_URL}/api/usuario/actualizar-foto/`, {
            method: 'POST',
            headers: { 'Authorization': `Token ${token}` },
            body: formData,
        });
        const updatedUser = await response.json();
        if (!response.ok) throw new Error(updatedUser.error || "No se pudo actualizar la foto.");

        // Actualizamos el usuario en localStorage y recargamos la página para ver el cambio globalmente
        localStorage.setItem('smartCondoUser', JSON.stringify(updatedUser));
        alert("¡Foto de perfil actualizada con éxito! La página se recargará para mostrar los cambios.");
        window.location.reload();

    } catch (err) {
        setError(err.message);
        setIsLoading(false);
    }
  };

  // ... (handleRegister y handleDelete para el perfil facial no cambian)
  const handleRegister = async () => {
    if (!facialImageFile) {
      setError('Por favor, selecciona una imagen para subir.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('image', facialImageFile);
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
      setFacialImageFile(null);
      setFacialPreview(null);
      fetchData();
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
      fetchData();
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

          {/* --- SECCIÓN DE FOTO DE PERFIL --- */}
          <div className="avatar-section">
            <img
              src={avatarPreview || user.foto_perfil_url || `https://ui-avatars.com/api/?name=${user.nombre}+${user.apellido}&background=4c5fd7&color=fff`}
              alt="Foto de perfil"
              className="profile-avatar"
            />
            <input type="file" id="avatar-upload" accept="image/jpeg, image/png" onChange={handleAvatarFileChange} style={{ display: 'none' }} />
            <label htmlFor="avatar-upload" className="btn-icon-upload" title="Cambiar foto de perfil">
              <FaCamera />
            </label>
            {avatarFile && (
                <button onClick={handleAvatarUpload} className="btn btn-primary btn-sm" disabled={isLoading}>
                    Guardar Foto
                </button>
            )}
          </div>

          <p><strong>Nombre:</strong> {user.nombre} {user.apellido}</p>
          <p><strong>Correo:</strong> {user.correo}</p>
          <p><strong>Rol:</strong> {user.rol?.descripcion}</p>

          {propiedad && (
            <div className="property-info">
                <h4><FaHome /> Mi Unidad</h4>
                <p><strong>Unidad:</strong> {propiedad.descripcion}</p>
                <p><strong>Casa N°:</strong> {propiedad.nro_casa}, Piso: {propiedad.piso}</p>
            </div>
          )}
        </div>

        <div className="facial-profile-section">
          <h3>Perfil de Reconocimiento Facial</h3>
          {isLoading && <p>Cargando perfil...</p>}
          {!isLoading && perfilFacial ? (
            <div className="profile-display">
              <p>Ya tienes un perfil facial registrado.</p>
              <img src={perfilFacial.imagen_url} alt="Perfil Facial" className="facial-image" />
              <button onClick={handleDelete} className="btn btn-danger" disabled={isLoading}>
                <FaTrash /> Eliminar Perfil Facial
              </button>
            </div>
          ) : (
            !isLoading && (
              <div className="profile-upload">
                <p>Sube una foto clara de tu rostro para el acceso por reconocimiento facial.</p>
                <input type="file" id="facial-upload" accept="image/jpeg, image/png" onChange={handleFacialFileChange} style={{ display: 'none' }} />
                <label htmlFor="facial-upload" className="btn btn-secondary">
                  <FaUpload /> Seleccionar Imagen Facial
                </label>
                {facialPreview && (
                  <div className="image-preview-container">
                    <img src={facialPreview} alt="Vista previa" className="facial-image-preview" />
                  </div>
                )}
                <button onClick={handleRegister} className="btn btn-primary" disabled={isLoading || !facialImageFile}>
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