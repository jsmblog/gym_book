import { getAuth, sendEmailVerification } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../Styles/styleRoomWaiting.css";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../ConfigFirebase/config.js"; 
import useMessage from "../Hooks/useMessage";
import DisplayMessage from "./DisplayMessage";

const RoomWaiting = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState(auth?.currentUser?.emailVerified || false);
  const [isFirestoreUpdated, setIsFirestoreUpdated] = useState(false); 
  const [message, messageError] = useMessage();

  useEffect(() => {
    if (isVerified && isFirestoreUpdated) return; 

    const checkVerification = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      await currentUser.reload(); // Actualiza la info del usuario
      if (currentUser.emailVerified) {
        setIsVerified(true);

        const userId = currentUser.uid;
        const userDocRef = doc(db, "USERS", userId);

        const unsubscribe = onSnapshot(userDocRef, async (docSnap) => {
          if (docSnap.exists()) {
            await updateDoc(userDocRef, { v: true }); 
            setIsFirestoreUpdated(true);

            const role = docSnap.data().rol;
            const homePath = role && role === 'user' ? `/Home/${userId}` :
                                     role === 'admin' ? `/Admin/${userId}` : "/";
            navigate(homePath, { replace: true });

            unsubscribe(); 
          }
        });
      }
    };

    const interval = setInterval(checkVerification, 5000);

    return () => clearInterval(interval); 
  }, [isVerified, isFirestoreUpdated, navigate]);

  const reenviarCorreo = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await sendEmailVerification(currentUser);
        messageError("Correo de verificación reenviado.");
      } else {
        messageError("No hay un usuario autenticado.");
      }
    } catch (error) {
      messageError("Error al reenviar el correo.");
      console.error(error);
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
          <button onClick={() => window.open("https://mail.google.com", "_blank")}>
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