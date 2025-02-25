import { getAuth, sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Styles/stylesLogin.css';
import useMessage from '../Hooks/useMessage.js'; 
import DisplayMessage from './DisplayMessage.jsx';
import LoaderSuccess from './LoaderSuccess.jsx';

const Login = () => {
  const db = getFirestore();
  const navigate = useNavigate();
  const [txtWelcomeLogin, setTxtWelcomeLogin] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loaderLogin, setLoaderLogin] = useState(false);
  const [seePass, setSeePass] = useState(false);
  
  const MESSAGE = '¡ Bienvenido Inicia Sesión !';
  const auth = getAuth();

  const [message, messageError] = useMessage(); 

  const login = async () => {
    setLoaderLogin(true);
    try {
      if (!password || !email) {
        messageError('Complete todos los campos.');
        setLoaderLogin(false);
        return;
      }
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, 'USERS', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const rol = userData.rol;
        if (rol === 'user' || rol === 'owner' || rol === "instructor") {
          navigate(`/Home/${user.uid}`, { replace: true });
        }  else if (rol === 'admin') {
           navigate(`/Admin/${user.uid}`, { replace: true });
        } else {
          navigate('/*', { replace: true });
          messageError('No se pudo determinar el rol del usuario.');
        }
      } else {
        setLoaderLogin(false);
        messageError('El usuario no se encuentra registrado.');
      }
      setLoaderLogin(false);
    } catch (error) {
      console.error('Error de autenticación:', error);
      setLoaderLogin(false);
      messageError('Error al iniciar sesión, credenciales incorrectas.');
      setEmail('');
      setPassword('');
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      messageError('Por favor, ingrese su correo electrónico para recuperar la contraseña.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      messageError('Se ha enviado un correo de restablecimiento de contraseña. Por favor, revisa tu bandeja de entrada.');
    } catch (error) {
      console.error('Error al enviar el correo de restablecimiento:', error);
      messageError('Hubo un error al intentar enviar el correo. Verifica el correo ingresado.');
    }
  };

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= MESSAGE.length) {
        setTxtWelcomeLogin(MESSAGE.substring(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <main className='main main_login'>
      <section className="Form-signIn form_login">
        <h2 className='txtRegister'>{txtWelcomeLogin}</h2>
        <form id='form-login' onSubmit={(e) => e.preventDefault()} noValidate>
          <label htmlFor="inputEmail">
            Email
            <br />
            <input
              type="email"
              name="inputEmail"
              id="inputEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label id='input-Pass-signin' htmlFor="inputPass">
            Contraseña
            <br />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={seePass ? 'text' : 'password'}
              name="inputPass"
              id="inputPass"
            />
            <button className='btn-see' onClick={() => setSeePass(!seePass)}>
              {seePass ? '🔒' : '👁️'}
            </button>
          </label>
          <div>
            <button
              className='btn-register'
              type="button"
              onClick={(e) => {
                e.preventDefault();
                login();
              }}
            >
              INGRESAR
            </button>
          </div>
          <button
            className='btn-reset-password'
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleResetPassword();
            }}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </form>
      </section>
        <Link to='/registro/usuario' >
        <h4 className='registered'>Ya tengo cuenta, iniciar sesión como usuario.</h4>
        </Link>
        <Link to='/registro/propietario' >
        <h4 className='registered'>Ya tengo cuenta, iniciar sesión como propietario.</h4>
        </Link>
      </main>
      
      <LoaderSuccess loaderMessageSuccess={loaderLogin} text="Bienvenido nuevamente" />
      <DisplayMessage message={message} />
    </>
  );
};

export default Login;
