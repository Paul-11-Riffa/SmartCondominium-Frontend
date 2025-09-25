import React, {useState} from 'react';
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
import '../styles/Dashboard.css';

function Dashboard({user, onLogout}) {
    const [activeView, setActiveView] = useState('dashboard');
    const is_admin = user.rol?.tipo === 'admin';
    const userName = user.nombre || 'Usuario';

    const renderContent = () => {
        if (is_admin) {
            switch (activeView) {
                case 'dashboard':
                    return <AdminDashboard/>;
                case 'unidades':
                    return <GestionUnidades/>;
                case 'comunicados':
                    return <Comunicados user={user}/>;
                case 'cuotas':
                    return <GestionCuotas/>;
                case 'reservas':
                    return <GestionReservas user={user}/>;
                case 'mantenimiento': // <--- 2. AÑADE ESTE CASO
                    return <GestionMantenimiento user={user}/>;
                case 'vehiculos':
                    return <GestionVehiculos user={user}/>;

                default:
                    return <AdminDashboard/>;
            }
        } else {
            switch (activeView) {
                case 'dashboard':
                    return <ResidentDashboard/>;
                case 'cuenta':
                    return <EstadoCuenta/>;
                case 'reservas':
                    return <GestionReservas user={user}/>;
                case 'mantenimiento': // <--- 2. AÑADE ESTE CASO
                    return <GestionMantenimiento user={user}/>;
                case 'comunicados':
                    return <Comunicados user={user}/>; // <-- ¡CORREGIDO!
                case 'visitantes':
                    return <GestionVisitantes user={user}/>;
                case 'vehiculos': // <--- 3. AÑADE ESTE CASO
                    return <GestionVehiculos user={user}/>;
                default:
                    return <ResidentDashboard/>;
            }
        }
    };

    const getTitle = () => {
        if (activeView === 'mantenimiento') return 'Gestión de Mantenimiento';
        if (activeView === 'cuotas') return 'Configuración de Cuotas y Servicios';
        if (activeView === 'vehiculos') return 'Gestión de Vehículos';
        if (activeView === 'visitantes') return 'Gestión de Visitantes';
        if (activeView === 'reservas') return 'Gestión de Reservas';
        if (activeView === 'unidades') return 'Unidades Habitacionales';
        if (activeView === 'cuenta') return 'Mi Estado de Cuenta';
        if (activeView === 'comunicados') return 'Comunicados y Avisos';
        return is_admin ? 'Dashboard Administrativo' : 'Mi Espacio';
    };

    return (
        <div className="dashboard-container">
            <Sidebar user={user} onLogout={onLogout} setActiveView={setActiveView} activeView={activeView}/>
            <main className="main-content">
                <header className="dashboard-header">
                    <h1>{getTitle()}</h1>
                    <div className="user-profile">
                        <div className="avatar">{userName.charAt(0)}</div>
                        <span>{userName}</span>
                    </div>
                </header>
                {renderContent()}
            </main>
        </div>
    );
}

export default Dashboard;