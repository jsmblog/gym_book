import React from 'react';
import '../Styles/stylesCardPlans.css';
import { useNavigate } from 'react-router-dom';

const CardPlans = React.memo(() => {
  const navigate = useNavigate();
  const goBack = () => {
    navigate(-1, { replace: true });
  };
  
  return (
    <div className="card-plans-container">
      <button className="back" onClick={goBack}>
        ←
      </button>
      
      <div className="card-plan free-plan">
        <h2 className="plan-title">Plan Free</h2>
        <p className="plan-description">
          Empieza a potenciar tu gimnasio sin costo alguno. Con el plan Free obtendrás:
        </p>
        <ul className="plan-features">
          <li>Publica y administra contenido de manera profesional</li>
          <li>Registra y promociona tu gimnasio en la plataforma</li>
          <li>Exhibe tus tarifas y horarios de forma clara y ordenada</li>
          <li>Fomenta la creación de una comunidad activa y comprometida</li>
          <li>Recibe opiniones y comentarios verificados de tus clientes</li>
        </ul>
        <button onClick={goBack} className="plan-button free-button">
          ¡Empieza Gratis!
        </button>
      </div>

      <div className="card-plan basic-plan">
        <h2 className="plan-title">Plan Premium</h2>
        <p className="plan-description">
          Transforma la gestión de tu gimnasio con funciones avanzadas. Por solo{' '}
          <strong>0.50 ctv por día</strong>, obtendrás:
        </p>
        <ul className="plan-features">
          <li>Gestión integral de usuarios e inventario</li>
          <li>Administración eficiente de múltiples sucursales</li>
          <li>Optimización en la gestión y coordinación de tu personal</li>
          <li>Presentación detallada y profesional de información para clientes</li>
          <li>Acceso y descarga de datos de clientes potenciales</li>
          <li>Análisis en tiempo real con reportes detallados</li>
          <li>Posicionamiento prioritario de tu gimnasio en la plataforma</li>
          <li>Simplificación de la gestión financiera</li>
          <li>Acceso exclusivo a futuras funcionalidades (ej. campañas de email marketing)</li>
          <li>Soporte técnico premium y actualizaciones regulares</li>
          <li>Herramientas avanzadas para gestionar y moderar reseñas negativas</li>
        </ul>
        <h6>(equivalente a <strong>$15 USD/mes</strong>)</h6>
        <button className="plan-button premium-button">¡Hazlo Premium!</button>
      </div>
    </div>
  );
});

export default CardPlans;
