// src/pages/Dashboard.jsx

import React, {useState, useEffect} from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import ResidentDashboard from '../components/dashboard/ResidentDashboard';
import GestionUnidades from '../components/dashboard/GestionUnidades';
import EstadoCuenta from '../components/dashboard/EstadoCuenta';
import Comunicados from '../components/dashboard/Comunicados';
import GestionReservas from '../components/dashboard/GestionReservas';
import GestionVisitantes from '../components/dashboard/GestionVisitantes';
import GestionVehiculos from '../components/dashboard/GestionVehiculos';
import GestionCuotas from '../components/dashboard/GestionCuotas';
import GestionMantenimiento from '../components/dashboard/GestionMantenimiento';
import GestionMultas from '../components/dashboard/GestionMultas';
import GestionAreasComunes from '../components/dashboard/GestionAreasComunes';
import GestionUsuarios from '../components/dashboard/GestionUsuarios';
import Reportes from '../components/dashboard/Reportes';
import ReporteBitacora from '../components/dashboard/ReporteBitacora';
import HistorialPagos from '../components/dashboard/HistorialPagos';
import GestionMantenimientoPreventivo from '../components/dashboard/GestionMantenimientoPreventivo';
import ConfiguracionPerfil from '../components/dashboard/ConfiguracionPerfil';
import GestionNotificaciones from '../components/dashboard/GestionNotificaciones';
import {FaBell} from 'react-icons/fa';
import Notificaciones from '../components/dashboard/Notificaciones';
import SeguridadIA from '../components/dashboard/SeguridadIA';
import '../styles/Dashboard.css';
import '../styles/Notificaciones.css'; // <-- Asegúrate de importar los nuevos estilos

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function Dashboard({user, onLogout}) {
    const [activeView, setActiveView] = useState('dashboard');
    const is_admin = user.rol?.tipo === 'admin';
    const userName = user.nombre || 'Usuario';

    // --- NUEVA LÓGICA PARA NOTIFICACIONES ---
    const [notificaciones, setNotificaciones] = useState([]);
    const [showNotificaciones, setShowNotificaciones] = useState(false);

    useEffect(() => {
        const fetchNotificaciones = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch(`${API_URL}/api/mis-notificaciones/`, {
                    headers: {'Authorization': `Token ${token}`},
                });
                const data = await response.json();
                if (response.ok) {
                    setNotificaciones(data);
                }
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };
        fetchNotificaciones();
    }, []);
    // --- FIN DE NUEVA LÓGICA ---

    const renderContent = () => {
        if (activeView === 'configuracion') {
            return <ConfiguracionPerfil user={user}/>;
        }
        if (is_admin) {
            switch (activeView) {
                case 'dashboard':
                    return <AdminDashboard/>;
                case 'usuarios': // <-- AÑADE ESTE CASE COMPLETO
                    return <GestionUsuarios/>;
                case 'unidades':
                    return <GestionUnidades/>;
                case 'comunicados':
                    return <Comunicados user={user}/>;
                case 'cuotas':
                    return <GestionCuotas/>;
                case 'multas':
                    return <GestionMultas/>;
                case 'areas':
                    return <GestionAreasComunes/>;
                case 'reservas':
                    return <GestionReservas user={user}/>;
                case 'mantenimiento':
                    return <GestionMantenimiento user={user}/>;
                case 'mantenimiento_preventivo':
                    return <GestionMantenimientoPreventivo/>;
                case 'vehiculos':
                    return <GestionVehiculos user={user}/>;
                case 'reporte_areas':
                    return <Reportes/>;
                case 'reporte_bitacora':
                    return <ReporteBitacora/>;
                case 'seguridad': // <-- 2. AÑADE EL NUEVO CASO
                    return <SeguridadIA/>;
                case 'notificaciones':
                    return <GestionNotificaciones/>;
                default:
                    return <AdminDashboard/>;
            }
        } else {
            switch (activeView) {
                case 'dashboard':
                    return <ResidentDashboard/>;
                case 'cuenta':
                    return <EstadoCuenta/>;
                case 'historial_pagos':
                    return <HistorialPagos/>;
                case 'reservas':
                    return <GestionReservas user={user}/>;
                case 'mantenimiento':
                    return <GestionMantenimiento user={user}/>;
                case 'comunicados':
                    return <Comunicados user={user}/>;
                case 'visitantes':
                    return <GestionVisitantes user={user}/>;
                case 'vehiculos':
                    return <GestionVehiculos user={user}/>;
                default:
                    return <ResidentDashboard/>;
            }
        }
    };

    const getTitle = () => {
        if (activeView === 'notificaciones') return 'Gestión de Notificaciones';
        if (activeView === 'configuracion') return 'Configuración de Mi Perfil';
        if (activeView === 'seguridad') return 'Seguridad IA';
        if (activeView === 'reporte_areas') return 'Reporte: Uso de Áreas Comunes';
        if (activeView === 'reporte_bitacora') return 'Reporte: Bitácora del Sistema';
        if (activeView === 'areas') return 'Gestión de Áreas Comunes';
        if (activeView === 'multas') return 'Gestión de Multas';
        if (activeView === 'mantenimiento') return 'Gestión de Mantenimiento';
        if (activeView === 'mantenimiento_preventivo') return 'Programación de Mantenimiento';
        if (activeView === 'cuotas') return 'Configuración de Cuotas y Servicios';
        if (activeView === 'vehiculos') return 'Gestión de Vehículos';
        if (activeView === 'visitantes') return 'Gestión de Visitantes';
        if (activeView === 'reservas') return 'Gestión de Reservas';
        if (activeView === 'unidades') return 'Unidades Habitacionales';
        if (activeView === 'cuenta') return 'Mi Estado de Cuenta';
        if (activeView === 'historial_pagos') return 'Mi Historial de Pagos';
        if (activeView === 'comunicados') return 'Comunicados y Avisos';
        return is_admin ? 'Dashboard Administrativo' : 'Mi Espacio';
    };

    return (
        <div className="dashboard-container">
            <Sidebar user={user} onLogout={onLogout} setActiveView={setActiveView} activeView={activeView}/>
            <main className="main-content">
                <header className="dashboard-header">
                    <h1>{getTitle()}</h1>
                    <div className="user-profile" style={{display: 'flex', alignItems: 'center', gap: '1.5rem'}}>
                        {/* --- NUEVO ÍCONO DE CAMPANA --- */}
                        <div className="notification-bell" onClick={() => setShowNotificaciones(!showNotificaciones)}>
                            <FaBell size="1.5em"/>
                            {notificaciones.length > 0 && (
                                <span className="notification-count">{notificaciones.length}</span>
                            )}
                        </div>
                        <div className="avatar">{userName.charAt(0)}</div>
                        <span>{userName}</span>
                    </div>
                </header>

                {/* --- NUEVO PANEL DE NOTIFICACIONES --- */}
                {showNotificaciones && (
                    <Notificaciones notificaciones={notificaciones} onClose={() => setShowNotificaciones(false)}/>
                )}

                {renderContent()}
            </main>
        </div>
    );
}

export default Dashboard;