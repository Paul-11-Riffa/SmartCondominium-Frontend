import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import ResidentDashboard from '../components/dashboard/ResidentDashboard';
import GestionUnidades from '../components/dashboard/GestionUnidades'; // Importamos el nuevo componente
import '../styles/Dashboard.css';

function Dashboard({ user, onLogout }) {
  const [activeView, setActiveView] = useState('dashboard'); // Estado para controlar la vista

  const is_admin = user.rol?.tipo === 'admin';
  const userName = user.nombre || 'Usuario';

  // Función para renderizar la vista activa
  const renderContent = () => {
    if (is_admin) {
      switch (activeView) {
        case 'dashboard':
          return <AdminDashboard />;
        case 'unidades':
          return <GestionUnidades />;
        // Aquí añadiremos más 'cases' para otras vistas en el futuro
        default:
          return <AdminDashboard />;
      }
    } else {
      // Lógica para las vistas del residente
      return <ResidentDashboard />;
    }
  };

  const getTitle = () => {
      if(activeView === 'unidades') return 'Unidades Habitacionales';
      return is_admin ? 'Dashboard Administrativo' : 'Mi Espacio';
  }

  return (
    <div className="dashboard-container">
      {/* Le pasamos la función para cambiar de vista al Sidebar */}
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