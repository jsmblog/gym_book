import { Link } from 'react-router-dom';
import provinces from '../Js/provinces.js';
import { useEffect, useState } from 'react';
import '../Styles/stylesSignUser.css';
import useMessage from '../Hooks/useMessage.js';
import formatDate from '../Js/formatDate.js';
import verifyFormatEmail from '../Js/verifyFormatEmail.js';
import encrypt from '../Js/encrypt.js';
import DisplayMessage from './DisplayMessage.jsx';
import GymOwnerWizard from './GymOwnerWizard.jsx';

const SignUpBearer = () => {
  const [displayPhoto, setDisplayPhoto] = useState('');
  const [photo, setPhoto] = useState(null);
  const [numberTelf, setNumberTelf] = useState('');
  const [seePass, setSeePass] = useState(false);
  const MESSAGE = '¡ Bienvenido , registrese ahora ! ';
  const [nameUser, setNameUser] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [textRegister, setTextRegister] = useState('');
  const [address, setAddress] = useState('');
  const [nameGym, setNameGym] = useState('');
  const [geoGym, setGeoGym] = useState(''); // aquí se guardará la provincia o estado
  const [message, messageError] = useMessage();
  const [isWizard, setIsWizard] = useState(false);
  const [infoPrincipalGym, setInfoPrincipalGym] = useState({});

  // Estados para la selección de país
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');

  // Obtener países desde la API REST Countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all");
        const data = await response.json();
        const sortedCountries = data.sort((a, b) =>
          a.name.common.localeCompare(b.name.common)
        );
        setCountries(sortedCountries);
      } catch (error) {
        console.error("Error al obtener países:", error);
      }
    };
    fetchCountries();
  }, []);

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
  };

  const saveInfoToFirebase = async () => {
    try {
      // Se requiere que se completen todos los campos, incluyendo país y estado/provincia
      if (!nameUser || !nameGym || !selectedCountry || !geoGym) {
        messageError("Rellena todos los campos 😉​");
        return;
      } else if (!isNaN(nameUser)) {
        messageError('Su nombre no puede ser un número');
        setNameUser('');
        return;
      } else if (isNaN(numberTelf)) {
        messageError('Su contacto debe ser un número');
        setNumberTelf('');
        return;
      } else if (numberTelf.length !== 10) {
        messageError('Su contacto debe contar con 10 dígitos');
        setNumberTelf('');
        return;
      } else if (verifyFormatEmail(email)) {
        messageError("Correo con formato incorrecto.​");
        setEmail("");
        return;
      } else if (password.length < 8) {
        messageError("Ingresa mínimo 8 caracteres.​");
        setPassword('');
        return;
      }

      const createAccount = formatDate(new Date().toISOString());
      const userDoc = {
        address,
        name: nameUser,
        nameGym,
        email,
        imageProfile: photo, 
        createAccount,
        userRole: 'owner',
        password: encrypt(password),
        province:geoGym,
        isOnline: true,
        numberTelf,
        emailVerified: false,
        country:selectedCountry,
      };
      setInfoPrincipalGym(userDoc);
      setIsWizard(true);
    } catch (error) {
      console.error("Error al guardar en Firebase: ", error);
      messageError("Ocurrió un error al registrar la información. Inténtalo de nuevo.");
    }
  };

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= MESSAGE.length) {
        setTextRegister(MESSAGE.substring(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <main className='main'>
        <section className='Form-signIn'>
          <h1 className='txtRegister merriweather-bold'>{textRegister}</h1>
          {displayPhoto ? (
            <img id="img-perfil-login" src={displayPhoto} alt="Foto de perfil" />
          ) : (
            <label id='label-photo' htmlFor="inputSelectImagePerfil">
              +
              <input
                style={{ display: "none" }}
                type="file"
                id="inputSelectImagePerfil"
                accept="image/*"
                onChange={getImage}
              />
            </label>
          )}
          <form className='fade-in' onSubmit={(e) => e.preventDefault()} noValidate>
            <label htmlFor="inputName">
              Nombre
              <br />
              <input
                placeholder='Tu nombre'
                type="text"
                name="inputName"
                id="inputName"
                value={nameUser}
                onChange={(e) => setNameUser(e.target.value)}
                required
              />
            </label>
            <label htmlFor="inputName">
              Nombre del gym
              <br />
              <input
                placeholder='Nombre del gimnasio'
                type="text"
                name="inputName"
                id="inputName"
                value={nameGym}
                onChange={(e) => setNameGym(e.target.value)}
                required
              />
            </label>
            {/* Selección de país */}
            <label>
              Seleccione su país
              <br />
              <select
                onChange={(e) => {
                  setSelectedCountry(e.target.value);
                  setGeoGym("");
                }}
              >
                <option value="">--Seleccione un país--</option>
                {countries.map((country, index) => (
                  <option key={index} value={country.name.common}>
                    {country.name.common}
                  </option>
                ))}
              </select>
            </label>
            {/* Según el país seleccionado, se muestra el selector de provincias o un input */}
            {selectedCountry === "Ecuador" ? (
              <label>
                Provincia de residencia
                <br />
                <select onChange={(e) => setGeoGym(e.target.value)}>
                  <option disabled>--seleccione una provincia--</option>
                  {provinces.map((p, index) => (
                    <optgroup key={index} label={p.provincia}>
                      {p.cantones.sort().map((canton, i) => (
                        <option value={`${p.provincia} ${canton}`} key={i}>
                          {canton}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>
            ) : (
              selectedCountry && (
                <label>
                  Estado/Provincia de residencia
                  <br />
                  <input
                    type="text"
                    placeholder="Ingrese su estado o provincia"
                    value={geoGym}
                    onChange={(e) => setGeoGym(e.target.value)}
                  />
                </label>
              )
            )}
            <label htmlFor="inputName">
              Dirección
              <br />
              <input
                placeholder='La dirección del gimnasio'
                type="text"
                name="inputName"
                id="inputName"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
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
                required
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
                  saveInfoToFirebase();
                }}
              >
                REGISTRARSE
              </button>
            </div>
          </form>
        </section>
        <Link to='/ingreso'>
          <h4 className='registered'>
            Ya tengo una cuenta registrada anteriormente, iniciar sesión.
          </h4>
        </Link>
      </main>
      {isWizard && <GymOwnerWizard infoPrincipalGym={infoPrincipalGym} />}
      <DisplayMessage message={message} />
    </>
  );
};

export default SignUpBearer;
