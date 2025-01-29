import React, { useState } from 'react'
import { signOut } from 'firebase/auth';
import {useNavigate} from 'react-router-dom'
import '../STYLES/styleSesionOff.css'
import {AUTH_USER} from '../ConfigFirebase/config.js'
import iconTurn_on  from '/turn-on.png';
const SesionOff = () => {
    const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut(AUTH_USER);
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error) {
      console.error("Error al cerrar sesión: ");
      setSigningOut(false);
    }
  };
  return (
    <>
  <button title='cerrar sesión' id='btn-signout' onClick={handleSignOut}>
    {
      signingOut ? 'cerrando sesión...' : <img src={iconTurn_on} width={20} alt='cerrar-sesión' />
    }
  </button>
    </>
  )
}

export default SesionOff