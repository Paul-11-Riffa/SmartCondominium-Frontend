// src/components/dashboard/ReporteBitacora.jsx

import React, { useState } from 'react';
import { FaFilePdf, FaFileExcel } from 'react-icons/fa';
import '../../styles/Gestion.css';
import '../../styles/EstadoCuenta.css'; // Reutilizamos algunos estilos

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function ReporteBitacora() {
    // Fechas por defecto: el mes actual
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    const [fechaInicio, setFechaInicio] = useState(firstDayOfMonth);
    const [fechaFin, setFechaFin] = useState(todayStr);
    const [reportData, setReportData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

// src/components/dashboard/ReporteBitacora.jsx

const handleGenerateReport = async () => {
    setIsLoading(true);
    setError(null);
    setReportData(null);
    try {
        const token = localStorage.getItem('authToken');
        const url = `${API_URL}/api/reporte/bitacora/?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
        const response = await fetch(url, { headers: { 'Authorization': `Token ${token}` } });

        // Esta es la clave: verificamos si la respuesta es realmente JSON antes de intentar leerla.
        const contentType = response.headers.get("content-type");
        if (!response.ok || !contentType || !contentType.includes("application/json")) {
            throw new Error('El servidor no respondió correctamente. Por favor, revisa la configuración del backend.');
        }

        const data = await response.json();
        setReportData(data);
    } catch (e) {
        setError(e.message);
    } finally {
        setIsLoading(false);
    }
};
    const handleDownload = async (format) => {
        setError(null);
        try {
            const token = localStorage.getItem('authToken');
            // --- CAMBIO CLAVE AQUÍ: 'format=' ahora es 'export=' ---
            const url = `${API_URL}/api/reporte/bitacora/?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}&export=${format}`;
            const response = await fetch(url, { headers: { 'Authorization': `Token ${token}` } });

            if (!response.ok) {
                // Mejora en el manejo de errores para mostrar mensajes más claros
                if (response.headers.get("content-type")?.includes("application/json")) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || errorData.error || `Error del servidor: ${response.status}`);
                }
                throw new Error(`Error al descargar el archivo. Código: ${response.status}`);
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            // Corregimos el nombre del archivo para que sea 'xlsx' en lugar de solo 'xls'
            link.setAttribute('download', `reporte_bitacora.${format === 'xlsx' ? 'xlsx' : 'pdf'}`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="gestion-container">
            <div className="gestion-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <h3>Reporte de Bitácora del Sistema</h3>
                <div className="filtro-mes" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
                    <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
                    <button onClick={handleGenerateReport} className="btn btn-primary" disabled={isLoading}>
                        {isLoading ? 'Generando...' : 'Generar Reporte'}
                    </button>
                </div>
            </div>

            {error && <p className="error-message">{error}</p>}

            {reportData && (
                <>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '1rem' }}>
                        <button onClick={() => handleDownload('pdf')} className="btn btn-secondary"><FaFilePdf /> Descargar PDF</button>
                        <button onClick={() => handleDownload('xlsx')} className="btn btn-secondary"><FaFileExcel /> Descargar Excel</button>
                    </div>

                    <div className="summary-cards">
                        <div className="summary-card">
                            <p className="summary-label">Total de Entradas</p>
                            <p className="summary-value">{reportData.total_entradas}</p>
                        </div>
                        <div className="summary-card pagos">
                            <p className="summary-label">Usuarios Activos en Periodo</p>
                            <p className="summary-value">{reportData.total_usuarios_activos}</p>
                        </div>
                    </div>

                    <h3>Detalle de Actividad</h3>
                    <div className="gestion-table-wrapper">
                        <table className="gestion-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Hora</th>
                                    <th>Usuario</th>
                                    <th>Acción</th>
                                    <th>Dirección IP</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.detalle.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.fecha}</td>
                                        <td>{item.hora}</td>
                                        <td>{item.usuario}</td>
                                        <td>{item.accion}</td>
                                        <td>{item.ip}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

export default ReporteBitacora;