import React from 'react';

function ResidentDashboard() {
  return (
    <div className="widgets-grid">
      <div className="widget kpi-card">
        <p className="value">Bs. 850.00</p>
        <p className="label">Saldo Pendiente</p>
      </div>
      <div className="widget kpi-card">
        <p className="value">3</p>
        <p className="label">Comunicados Nuevos</p>
      </div>
      <div className="widget" style={{ gridColumn: 'span 2' }}>
        <h3>Próximas Reservas</h3>
        <ul className="widget-list">
            <li><span>Quincho Principal</span><span>25 Sep, 20:00</span></li>
        </ul>
      </div>
      <div className="widget" style={{ gridColumn: 'span 2' }}>
        <h3>Últimos Comunicados</h3>
        <ul className="widget-list">
            <li><span>Mantenimiento General de Piscina</span><span>Admin</span></li>
            <li><span>Corte de agua programado</span><span>Admin</span></li>
        </ul>
      </div>
    </div>
  );
}

export default ResidentDashboard;