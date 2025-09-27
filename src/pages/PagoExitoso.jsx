// src/pages/PagoExitoso.jsx

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import '../styles/PagoModal.css'; // Reutilizamos estilos

function PagoExitoso() {

  useEffect(() => {
    // Podrías usar el 'session_id' de la URL para verificar el pago
    // con tu backend, pero el webhook ya lo hace de forma más segura.
    // Por ahora, solo mostramos el mensaje.
  }, []);

  return (
    <div className="login-page-container">
      <div className="modal-content pago-modal">
        <div className="modal-body payment-result">
          <FaCheckCircle className="icon-success" />
          <h3>¡Pago Realizado con Éxito!</h3>
          <p>
            Gracias por tu pago. La transacción ha sido procesada correctamente.
            En unos momentos verás el cambio reflejado en tu estado de cuenta.
          </p>
          <div className="modal-actions" style={{ justifyContent: 'center' }}>
            <Link to="/estado-cuenta" className="btn btn-primary">
              Volver al Estado de Cuenta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PagoExitoso;