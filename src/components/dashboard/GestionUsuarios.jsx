import React, {useState, useEffect} from 'react';
import {FaPlus, FaPencilAlt, FaTimes, FaTrash} from 'react-icons/fa';
import '../../styles/Gestion.css';
import '../../styles/Comunicados.css'; // Reutilizamos estilos de modal

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function GestionUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados del modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState({});

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('authToken');
            const headers = {'Authorization': `Token ${token}`};

            // Hacemos las dos peticiones en paralelo para más eficiencia
            const [usersRes, rolesRes] = await Promise.all([
                fetch(`${API_URL}/api/usuarios/`, {headers}),
                fetch(`${API_URL}/api/roles/`, {headers})
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
    }, []);

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const openModalForCreate = () => {
        setIsEditMode(false);
        setCurrentUser(null);
        setFormData({
            nombre: '',
            apellido: '',
            correo: '',
            contrasena: '',
            telefono: '',
            sexo: 'M',
            idrol: '', // Para que el select empiece vacío
            estado: 'activo'
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
            telefono: user.telefono,
            sexo: user.sexo,
            idrol: user.idrol,
            estado: user.estado
        });
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');
        const url = isEditMode ? `${API_URL}/api/usuarios/${currentUser.codigo}/` : `${API_URL}/api/usuarios/`;
        const method = isEditMode ? 'PATCH' : 'POST';

        // En modo edición, no enviamos la contraseña
        const bodyData = {...formData};
        if (isEditMode) {
            delete bodyData.contrasena;
        }

        try {
            const response = await fetch(url, {
                method,
                headers: {'Content-Type': 'application/json', 'Authorization': `Token ${token}`},
                body: JSON.stringify(bodyData),
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

    const getRoleName = (roleId) => {
        const role = roles.find(r => r.id === roleId);
        return role ? role.descripcion : 'No asignado';
    };

    const handleDelete = async (userId) => {
        // Pedimos confirmación al usuario para evitar accidentes
        if (!window.confirm("¿Estás seguro de que quieres eliminar este usuario? Esta acción es irreversible.")) {
            return;
        }
        setError(null); // Limpiamos errores previos
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_URL}/api/usuarios/${userId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${token}`,
                },
            });

            // Si el servidor responde algo que no sea "204 No Content", es un error
            if (response.status !== 204) {
                const errData = await response.json();
                throw new Error(errData.detail || 'No se pudo eliminar el usuario.');
            }

            // Si todo salió bien, recargamos la lista de usuarios
            fetchData();

        } catch (err) {
            setError(err.message);
        }
    };

    if (isLoading) return <p>Cargando usuarios...</p>;

    return (
        <>
            <div className="gestion-container">
                <div className="gestion-header">
                    <h2>Gestión de Usuarios del Sistema</h2>
                    <button className="btn btn-primary" onClick={openModalForCreate}>
                        <FaPlus/> Añadir Usuario
                    </button>
                </div>

                {error && <p className="error-message">{error}</p>}

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
                        {usuarios.map(u => (
                            <tr key={u.codigo}>
                                <td>{u.nombre} {u.apellido}</td>
                                <td>{u.correo}</td>
                                <td>{getRoleName(u.idrol)}</td>
                                <td>
                    <span className={`status-${u.estado === 'activo' ? 'aprobada' : 'rechazada'}`}>
                      {u.estado}
                    </span>
                                </td>
                                <td>
                                    <button onClick={() => openModalForEdit(u)} className="btn-icon" title="Editar">
                                        <FaPencilAlt/></button>
                                    <button onClick={() => handleDelete(u.codigo)} className="btn-icon"
                                            title="Eliminar"><FaTrash/></button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{maxWidth: '600px'}}>
                        <div className="modal-header">
                            <h3>{isEditMode ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
                            <button onClick={closeModal} className="btn-icon"><FaTimes/></button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-body">
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                                <div className="form-group"><label>Nombre</label><input name="nombre"
                                                                                        value={formData.nombre || ''}
                                                                                        onChange={handleInputChange}
                                                                                        className="form-input"
                                                                                        required/></div>
                                <div className="form-group"><label>Apellido</label><input name="apellido"
                                                                                          value={formData.apellido || ''}
                                                                                          onChange={handleInputChange}
                                                                                          className="form-input"
                                                                                          required/></div>
                                <div className="form-group"><label>Correo</label><input type="email" name="correo"
                                                                                        value={formData.correo || ''}
                                                                                        onChange={handleInputChange}
                                                                                        className="form-input"
                                                                                        required/></div>
                                <div className="form-group"><label>Teléfono</label><input type="tel" name="telefono"
                                                                                          value={formData.telefono || ''}
                                                                                          onChange={handleInputChange}
                                                                                          className="form-input"/></div>
                                {!isEditMode &&
                                    <div className="form-group"><label>Contraseña</label><input type="password"
                                                                                                name="contrasena"
                                                                                                value={formData.contrasena || ''}
                                                                                                onChange={handleInputChange}
                                                                                                className="form-input"
                                                                                                required={!isEditMode}/>
                                    </div>}
                                <div className="form-group"><label>Rol</label>
                                    <select name="idrol" value={formData.idrol || ''} onChange={handleInputChange}
                                            className="form-input" required>
                                        <option value="">Seleccione un rol...</option>
                                        {roles.map(r => <option key={r.id} value={r.id}>{r.descripcion}</option>)}
                                    </select>
                                </div>
                                <div className="form-group"><label>Estado</label>
                                    <select name="estado" value={formData.estado || 'activo'}
                                            onChange={handleInputChange} className="form-input">
                                        <option value="activo">Activo</option>
                                        <option value="inactivo">Inactivo</option>
                                        <option value="pendiente">Pendiente</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancelar
                                </button>
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