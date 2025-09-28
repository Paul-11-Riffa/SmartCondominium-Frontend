// src/pages/PaseVisitante.jsx

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import '../styles/PaseVisitante.css'; // Crearemos este archivo de estilos

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function PaseVisitante() {
  const [searchParams] = useSearchParams();
  const [paseInfo, setPaseInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      try {
        // Decodificamos y parseamos los datos de la URL
        const decodedData = JSON.parse(atob(data));
        setPaseInfo(decodedData);

        // Verificamos si el pase es válido por fecha
        const hoy = new Date();
        const inicio = new Date(decodedData.valido_desde + 'T00:00:00');
        const fin = new Date(decodedData.valido_hasta + 'T23:59:59');
        if (hoy >= inicio && hoy <= fin) {
          setIsValid(true);
        } else {
          setIsValid(false);
        }
      } catch (e) {
        setError('Los datos del pase son inválidos.');
      }
    } else {
      setError('No se proporcionaron datos del pase.');
    }
    setIsLoading(false);
  }, [searchParams]);

  if (isLoading) {
    return <div className="pase-container loading"><FaSpinner className="spinner" /> Cargando...</div>;
  }

  if (error) {
    return <div className="pase-container error">{error}</div>;
  }

  return (
    <div className={`pase-container ${isValid ? 'valid' : 'invalid'}`}>
      <div className="pase-header">
        {isValid ? <FaCheckCircle className="icon" /> : <FaTimesCircle className="icon" />}
        <h1>{isValid ? 'Pase de Acceso Válido' : 'Pase de Acceso Inválido'}</h1>
      </div>
      <div className="pase-details">
        <h2>{paseInfo.nombre}</h2>
        <p><strong>CI:</strong> {paseInfo.carnet}</p>
        <p><strong>Destino:</strong> {paseInfo.propiedad_destino}</p>
        <p><strong>Válido Desde:</strong> {paseInfo.valido_desde}</p>
        <p><strong>Válido Hasta:</strong> {paseInfo.valido_hasta}</p>
      </div>
      <div className="pase-footer">
        Verificado por SmartCondominium
      </div>
    </div>
  );
}

export default PaseVisitante;