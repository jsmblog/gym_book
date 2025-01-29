import { getAuth, sendEmailVerification } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import '../Styles/styleRoomWaiting.css';
import { doc, getFirestore, updateDoc } from "firebase/firestore";
import useMessage from "../Hooks/useMessage";
import DisplayMessage from "./DisplayMessage";

const RoomWaiting = () => {
  const db = getFirestore();
  const [isVerified, setIsVerified] = useState(false);
  const [message,messageError] = useMessage();
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const checkVerification = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await currentUser.reload();
        setIsVerified(currentUser.emailVerified);
      }
    };

    const interval = setInterval(checkVerification, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleVerificationUpdate = async () => {
      if (isVerified) {
        try {
          const userId = getAuth().currentUser.uid;
          const userDocRef = doc(db, "USERS", userId);
          await updateDoc(userDocRef, { emailVerified: true });
          navigate(`/`, { replace: true });
        } catch (error) {
          console.error("Error al actualizar la verificación en Firestore:", error);
        }
      }
    };

    handleVerificationUpdate();
  }, [isVerified, navigate]);

  const reenviarCorreo = async () => {
    try {
      const currentUser = getAuth().currentUser;
      if (currentUser) {
        await sendEmailVerification(currentUser);
        messageError("Correo de verificación reenviado.");
      } else {
        messageError("No hay un usuario autenticado.");
      }
    } catch (error) {
      messageError("Error al reenviar el correo:");
      console.log(error)
    }
  };

  return (
    <>
    <div className="room-waiting">
      <h1 className="merriweather-bold">¡Confirma tu correo electrónico!</h1>
      <p>
        Te hemos enviado un enlace a tu correo (no recargues la página). 
        Por favor, verifica tu bandeja de entrada y haz clic en el enlace para confirmar tu cuenta.
      </p>
      <div className="btn-container">
        <button id="resend" onClick={reenviarCorreo}>
          Reenviar correo
        </button>
        <button onClick={() => window.open('https://mail.google.com', '_blank')}>
          Abrir correo
        </button>
      </div>
      <div className="loader-spinner"></div>
    </div>
    <DisplayMessage message={message} />
    </>
  );
};

export default RoomWaiting;
