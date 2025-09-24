import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import ResidentDashboard from '../components/dashboard/ResidentDashboard';
import GestionUnidades from '../components/dashboard/GestionUnidades';
import EstadoCuenta from '../components/dashboard/EstadoCuenta';
import Comunicados from '../components/dashboard/Comunicados';
import '../styles/Dashboard.css';

function Dashboard({ user, onLogout }) {
    const [activeView, setActiveView] = useState('dashboard');
    const is_admin = user.rol?.tipo === 'admin';
    const userName = user.nombre || 'Usuario';

    const renderContent = () => {
        if (is_admin) {
            switch (activeView) {
                case 'dashboard':
                    return <AdminDashboard />;
                case 'unidades':
                    return <GestionUnidades />;
                case 'comunicados':
                    return <Comunicados user={user} />; // Correcto
                default:
                    return <AdminDashboard />;
            }
        } else {
            switch (activeView) {
                case 'dashboard':
                    return <ResidentDashboard />;
                case 'cuenta':
                    return <EstadoCuenta />;
                case 'comunicados':
                    return <Comunicados user={user} />; // <-- ¡CORREGIDO!
                default:
                    return <ResidentDashboard />;
            }
        }
    };

    const getTitle = () => {
        if (activeView === 'unidades') return 'Unidades Habitacionales';
        if (activeView === 'cuenta') return 'Mi Estado de Cuenta';
        if (activeView === 'comunicados') return 'Comunicados y Avisos';
        return is_admin ? 'Dashboard Administrativo' : 'Mi Espacio';
    };

    return (
        <div className="dashboard-container">
            <Sidebar user={user} onLogout={onLogout} setActiveView={setActiveView} activeView={activeView} />
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