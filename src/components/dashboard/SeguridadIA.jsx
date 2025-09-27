// src/components/dashboard/SeguridadIA.jsx

import React, { useState } from 'react';
import { FaCamera, FaCar, FaUserCheck, FaUserTimes, FaExclamationTriangle } from 'react-icons/fa';
import '../../styles/Gestion.css';
import '../../styles/SeguridadIA.css'; // Crearemos este nuevo archivo de estilos

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function SeguridadIA() {
  const [mode, setMode] = useState('facial'); // 'facial' o 'placas'
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!imageFile) {
      setError('Por favor, selecciona una imagen.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('image', imageFile);

    const endpoint = mode === 'facial' ? 'recognize_face' : 'detect_plate';
    const token = localStorage.getItem('authToken');

    try {
      const response = await fetch(`${API_URL}/api/ai-detection/${endpoint}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ocurrió un error en el servidor.');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="gestion-container">
      <div className="ia-selector">
        <button
          className={`btn ${mode === 'facial' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('facial')}
        >
          <FaCamera /> Reconocimiento Facial
        </button>
        <button
          className={`btn ${mode === 'placas' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('placas')}
        >
          <FaCar /> Detección de Placas
        </button>
      </div>

      <div className="ia-content">
        <div className="ia-upload-section">
          <h3>Sube una imagen para analizar</h3>
          <input type="file" accept="image/*" onChange={handleFileChange} className="form-input" />

          {preview && (
            <div className="image-preview">
              <img src={preview} alt="Vista previa" />
            </div>
          )}

          <button onClick={handleSubmit} className="btn btn-primary" disabled={isLoading || !imageFile}>
            {isLoading ? 'Analizando...' : 'Analizar Imagen'}
          </button>
        </div>

        <div className="ia-results-section">
          <h3>Resultados del Análisis</h3>
          {error && <p className="error-message"><FaExclamationTriangle /> {error}</p>}

          {result && mode === 'facial' && (
            <div className={`result-card ${result.is_resident ? 'success' : 'failure'}`}>
              {result.is_resident ? <FaUserCheck className="result-icon success" /> : <FaUserTimes className="result-icon failure" />}
              <h4>{result.is_resident ? 'Residente Identificado' : 'Persona No Identificada'}</h4>
              {result.user && <p><strong>Nombre:</strong> {result.user.nombre}</p>}
              <p><strong>Confianza:</strong> {result.confidence.toFixed(2)}%</p>
              <p><strong>Estado:</strong> <span className={`status-${result.status}`}>{result.status}</span></p>
              {result.image_url && <img src={result.image_url} alt="Detección" className="result-image"/>}
            </div>
          )}

          {result && mode === 'placas' && (
            <div className={`result-card ${result.is_authorized ? 'success' : 'failure'}`}>
              {result.is_authorized ? <FaCar className="result-icon success" /> : <FaExclamationTriangle className="result-icon failure" />}
              <h4>{result.is_authorized ? 'Vehículo Autorizado' : 'Vehículo No Autorizado'}</h4>
              <p><strong>Placa Detectada:</strong> {result.plate || 'No detectada'}</p>
              {result.vehicle && <p><strong>Descripción:</strong> {result.vehicle.descripcion}</p>}
              <p><strong>Confianza:</strong> {result.confidence.toFixed(2)}%</p>
              <p><strong>Estado:</strong> <span className={`status-${result.status}`}>{result.status}</span></p>
              {result.image_url && <img src={result.image_url} alt="Detección de Placa" className="result-image"/>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SeguridadIA;