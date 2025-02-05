import { Link, useNavigate } from 'react-router-dom';
import provinces from '../Js/provinces.js';
import genders from './../Js/genders.js';
import { useEffect, useState } from 'react';
import '../Styles/stylesSignUser.css'
import useMessage from '../Hooks/useMessage.js';
import verifyFormatEmail from '../Js/verifyFormatEmail.js';
import encrypt from '../Js/encrypt.js';
import DisplayMessage from './DisplayMessage.jsx';
import WizardInstructor from './WizardInstructor.jsx';
const CURRENT_YEAR = new Date().getFullYear();

const InstructorSignUp = () => {
  const [displayPhoto, setDisplayPhoto] = useState('');
  const [photo, setPhoto] = useState(null);
  const [dateBirth, setDateBirth] = useState('');
  const [province, setProvince] = useState('');
  const [gender, setGender] = useState('');
  const [numberTelf, setNumberTelf] = useState('')
  const [seePass, setSeePass] = useState(false)
  const MESSAGE = '¡ Bienvenido , registrese ahora ! ';
  const navigate = useNavigate();
  const [nameUser, setNameUser] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [textRegister, setTextRegister] = useState('');
  const [message, messageError] = useMessage();
  const [isWizard, setIsWizard] = useState(false);
  const [instructorData, setInstructorData] = useState([]);

  const getImage = async (e) => {
    const file = e.target.files[0];
    const sizeFile = 5 * 1024 * 1024;
    if (file) {
      if (!file.type.startsWith("image/")) {
        messageError("Solo se permiten archivos de imagen."); 
        return;
      }
      if (file.size > sizeFile) {
        messageError("El tamaño del archivo excede los 5 MB permitidos.");
        return;
      }
    }
    const mediaUrl = URL.createObjectURL(file);
    setDisplayPhoto(mediaUrl);
    setPhoto(file);
  }
  const saveInfoToFirebase = async () => {
    
    try {
      if (!nameUser || !numberTelf || !password || !email || displayPhoto === null || !gender || !dateBirth || !province) {
        messageError("Rellena todos los campos 😉​");
        
        return;
      } 
      if (!isNaN(nameUser)) {
        messageError("El nombre no puede ser un número");
        
        setNameUser("");
        return;
      } 
      if (isNaN(numberTelf) || numberTelf.length !== 10) {
        messageError("El contacto debe ser un número de 10 dígitos");
        
        setNumberTelf("");
        return;
      }
      if (verifyFormatEmail(email)) {
        messageError("Correo con formato incorrecto.");
        setEmail("");
        
        return;
      } 
      if (password.length < 8) {
        messageError("Ingresa mínimo 8 caracteres.");
        
        setPassword("");
        return;
      }
      if (CURRENT_YEAR - dateBirth.slice(0, 4) < 18) {
        messageError("Debes ser mayor de edad para registrarte.");
        
        setDateBirth("");
        return;
      }
  
      const createdAt = new Date().toISOString();
      const userDoc = {
        n: encrypt(nameUser), // name -> n
        e: encrypt(email), // email -> e
        img: photo, // imageProfile -> img
        c_a: createdAt, // createAccount -> c_a
        rol: "instructor", // userRole -> rol
        birth: encrypt(dateBirth), // dateBirth -> birth
        pro: encrypt(province), // province -> prov
        g: encrypt(gender), // gender -> g
        on: true, // isOnline -> on
        tel: encrypt(numberTelf), // numberTelf -> tel
        v: false, // emailVerified -> v
        posts: [] 
      };
      setInstructorData(userDoc);
      setIsWizard(true)
      
    } catch (error) {
      console.error("Error al guardar en Firebase: ", error);
      messageError("Ocurrió un error al registrar la información. Inténtalo de nuevo.");
      
    }
  };
  
  useEffect(() => {
    let index = 0 ;
    const interval = setInterval(() => {
      if(index <= MESSAGE.length){
        setTextRegister(MESSAGE.substring(0,index));
        index++;
      }else{
        clearInterval(interval)
      }
    }, 100);
    return () => clearInterval(interval);
  }, [])
  return (
    <>
    <main className='main'>
    <section className='Form-signIn'>
        <h1 className='txtRegister merriweather-bold'>{textRegister}</h1>
        {
          displayPhoto ? <img id="img-perfil-login" src={displayPhoto} alt="" /> :
            <label id='label-photo' htmlFor="inputSelectImagePerfil">
              +
              <input
                style={{ display: "none" }}
                type="file"
                id="inputSelectImagePerfil"
                accept="image/*"
                onChange={(e) => getImage(e)}
              />
            </label>
        }
        <form className='fade-in' onSubmit={(e) => e.preventDefault()} noValidate>
          <label htmlFor="inputName">
            Nombre
            <br />
            <input
              placeholder='ejm : Pedro'
              type="text"
              name="inputName"
              id="inputName"
              value={nameUser}
              maxLength={20}
              onChange={(e) => setNameUser(e.target.value)}
              required
            />
          </label>
          <label htmlFor="inputPhone">
            Número de contacto
            <br />
            <input
              placeholder='ejm : 0987654321'
              type="text"
              name="inputPhone"
              id="inputPhone"
              maxLength={10}
              value={numberTelf}
              onChange={(e) => setNumberTelf(e.target.value)}
            />
          </label>
          <label htmlFor="inputEmail">
            Email
            <br />
            <input
              placeholder='mi_email@email.com'
              type="email"
              name="inputEmail"
              id="inputEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label id='input-Pass-signin' htmlFor="inputPass">
            Contraseña
            <br />
            <input
              placeholder='********'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={seePass ? 'text' : 'password'}
              name="inputPass"
              id="inputPass"
              maxLength={30}
              required
            />
            <button className='btn-see' onClick={() => setSeePass(!seePass)}>
              {seePass ? '🔒' : '👁️'}
            </button>
          </label>
          <label htmlFor="">
            Seleccione su género
            <br />
            <select onChange={(e)=> setGender(e.target.value)} >
              <option disabled>--seleccione su genéro--</option>
              {
                genders.map((gender,index)=>( 
                  <option key={index} value={gender} >{gender}</option>
                ))
              }
            </select>
          </label>
          <label htmlFor="inputDateBirth">
            Fecha de nacimiento
            <br />
            <input
              value={dateBirth}
              onChange={(e) => setDateBirth(e.target.value)}
              type="date"
              name="inputDateBirth"
              id="inputDateBirth"
              required
            />
          </label>
          <label htmlFor="">
           Provincia de residencia
            <br />
            <select onChange={(e) => setProvince(e.target.value)} >
              <option disabled >--seleccione una provincia--</option>
              {
                provinces.map((p,index)=>( 
                  <optgroup key={index} label={p.provincia}>
                    {
                      p.cantones.sort().map((canton ,i)=>( 
                        <option value={`${p.provincia} ${canton}`} key={i}>{canton}</option>
                      ))
                    }
                  </optgroup>
                ))
              }
            </select>
          </label>
          <div>
            <button className='btn-register' type="button" onClick={(e) => {
              e.preventDefault()
              saveInfoToFirebase()
            }}>
              REGISTRARSE
            </button>
          </div>
        </form>
      </section>
        <Link to='/ingreso' >
        <h4 className='registered'>Ya tengo una cuenta registrada anteriormente , iniciar sesión .</h4>
        </Link>
    </main>
    <DisplayMessage message={message}/>
    {
      isWizard && <WizardInstructor instructorData={instructorData} />
    }
    </>
  )
}

export default InstructorSignUp;
