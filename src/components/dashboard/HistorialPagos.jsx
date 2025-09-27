// src/components/dashboard/HistorialPagos.jsx

import React, { useState, useEffect } from 'react';
import { FaFilePdf, FaPrint } from 'react-icons/fa';
import '../../styles/Gestion.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function HistorialPagos() {
  const [historial, setHistorial] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistorial = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/api/historial-pagos/`, {
          headers: { 'Authorization': `Token ${token}` },
        });

        if (!response.ok) {
          throw new Error('No se pudo cargar el historial de pagos.');
        }
        const data = await response.json();
        setHistorial(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistorial();
  }, []);

  const handleDownloadPDF = async () => {
    setError(null);
    try {
        const token = localStorage.getItem('authToken');
        const url = `${API_URL}/api/historial-pagos/?format=pdf`;
        const response = await fetch(url, { headers: { 'Authorization': `Token ${token}` } });

        if (!response.ok) {
            throw new Error(`Error al descargar el PDF (código: ${response.status})`);
        }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', 'historial_de_pagos.pdf');
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
        setError(error.message);
    }
  };

  if (isLoading) return <p>Cargando historial...</p>;

  return (
    <div className="gestion-container">
      <div className="gestion-header">
        <h2>Mi Historial de Pagos</h2>
        <button onClick={handleDownloadPDF} className="btn btn-secondary">
          <FaFilePdf /> Descargar Historial en PDF
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="gestion-table-wrapper">
        <table className="gestion-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Concepto</th>
              <th>Monto (Bs.)</th>
              <th>Método de Pago</th>
              <th>Comprobante</th>
            </tr>
          </thead>
          <tbody>
            {historial.length > 0 ? (
              historial.map((pago) => (
                <tr key={pago.id}>
                  <td>{pago.fecha}</td>
                  <td>{pago.concepto}</td>
                  <td style={{ textAlign: 'right', color: '#43a047', fontWeight: '500' }}>
                    +{parseFloat(pago.monto).toFixed(2)}
                  </td>
                  <td>{pago.tipo_pago}</td>
                  <td>
                    <a
                      href={`${API_URL}/api/comprobante/${pago.id}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-icon"
                      title="Ver Comprobante"
                    >
                      <FaPrint />
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No se encontraron pagos registrados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default HistorialPagos;