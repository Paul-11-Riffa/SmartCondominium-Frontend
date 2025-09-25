import React, { useState, useEffect } from 'react';
import { FaPlus, FaPencilAlt, FaToggleOn, FaToggleOff, FaTimes } from 'react-icons/fa';
import '../../styles/Gestion.css';
import '../../styles/Comunicados.css'; // Reutilizamos estilos de modal

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    contrasena: '',
    telefono: '',
    sexo: 'M',
    idrol: 2, // Default a Residente
    estado: 'activo',
  });

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const headers = { 'Authorization': `Token ${token}` };

      // Cargar usuarios y roles en paralelo
      const [usersRes, rolesRes] = await Promise.all([
        fetch(`${API_URL}/api/usuarios/?search=${searchTerm}`, { headers }),
        fetch(`${API_URL}/api/roles/`, { headers }),
      ]);

      if (!usersRes.ok) throw new Error('No se pudo cargar la lista de usuarios.');
      const usersData = await usersRes.json();
      setUsuarios(usersData.results || usersData);

      if (!rolesRes.ok) throw new Error('No se pudo cargar la lista de roles.');
      const rolesData = await rolesRes.json();
      setRoles(rolesData.results || rolesData);

    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm]); // Recargar si cambia el término de búsqueda

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openModalForCreate = () => {
    setIsEditMode(false);
    setCurrentUser(null);
    setFormData({
        nombre: '', apellido: '', correo: '', contrasena: '',
        telefono: '', sexo: 'M', idrol: 2, estado: 'activo'
    });
    setIsModalOpen(true);
  };

  const openModalForEdit = (user) => {
    setIsEditMode(true);
    setCurrentUser(user);
    setFormData({
      nombre: user.nombre,
      apellido: user.apellido,
      correo: user.correo,
      contrasena: '', // No mostramos la contraseña actual
      telefono: user.telefono,
      sexo: user.sexo,
      idrol: user.idrol,
      estado: user.estado,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    const url = isEditMode
      ? `${API_URL}/api/usuarios/${currentUser.codigo}/`
      : `${API_URL}/api/usuarios/`;

    const method = isEditMode ? 'PATCH' : 'POST';

    // No enviar la contraseña si está vacía en modo edición
    const bodyData = { ...formData };
    if (isEditMode && !bodyData.contrasena) {
      delete bodyData.contrasena;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(Object.values(errData).flat().join(' '));
      }

      setIsModalOpen(false);
      fetchData(); // Recargar la lista de usuarios

    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusToggle = async (user) => {
    const newStatus = user.estado === 'activo' ? 'inactivo' : 'activo';
    if (!window.confirm(`¿Seguro que quieres cambiar el estado de este usuario a "${newStatus}"?`)) return;

    const token = localStorage.getItem('authToken');
    try {
        await fetch(`${API_URL}/api/usuarios/${user.codigo}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`,
            },
            body: JSON.stringify({ estado: newStatus }),
        });
        fetchData();
    } catch(e) {
        setError(e.message);
    }
  };


  const getRoleName = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.descripcion : 'N/A';
  }

  return (
    <>
      <div className="gestion-container">
        <div className="gestion-header">
          <h2>Gestión de Usuarios</h2>
          <button className="btn btn-primary" onClick={openModalForCreate}>
            <FaPlus /> Añadir Usuario
          </button>
        </div>

        {/* Barra de Búsqueda */}
        <div className="form-group" style={{ marginBottom: '2rem' }}>
            <input
                type="text"
                placeholder="Buscar por nombre, apellido o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
            />
        </div>

        {isLoading && <p>Cargando...</p>}
        {error && <p className="error-message">{error}</p>}

        {!isLoading && !error && (
          <div className="gestion-table-wrapper">
            <table className="gestion-table">
              <thead>
                <tr>
                  <th>Nombre Completo</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(user => (
                  <tr key={user.codigo}>
                    <td>{user.nombre} {user.apellido}</td>
                    <td>{user.correo}</td>
                    <td>{getRoleName(user.idrol)}</td>
                    <td>
                      <span className={`status-${user.estado === 'activo' ? 'aprobada' : 'rechazada'}`}>
                        {user.estado}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: '1rem' }}>
                      <button onClick={() => openModalForEdit(user)} className="btn-icon" title="Editar"><FaPencilAlt /></button>
                      <button onClick={() => handleStatusToggle(user)} className="btn-icon" title="Activar/Desactivar">
                        {user.estado === 'activo' ? <FaToggleOn color="green" /> : <FaToggleOff color="red" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para Crear/Editar Usuario */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{isEditMode ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="btn-icon"><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group"><label>Nombre</label><input name="nombre" value={formData.nombre} onChange={handleInputChange} className="form-input" required /></div>
              <div className="form-group"><label>Apellido</label><input name="apellido" value={formData.apellido} onChange={handleInputChange} className="form-input" required /></div>
              <div className="form-group"><label>Correo</label><input type="email" name="correo" value={formData.correo} onChange={handleInputChange} className="form-input" required /></div>
              <div className="form-group"><label>Contraseña</label><input type="password" name="contrasena" value={formData.contrasena} onChange={handleInputChange} className="form-input" placeholder={isEditMode ? 'Dejar en blanco para no cambiar' : ''} required={!isEditMode} /></div>
              <div className="form-group"><label>Teléfono</label><input type="tel" name="telefono" value={formData.telefono} onChange={handleInputChange} className="form-input" /></div>
              <div className="form-group"><label>Sexo</label>
                <select name="sexo" value={formData.sexo} onChange={handleInputChange} className="form-input">
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
              <div className="form-group"><label>Rol</label>
                <select name="idrol" value={formData.idrol} onChange={handleInputChange} className="form-input">
                  {roles.map(rol => <option key={rol.id} value={rol.id}>{rol.descripcion}</option>)}
                </select>
              </div>
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

export default GestionUsuarios;