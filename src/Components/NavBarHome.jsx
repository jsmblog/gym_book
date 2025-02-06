import iconHome from '/home.webp'
import iconUser from '/user.webp'
import iconStore from '/store.webp'
import iconMoon from '/moon.webp'
import '../Styles/stylesNavBarHome.css'
import { Link } from 'react-router-dom'
import SesionOff from './SesionOff'
const NavBarHome = ({ userId }) => {
  return (
    <>
      <main id="main-nvhome">
        <section id='nav-bar-home'>
          <Link to={`/Home/${userId}`} >
            <button><img src={iconHome} alt="iconHome" /></button>
          </Link>
          <Link to={`/gimnasios/${userId}`} >
            <button><img src={iconStore} alt="iconStore" /></button>
          </Link>
          <Link to={`/profile/${userId}`} >
            <button><img src={iconUser} alt="iconUser" /></button>
          </Link>
          <button><img src={iconMoon} alt="iconMoon" /></button>
          <SesionOff />
        </section>
      </main>
    </>
  )
}

export default NavBarHome