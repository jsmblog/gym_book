import '../Styles/stylesLanding.css'
import {Link} from 'react-router-dom'
import Footer from './Footer'
const Landing = () => {
  return (
    <>
    <main id='main-landing'>
  <h1 id='greet' className='tracking-in-expand'>¡ Bienvenido a GymBook !</h1>
  <p id="cta-message" className="fade-in">
  Encuentra el gimnasio perfecto e instructores cercanos a ti, descubre servicios y tarifas únicas, y únete a una comunidad apasionada por el fitness. Comparte tus logros, recibe consejos de expertos y despeja tus dudas, si eres instructor o propietario, atrae nuevos clientes para potenciar tu éxito.
</p>

  <div id='cont-btns-actions' className='fade-in'>
    <Link to="/registro/usuario">
      <button className='back-blue-dark'>Regístrate como Usuario</button>
    </Link>
    <Link to="/registro/propietario">
      <button id='bearer'>Regístrate como Propietario</button>
    </Link>
    <Link to="/registro/instructor">
      <button id='instructor'>Soy Instructor</button>
    </Link>
    <Link to="/ingreso">
      <button>Iniciar Sesión</button>
    </Link>
  </div>
  <Footer/>
</main>

    </>
  )
}

export default Landing