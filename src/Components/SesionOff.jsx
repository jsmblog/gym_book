import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'
import '../Styles/styleSesionOff.css'
import { AUTH_USER } from '../ConfigFirebase/config.js'
import iconTurn_on from '/apagar.webp';
const SesionOff = () => {
  const navigate = useNavigate();
  const handleSignOut = async () => {
    try {
      sessionStorage.removeItem('gymsData');
      await signOut(AUTH_USER);
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error) {
      console.error("Error al cerrar sesión: ");
    }
  };
  return (
    <>
      <button title='cerrar sesión' onClick={handleSignOut}>
        <img src={iconTurn_on} alt='cerrar-sesión' />
      </button>
    </>
  )
}

export default SesionOff