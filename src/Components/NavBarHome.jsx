import iconHome from '/home.webp';
import iconUser from '/user.webp';
import iconStore from '/store.webp';
import iconMoon from '/moon.webp';
import iconBrain from '/administrador.webp'
import '../Styles/stylesNavBarHome.css';
import { Link } from 'react-router-dom';
import SesionOff from './SesionOff';
import { useDarkMode } from '../Context/DarkMode.jsx'; 
import React from 'react';

const NavBarHome = React.memo(({ userId , role }) => {
  const { toggleDarkMode } = useDarkMode();
  return (
    <>
      <main id="main-nvhome">
        <section id="nav-bar-home">
          <Link to={`/Home/${userId}`}>
            <button><img src={iconHome} alt="iconHome" /></button>
          </Link>
          <Link to={`/gimnasios/${userId}`}>
            <button><img src={iconStore} alt="iconStore" /></button>
          </Link>
          <Link to={`/perfil/${userId}`}>
            <button><img src={iconUser} alt="iconUser" /></button>
          </Link>
          {
            role === "owner" || role === "instructor" ? <Link to={`/administracion/${userId}`}>
            <button><img src={iconBrain} alt="iconUser" /></button>
          </Link> : null
          }
          <button onClick={toggleDarkMode}>
            <img src={iconMoon} alt="iconMoon" />
          </button>
          <SesionOff />
        </section>
      </main>
    </>
  );
})

export default NavBarHome;
