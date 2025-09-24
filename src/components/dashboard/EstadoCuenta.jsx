import React, { useState, useEffect } from 'react';
import { FaFileInvoiceDollar, FaPrint } from 'react-icons/fa';
import '../../styles/Gestion.css'; // Reutilizamos estilos de GestionUnidades
import '../../styles/EstadoCuenta.css'; // Añadiremos estilos específicos

function EstadoCuenta() {
  const [estadoCuenta, setEstadoCuenta] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mes, setMes] = useState(new Date().toISOString().slice(0, 7)); // Formato YYYY-MM

  const fetchEstadoCuenta = async (mesSeleccionado) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No autorizado.');

      // El endpoint que ya existe en el backend
      const response = await fetch(`http://127.0.0.1:8000/api/estado-cuenta/?mes=${mesSeleccionado}`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'No se pudo obtener el estado de cuenta.');
      }

      const data = await response.json();
      setEstadoCuenta(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEstadoCuenta(mes);
  }, [mes]);

  const handleMesChange = (e) => {
    setMes(e.target.value);
  };

  if (isLoading) return <p>Cargando estado de cuenta...</p>;
  if (error) return <p className="error-message">Error: {error}</p>;

  return (
    <div className="gestion-container">
      <div className="gestion-header">
        <h2><FaFileInvoiceDollar /> Estado de Cuenta</h2>
        <div className="filtro-mes">
          <label htmlFor="mes">Seleccionar Mes: </label>
          <input
            type="month"
            id="mes"
            name="mes"
            value={mes}
            onChange={handleMesChange}
          />
        </div>
      </div>

      {estadoCuenta && (
        <div className="estado-cuenta-content">
          <div className="summary-cards">
            <div className="summary-card cargos">
              <p className="summary-label">Total Cargos del Mes</p>
              <p className="summary-value">Bs. {estadoCuenta.totales.cargos}</p>
            </div>
            <div className="summary-card pagos">
              <p className="summary-label">Total Pagos del Mes</p>
              <p className="summary-value">Bs. {estadoCuenta.totales.pagos}</p>
            </div>
            <div className="summary-card saldo">
              <p className="summary-label">Saldo del Mes</p>
              <p className={`summary-value ${parseFloat(estadoCuenta.totales.saldo) > 0 ? 'deuda' : ''}`}>
                Bs. {estadoCuenta.totales.saldo}
              </p>
            </div>
          </div>

          <h3>Detalle de Cargos</h3>
          <div className="gestion-table-wrapper">
            <table className="gestion-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Concepto</th>
                  <th>Tipo</th>
                  <th>Monto (Bs.)</th>
                </tr>
              </thead>
              <tbody>
                {estadoCuenta.cargos.map((cargo, index) => (
                  <tr key={`cargo-${index}`}>
                    <td>{cargo.fecha || 'Recurrente'}</td>
                    <td>{cargo.descripcion}</td>
                    <td>{cargo.tipo}</td>
                    <td className="monto">-{cargo.monto}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3>Detalle de Pagos Realizados</h3>
           <div className="gestion-table-wrapper">
            <table className="gestion-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Concepto</th>
                  <th>Tipo de Pago</th>
                  <th>Monto (Bs.)</th>
                  <th>Comprobante</th>
                </tr>
              </thead>
              <tbody>
                {estadoCuenta.pagos.map((pago) => (
                  <tr key={`pago-${pago.id}`}>
                    <td>{pago.fecha}</td>
                    <td>{pago.concepto}</td>
                    <td>{pago.tipo_pago}</td>
                    <td className="monto positivo">+{pago.monto}</td>
                    <td>
                      <a href={`http://127.0.0.1:8000/api/comprobante/${pago.id}/`} target="_blank" rel="noopener noreferrer" className="btn-icon">
                        <FaPrint />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default EstadoCuenta;