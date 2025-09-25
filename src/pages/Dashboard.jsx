import React, {useState} from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import ResidentDashboard from '../components/dashboard/ResidentDashboard';
import GestionUnidades from '../components/dashboard/GestionUnidades';
import EstadoCuenta from '../components/dashboard/EstadoCuenta';
import Comunicados from '../components/dashboard/Comunicados';
import GestionReservas from '../components/dashboard/GestionReservas';
import GestionVisitantes from '../components/dashboard/GestionVisitantes';
import GestionUsuarios from '../components/dashboard/GestionUsuarios';
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
                case 'usuarios': // <--- 2. AÑADE ESTE NUEVO CASO
                    return <GestionUsuarios/>;
                case 'comunicados':
                    return <Comunicados user={user}/>; // Correcto
                case 'reservas':
                    return <GestionReservas user={user}/>;

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
                case 'comunicados':
                    return <Comunicados user={user}/>; // <-- ¡CORREGIDO!
                case 'visitantes':
                    return <GestionVisitantes user={user}/>;
                default:
                    return <ResidentDashboard/>;
            }
        }
    };

    const getTitle = () => {
        if (activeView === 'usuarios') return 'Gestión de Usuarios';
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