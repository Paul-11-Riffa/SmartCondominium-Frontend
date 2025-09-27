// src/components/dashboard/EstadoCuenta.jsx

import React, { useState, useEffect } from 'react';
import { FaFileInvoiceDollar, FaPrint, FaCheckCircle, FaTimesCircle, FaTimes } from 'react-icons/fa';
import '../../styles/Gestion.css';
import '../../styles/EstadoCuenta.css';
import '../../styles/PagoModal.css';
import { useStripe } from '@stripe/react-stripe-js'; // <-- IMPORTANTE: Hook de Stripe

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function EstadoCuenta() {
  const [estadoCuenta, setEstadoCuenta] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mes, setMes] = useState(new Date().toISOString().slice(0, 7));

  const [showModal, setShowModal] = useState(false);
  const [cargoAPagar, setCargoAPagar] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const stripe = useStripe(); // <-- IMPORTANTE: Inicializamos Stripe

  const fetchEstadoCuenta = async (mesSeleccionado) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No autorizado.');

      const response = await fetch(`${API_URL}/api/estado-cuenta/?mes=${mesSeleccionado}`, {
        headers: { 'Authorization': `Token ${token}` },
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

  const handlePagarClick = (cargo) => {
    setCargoAPagar(cargo);
    setShowModal(true);
  };

  // --- FUNCIÓN DE PAGO ACTUALIZADA PARA STRIPE ---
  const handleConfirmarPago = async () => {
    if (!cargoAPagar || !stripe) {
        setError("Stripe no se ha cargado correctamente.");
        return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');

      // 1. Llamamos a nuestro backend para crear la sesión de pago de Stripe
      const response = await fetch(`${API_URL}/api/pagar-cuota/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({
          id_pago: cargoAPagar.id,
          mes: mes
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo iniciar el proceso de pago.');
      }

      // 2. Usamos el sessionId que nos dio el backend para redirigir al usuario a la página de pago de Stripe
      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId
      });

      if (error) {
        // Este error solo se mostrará si hay un problema de configuración o de red
        // antes de la redirección.
        throw new Error(error.message);
      }
      // Si todo va bien, el usuario es redirigido y nunca verá el 'finally' de abajo.

    } catch (err) {
      setError(err.message);
      setIsProcessing(false); // Detenemos el spinner si falla la redirección
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setCargoAPagar(null);
  };

  if (isLoading) return <p>Cargando estado de cuenta...</p>;

  return (
    <>
      <div className="gestion-container">
        {/* ... (el resto del JSX no cambia, solo la lógica de la función de pago) ... */}
        <div className="gestion-header">
          <h2><FaFileInvoiceDollar /> Estado de Cuenta</h2>
          <div className="filtro-mes">
            <label htmlFor="mes">Seleccionar Mes: </label>
            <input type="month" id="mes" name="mes" value={mes} onChange={(e) => setMes(e.target.value)} />
          </div>
        </div>

        {error && <p className="error-message">{error}</p>}

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
                    <p className="summary-label">Saldo Pendiente</p>
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
                    <th>Concepto</th>
                    <th>Monto (Bs.)</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {estadoCuenta.cargos.map((cargo) => (
                    cargo.origen !== 'multa' && (
                      <tr key={`cargo-${cargo.id}`}>
                        <td>{cargo.descripcion}</td>
                        <td className="monto">-{cargo.monto}</td>
                        <td>
                          {cargo.pagado ? (
                            <span className="status-aprobada">Pagado</span>
                          ) : (
                            <span className="status-pendiente">Pendiente</span>
                          )}
                        </td>
                        <td>
                          {!cargo.pagado && (
                            <button className="btn btn-primary" onClick={() => handlePagarClick(cargo)}>
                              Pagar
                            </button>
                          )}
                        </td>
                      </tr>
                    )
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
                            <a href={`${API_URL}/api/comprobante/${pago.id}/`} target="_blank" rel="noopener noreferrer" className="btn-icon">
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

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content pago-modal">
            <div className="modal-header">
              <h3>Confirmar Pago</h3>
              <button onClick={closeModal} className="btn-icon"><FaTimes /></button>
            </div>
            <div className="modal-body">
              <p>Serás redirigido a una página segura para completar tu pago:</p>
              <div className="pago-detalle">
                <span>{cargoAPagar?.descripcion}</span>
                <strong>Bs. {cargoAPagar?.monto}</strong>
              </div>
              <p className="pago-aviso">Nunca te pediremos los datos de tu tarjeta directamente.</p>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={isProcessing}>Cancelar</button>
              <button type="button" className="btn btn-primary" onClick={handleConfirmarPago} disabled={isProcessing}>
                {isProcessing ? 'Procesando...' : 'Ir a Pagar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default EstadoCuenta;