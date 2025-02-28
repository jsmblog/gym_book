import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import '../Styles/styleSesionOff.css';
import { AUTH_USER } from '../ConfigFirebase/config.js';
import iconTurn_on from '/apagar.webp';

const SesionOff = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      sessionStorage.removeItem('gyms')
      sessionStorage.removeItem('instructors')
      await signOut(AUTH_USER);
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error) {
      console.error("Error al cerrar sesión: ", error);
    }
  };

  return (
    <>
      <button title='cerrar sesión' onClick={() => setShowConfirm(true)}>
        <img src={iconTurn_on} alt='cerrar-sesión' />
      </button>

      {showConfirm && (
        <div className="modal-overlay-sesion">
          <div className="modal-content-sesion">
            <p>¿Estás seguro de que quieres salir?</p>
            <div className="modal-buttons-sesion">
              <div id="confirm-btn" onClick={handleSignOut}>Sí, salir</div>
              <div id="cancel-btn" onClick={() => setShowConfirm(false)}>Cancelar</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SesionOff;
