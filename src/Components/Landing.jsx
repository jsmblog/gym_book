import '../Styles/stylesLanding.css'
import {Link} from 'react-router-dom'
const Landing = () => {
  return (
    <>
    <main id='main-landing'>
  <h1 id='greet' className='tracking-in-expand'>¡ Bienvenido a GymBook !</h1>
  <p id='cta-message' className='fade-in'>
  Descubre gimnasios cercanos, conoce sus servicios y tarifas. Conéctate con otros usuarios, comparte tus avances y, si eres instructor o propietario, atrae nuevos clientes y haz crecer tu negocio.
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
</main>

    </>
  )
}

export default Landing