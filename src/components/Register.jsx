import React, { useState } from 'react';
import '../styles/Register.css'; // Nuestros nuevos estilos
import '../components/dashboard/GestionUnidades'; // Reutilizamos estilos de botones y inputs

function Register({ switchToLogin }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    contrasena: '',
    sexo: '',
    telefono: '',
  });
  const [error, setError] = useState(null);

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) {
        // Manejo de errores de la API (ej. correo ya existe)
        const errorMsg = data.detail || Object.values(data).flat().join(' ');
        throw new Error(errorMsg);
      }
      alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
      switchToLogin(); // Cambia a la vista de login
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="register-container">
      <h2>Crea tu Cuenta</h2>
      <div className="step-indicator">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
        <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
        <div className={`step ${step >= 3 ? 'active' : ''}`}>3</div>
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <>
            <div className="form-group">
              <label>Nombre</label>
              <input name="nombre" value={formData.nombre} onChange={handleChange} className="form-input" required />
            </div>
            <div className="form-group">
              <label>Apellido</label>
              <input name="apellido" value={formData.apellido} onChange={handleChange} className="form-input" required />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="form-group">
              <label>Correo Electrónico</label>
              <input type="email" name="correo" value={formData.correo} onChange={handleChange} className="form-input" required />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input type="password" name="contrasena" value={formData.contrasena} onChange={handleChange} className="form-input" required minLength="8" />
            </div>
          </>
        )}

        {step === 3 && (
          <>
             <div className="form-group">
              <label>Teléfono</label>
              <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} className="form-input" required />
            </div>
            <div className="form-group">
              <label>Sexo</label>
               <select name="sexo" value={formData.sexo} onChange={handleChange} className="form-input" required>
                    <option value="">Seleccionar...</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
               </select>
            </div>
          </>
        )}

        {error && <p className="error-message">{error}</p>}

        <div className="form-navigation">
          {step > 1 && <button type="button" className="btn btn-secondary" onClick={prevStep}>Atrás</button>}
          {step < 3 && <button type="button" className="btn btn-primary" onClick={nextStep} style={{ marginLeft: 'auto' }}>Siguiente</button>}
          {step === 3 && <button type="submit" className="btn btn-primary" style={{ marginLeft: 'auto' }}>Registrarse</button>}
        </div>
      </form>
      <p className="login-link">
        ¿Ya tienes una cuenta? <a onClick={switchToLogin}>Inicia sesión</a>
      </p>
    </div>
  );
}

export default Register;