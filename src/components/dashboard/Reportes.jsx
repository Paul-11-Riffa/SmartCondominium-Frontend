// src/components/dashboard/Reportes.jsx

import React, {useState} from 'react';
import {FaFilePdf, FaFileExcel} from 'react-icons/fa';
import '../../styles/Gestion.css';
import '../../styles/EstadoCuenta.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function Reportes() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    const [fechaInicio, setFechaInicio] = useState(firstDayOfMonth);
    const [fechaFin, setFechaFin] = useState(todayStr);
    const [reportData, setReportData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // En src/components/dashboard/Reportes.jsx

// Reemplaza la función handleGenerateReport:
    const handleGenerateReport = async () => {
        setIsLoading(true);
        setError(null);
        setReportData(null);
        try {
            const token = localStorage.getItem('authToken');
            // --- URL SIMPLIFICADA AQUÍ ---
            const url = `${API_URL}/api/reporte/?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
            const response = await fetch(url, {headers: {'Authorization': `Token ${token}`}});
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'No se pudo generar el reporte.');
            }
            const data = await response.json();
            setReportData(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

// Reemplaza la función handleDownload:
    const handleDownload = async (format) => {
        setError(null);
        try {
            const token = localStorage.getItem('authToken');
            // --- URL SIMPLIFICADA AQUÍ ---
            const url = `${API_URL}/api/reporte/?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}&format=${format}`;
            const response = await fetch(url, {headers: {'Authorization': `Token ${token}`}});
            if (!response.ok) {
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
            link.setAttribute('download', `reporte_areas_comunes.${format === 'xlsx' ? 'xlsx' : 'pdf'}`);
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
            <div className="gestion-header" style={{marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem'}}>
                <h3>Reporte de Uso de Áreas Comunes</h3>
                <div className="filtro-mes" style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                    <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)}/>
                    <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)}/>
                    <button onClick={handleGenerateReport} className="btn btn-primary" disabled={isLoading}>
                        {isLoading ? 'Generando...' : 'Generar Reporte'}
                    </button>
                </div>
            </div>

            {error && <p className="error-message">{error}</p>}

            {reportData && (
                <>
                    <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '1rem'}}>
                        <button onClick={() => handleDownload('pdf')} className="btn btn-secondary">
                            <FaFilePdf/> Descargar PDF
                        </button>
                        <button onClick={() => handleDownload('xlsx')} className="btn btn-secondary">
                            <FaFileExcel/> Descargar Excel
                        </button>
                    </div>

                    <div className="estado-cuenta-content">
                        <div className="summary-cards">
                            <div className="summary-card">
                                <p className="summary-label">Reservas Totales</p>
                                <p className="summary-value">{reportData.total_reservas}</p>
                            </div>
                            <div className="summary-card pagos">
                                <p className="summary-label">Área Más Popular</p>
                                <p className="summary-value" style={{fontSize: '1.8em'}}>
                                    {reportData.area_mas_usada?.id_area_c__descripcion || 'N/A'}
                                </p>
                            </div>
                            <div className="summary-card cargos">
                                <p className="summary-label">Área Menos Popular</p>
                                <p className="summary-value" style={{fontSize: '1.8em'}}>
                                    {reportData.area_menos_usada?.id_area_c__descripcion || 'N/A'}
                                </p>
                            </div>
                        </div>

                        <h3>Detalle por Área</h3>
                        <div className="gestion-table-wrapper">
                            <table className="gestion-table">
                                <thead>
                                <tr>
                                    <th>Nombre del Área Común</th>
                                    <th>Cantidad de Reservas</th>
                                </tr>
                                </thead>
                                <tbody>
                                {reportData.detalle_por_area.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.id_area_c__descripcion}</td>
                                        <td>{item.cantidad_reservas}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default Reportes;