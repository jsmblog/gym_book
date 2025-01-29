import iconHome from '/home.png'
import iconUser from '/user.png'
import iconStore from '/store.png'
import iconMoon from '/moon.png'
import '../Styles/stylesNavBarHome.css'
import { Link } from 'react-router-dom'
const NavBarHome = ({userId}) => {
  return (
    <>
    <section id='nav-bar-home'>
       <Link to={`/Home/${userId}`} >
       <button><img src={iconHome} alt="iconHome" /></button>
       </Link>
      <Link to={`/profile/${userId}`} >
      <button><img src={iconUser} alt="iconUser" /></button>
      </Link>
      <Link to={`/marketplace/${userId}`} >
      <button><img src={iconStore} alt="iconStore" /></button>
      </Link>
      <button><img src={iconMoon} alt="iconMoon" /></button>
    </section>
    </>
  )
}

export default NavBarHome