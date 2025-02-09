import React, { useState, useEffect } from 'react';
import '../Styles/stylesAdministration.css';
import { useNavigate } from 'react-router-dom';
import Usuarios from './Usuarios';
import Iventory from './Iventory';
import Statistics from './Statistics';
import Campaign from './Campaign';
import Config from './Config';

const Administration = React.memo((({currentUserData}) => {
  if(!currentUserData){
    return (
      <div className="loading-container">
        <p>Descargando datos de usuario...</p>
        <div className="loader-spinner"></div>
      </div>
    )
  }
  const navigate = useNavigate();
  const backHome = () => {
    navigate(-1, { replace: true });
}; 
      const [users, setUsers] = useState([]);
  const [activeSection, setActiveSection] = useState("usuarios");

  // Funciones de renderizado para cada sección

  const renderUsuariosSection = () => (
    <Usuarios currentUserData={currentUserData} users={users} setUsers={setUsers}/>
  );
  const renderInventarioSection = () => (
    <Iventory currentUserData={currentUserData} />
  );

  const renderEstadisticasSection = () => (
    <Statistics users={users} />
  );

  const renderCampanasSection = () => (
    <Campaign/>
  );

  const renderConfiguracionesSection = () => (
    <Config/>
  );

  const renderSection = () => {
    switch (activeSection) {
      case "usuarios":
        return renderUsuariosSection();
      case "inventario":
        return renderInventarioSection();
      case "estadisticas":
        return renderEstadisticasSection();
      case "campanas":
        return renderCampanasSection();
      case "configuraciones":
        return renderConfiguracionesSection();
      default:
        return renderUsuariosSection();
    }
  };

  return (
    <>
      <header className="header-administration">
      <button onClick={backHome} id='go-back-admin'>←</button>
        <h1>Bienvenido {currentUserData?.name} al dashboard de Administración</h1>
        <p>Panel de propietario</p>
      </header>
      <div className="dashboard-container">
        <aside className="sidebar">
          <nav>
            <ul>
              <li className={activeSection === "usuarios" ? "active" : ""}>
                <button onClick={() => setActiveSection("usuarios")}>Usuarios</button>
              </li>
              <li className={activeSection === "inventario" ? "active" : ""}>
                <button onClick={() => setActiveSection("inventario")}>Inventario</button>
              </li>
              <li className={activeSection === "estadisticas" ? "active" : ""}>
                <button onClick={() => setActiveSection("estadisticas")}>Estadísticas</button>
              </li>
              <li className={activeSection === "campanas" ? "active" : ""}>
                <button onClick={() => setActiveSection("campanas")}>Campañas</button>
              </li>
              <li className={activeSection === "configuraciones" ? "active" : ""}>
                <button onClick={() => setActiveSection("configuraciones")}>Configuraciones</button>
              </li>
            </ul>
          </nav>
        </aside>
        <main className="main-administration">
          {renderSection()}
        </main>
      </div>
    </>
  );
}))

export default Administration;
