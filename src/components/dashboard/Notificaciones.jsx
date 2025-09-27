// src/components/dashboard/Notificaciones.jsx

import React from 'react';
import { FaBell, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

function Notificaciones({ notificaciones, onClose }) {
  const getIcon = (tipo) => {
    if (tipo?.toLowerCase().includes('pago')) {
      return <FaExclamationTriangle style={{ color: '#f57c00' }} />;
    }
    return <FaBell style={{ color: '#1e88e5' }} />;
  };

  return (
    <div className="notifications-panel">
      <div className="notifications-header">
        <h3>Notificaciones</h3>
        <button onClick={onClose}>&times;</button>
      </div>
      <div className="notifications-list">
        {notificaciones.length > 0 ? (
          notificaciones.map((notif) => (
            <div key={notif.id_envio} className="notification-item">
              <div className="notification-icon">{getIcon(notif.tipo)}</div>
              <div className="notification-content">
                <p className="notification-desc">{notif.descripcion}</p>
                <span className="notification-date">{new Date(notif.fecha).toLocaleString()}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="no-notifications">No tienes notificaciones nuevas.</p>
        )}
      </div>
    </div>
  );
}

export default Notificaciones;