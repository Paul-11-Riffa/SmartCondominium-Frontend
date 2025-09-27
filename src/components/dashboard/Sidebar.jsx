import React, {useState} from 'react';
import {
    FaTachometerAlt, FaUsers, FaDollarSign, FaShieldAlt, FaBuilding, FaTools,
    FaBullhorn, FaCog, FaSignOutAlt, FaHome, FaFileInvoiceDollar, FaCalendarAlt,
    FaUserFriends, FaHistory, FaCar, FaFileInvoice, FaChevronDown, FaChartBar
} from 'react-icons/fa';

// --- ESTRUCTURA DE DATOS PARA LOS ENLACES (SIN CAMBIOS) ---

const adminNavLinks = [
    {key: 'dashboard', text: 'Dashboard', icon: <FaTachometerAlt/>},
    {
        key: 'administracion', text: 'Administración', icon: <FaUsers/>,
        subLinks: [
            {key: 'usuarios', text: 'Gestionar Usuarios', icon: <FaUserFriends/>},
            {key: 'unidades', text: 'Gestionar Unidades', icon: <FaBuilding/>},
        ]
    },
    {
        key: 'finanzas_main', text: 'Finanzas', icon: <FaFileInvoice/>,
        subLinks: [
            {key: 'finanzas', text: 'Dashboard Financiero', icon: <FaDollarSign/>},
            {key: 'cuotas', text: 'Configurar Cuotas', icon: <FaCog/>},
            {key: 'multas', text: 'Gestionar Multas', icon: <FaFileInvoiceDollar/>},
        ]
    },
    {key: 'seguridad', text: 'Seguridad IA', icon: <FaShieldAlt/>},
    {key: 'reservas', text: 'Gestionar Reservas', icon: <FaCalendarAlt/>},
    {key: 'mantenimiento', text: 'Mantenimiento', icon: <FaTools/>},
    {key: 'comunicados', text: 'Comunicados', icon: <FaBullhorn/>},
    {key: 'vehiculos', text: 'Vehículos', icon: <FaCar/>},
    {key: 'reportes', text: 'Reportes', icon: <FaChartBar/>},
];

const residentNavLinks = [
    {key: 'dashboard', text: 'Inicio', icon: <FaHome/>},
    {key: 'cuenta', text: 'Estado de Cuenta', icon: <FaFileInvoiceDollar/>},
    {key: 'reservas', text: 'Reservar Áreas', icon: <FaCalendarAlt/>},
    {
        key: 'accesos_main', text: 'Mis Accesos', icon: <FaShieldAlt/>,
        subLinks: [
            {key: 'visitantes', text: 'Mis Visitantes', icon: <FaUserFriends/>},
            {key: 'vehiculos', text: 'Mis Vehículos', icon: <FaCar/>},
            {key: 'accesos', text: 'Historial de Accesos', icon: <FaHistory/>},
        ]
    },
    {key: 'mantenimiento', text: 'Solicitar Mantenimiento', icon: <FaTools/>},
    {key: 'comunicados', text: 'Comunicados', icon: <FaBullhorn/>},
];


function Sidebar({user, onLogout, setActiveView, activeView}) {
    const is_admin = user.rol?.tipo === 'admin';
    const navLinks = is_admin ? adminNavLinks : residentNavLinks;

    const [openMenu, setOpenMenu] = useState(null);

    const handleMenuClick = (key) => {
        setOpenMenu(openMenu === key ? null : key);
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <FaHome className="logo-icon"/> SmartCondominium
            </div>
            <ul className="nav-menu">
                {navLinks.map((link) => (
                    <li key={link.key} className="nav-item">
                        {link.subLinks ? (
                            <>
                                <button
                                    onClick={() => handleMenuClick(link.key)}
                                    // --- LÍNEA MODIFICADA ---
                                    className={`nav-link ${openMenu === link.key ? 'active-parent' : ''} has-submenu`}
                                >
                                    <span className="nav-icon">{link.icon}</span>
                                    {link.text}
                                    <FaChevronDown className={`chevron-icon ${openMenu === link.key ? 'open' : ''}`}/>
                                </button>
                                {openMenu === link.key && (
                                    <ul className="nav-submenu">
                                        {link.subLinks.map(subLink => (
                                            <li key={subLink.key} className="nav-item">
                                                <button
                                                    onClick={() => setActiveView(subLink.key)}
                                                    className={`nav-link ${activeView === subLink.key ? 'active' : ''}`}
                                                >
                                                    <span className="nav-icon">{subLink.icon}</span>
                                                    {subLink.text}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </>
                        ) : (
                            <button
                                onClick={() => setActiveView(link.key)}
                                className={`nav-link ${activeView === link.key ? 'active' : ''}`}
                            >
                                <span className="nav-icon">{link.icon}</span>
                                {link.text}
                            </button>
                        )}
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

export default Sidebar;