import React from 'react';
import {
    FaTachometerAlt,
    FaUsers,
    FaDollarSign,
    FaShieldAlt,
    FaBuilding,
    FaTools,
    FaBullhorn,
    FaCog,
    FaSignOutAlt,
    FaHome,
    FaFileInvoiceDollar,
    FaCalendarAlt,
    FaUserFriends,
    FaHistory
} from 'react-icons/fa';

// Se añade una propiedad 'key' para identificar cada vista de forma única
const adminNavLinks = [
    {key: 'dashboard', text: 'Dashboard', icon: <FaTachometerAlt/>},
    {key: 'unidades', text: 'Usuarios y Unidades', icon: <FaUsers/>},
    {key: 'finanzas', text: 'Finanzas', icon: <FaDollarSign/>},
    {key: 'seguridad', text: 'Seguridad IA', icon: <FaShieldAlt/>},
    {key: 'areas', text: 'Áreas Comunes', icon: <FaBuilding/>},
    {key: 'reservas', text: 'Gestionar Reservas', icon: <FaCalendarAlt/>},
    {key: 'mantenimiento', text: 'Mantenimiento', icon: <FaTools/>},
    {key: 'comunicados', text: 'Comunicados', icon: <FaBullhorn/>},

];

const residentNavLinks = [
    {key: 'dashboard', text: 'Inicio', icon: <FaHome/>},
    {key: 'cuenta', text: 'Estado de Cuenta', icon: <FaFileInvoiceDollar/>},
    {key: 'reservas', text: 'Reservar Áreas', icon: <FaCalendarAlt/>},
    {key: 'visitantes', text: 'Mis Visitantes', icon: <FaUserFriends/>},
    {key: 'accesos', text: 'Mis Accesos', icon: <FaHistory/>},
    {key: 'comunicados', text: 'Comunicados', icon: <FaBullhorn/>},
];

// El componente ahora recibe 'setActiveView' y 'activeView' como props
function Sidebar({user, onLogout, setActiveView, activeView}) {
    const is_admin = user.rol?.tipo === 'admin';
    const navLinks = is_admin ? adminNavLinks : residentNavLinks;

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <FaHome className="logo-icon"/> SmartCondominium
            </div>
            <ul className="nav-menu">
                {navLinks.map((link) => (
                    <li key={link.key} className="nav-item">
                        {/* Se cambia la etiqueta <a> por <button> para manejar el evento onClick */}
                        <button
                            onClick={() => setActiveView(link.key)}
                            // La clase 'active' se asigna dinámicamente según el estado 'activeView'
                            className={`nav-link ${activeView === link.key ? 'active' : ''}`}
                        >
                            <span className="nav-icon">{link.icon}</span>
                            {link.text}
                        </button>
                    </li>
                ))}
            </ul>
            <div className="nav-item">
                <button onClick={() => setActiveView('configuracion')}
                        className={`nav-link ${activeView === 'configuracion' ? 'active' : ''}`}>
                    <span className="nav-icon"><FaCog/></span>
                    Configuración
                </button>
            </div>
            <button onClick={onLogout} className="nav-link logout-button">
                <span className="nav-icon"><FaSignOutAlt/></span>
                Cerrar Sesión
            </button>
        </aside>
    );
}

// Este truco con estilos asegura que nuestros botones se vean y comporten como links normales
const StyledSidebar = (props) => {
    return (
        <>
            <style>{`
                button.nav-link {
                    background: none;
                    border: none;
                    width: 100%;
                    text-align: left;
                    cursor: pointer;
                    font-family: inherit;
                    font-size: inherit;
                    line-height: inherit;
                }
            `}</style>
            <Sidebar {...props} />
        </>
    )
}

export default StyledSidebar;