import React from 'react';
import '../Styles/stylesCardPlans.css';
import { useNavigate } from 'react-router-dom';

const CardPlans = React.memo(() => {
    const navigate = useNavigate();
    const goBack = () => {
        navigate(-1 , {replace:true});
    }
  return (
    <div className="card-plans-container">
        <button className='back' onClick={goBack} >←</button>
      <div className="card-plan free-plan">
        <h2 className="plan-title">Plan Free</h2>
        <p className="plan-description">
          Empieza a potenciar tu gimnasio sin costo. Con el plan Free, obtienes:
        </p>
        <ul className="plan-features">
          <li>Creación y publicación de contenido</li>
          <li>Registra tu gimnasio</li>
          <li>Muestra tus tarifas y horarios</li>
          <li>Crea una comunidad</li>
        </ul>
        <button onClick={goBack} className="plan-button free-button">¡Empieza Gratis!</button>
      </div>

      <div className="card-plan basic-plan">
        <h2 className="plan-title">Plan Premium</h2>
        <p className="plan-description">
          Transforma la gestión de tu gimnasio con funciones premium. Por solo{' '}
          <strong>0.50 ctv por día</strong> , obtienes:
        </p>
        <ul className="plan-features">
          <li>Gestión completa de usuarios e inventario</li>
          <li>Gestiona sucursales </li>
          <li>Gestiona tu personal</li>
          <li>Muestra información más detallada a clientes</li>
          <li>Obtén y descarga datos de clientes potenciales</li>
          <li>Estadísticas en tiempo real y reportes detallados</li>
          <li>Prioridad en el posicionamiento de tu gimnasio</li>
          <li>Lleva tus finanzas de manera sencilla con facilidad.</li>
          <li>Acceso anticipado a futuras funcionalidades (ej. campañas de email marketing)</li>
          <li>Soporte premium y actualizaciones continuas</li>
        </ul>
        <h6>(equivalente a <strong>$15 USD/mes</strong>)</h6>
        <button className="plan-button premium-button">¡Hazlo Premium!</button>
      </div>
    </div>
  );
});

export default CardPlans;
