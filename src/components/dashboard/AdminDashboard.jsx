import React from 'react';

function AdminDashboard() {
  return (
    <div className="widgets-grid">
      <div className="widget kpi-card">
        <p className="value">Bs. 45,800</p>
        <p className="label">Ingresos del Mes</p>
      </div>
      <div className="widget kpi-card">
        <p className="value">12%</p>
        <p className="label">Tasa de Morosidad</p>
      </div>
      <div className="widget kpi-card">
        <p className="value">152</p>
        <p className="label">Usuarios Activos</p>
      </div>
      <div className="widget kpi-card">
        <p className="value">8</p>
        <p className="label">Alertas de Seguridad (Hoy)</p>
      </div>
      <div className="widget" style={{ gridColumn: 'span 2' }}>
        <h3>Feed de Seguridad IA</h3>
        <ul className="widget-list">
          <li><span>Placa no reconocida [ABC-123]</span> <span>Hace 5 min</span></li>
          <li><span>Visitante no registrado en Puerta Norte</span> <span>Hace 22 min</span></li>
          <li><span>Acceso facial denegado</span> <span>Hace 45 min</span></li>
        </ul>
      </div>
      <div className="widget" style={{ gridColumn: 'span 2' }}>
        <h3>Tareas de Mantenimiento Pendientes</h3>
        <ul className="widget-list">
          <li><span>Revisión bomba de agua piscina</span> <span>Urgente</span></li>
          <li><span>Cambio de luminaria P2</span> <span>Normal</span></li>
        </ul>
      </div>
    </div>
  );
}

export default AdminDashboard;