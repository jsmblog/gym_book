import React, { useState } from 'react'
import '../Styles/stylesConfig.css'
import iconChangePhoto from '/cambiar-de-camara.webp'
import provinces from '../Js/provinces'
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import GET_LOCATION from '../Js/SearchLocation';
import { API_KEY_GOOGLE } from '../FirebaseEnv/firebaseEnv';
const API_KEY = API_KEY_GOOGLE

const Config = React.memo(({ currentUserData }) => {
  const rol = currentUserData?.rol || ''

  // Estados para cada dato editable (inicializados con los datos actuales)
  const [province, setProvince] = useState(currentUserData.province || '')
  const [gymName, setGymName] = useState(currentUserData.gymName || '')
  const [address, setAddress] = useState(currentUserData.address || '')
  const [contact, setContact] = useState(currentUserData.numberTelf || '')
  const [password, setPassword] = useState("") // Por seguridad, normalmente no se carga la contraseña actual
  const [seePass, setSeePass] = useState(false)

  // Estados para la funcionalidad del mapa
  const [showMapInput, setShowMapInput] = useState(false)
  const [locationQuery, setLocationQuery] = useState("")
  const [mapLocation, setMapLocation] = useState(null)
  // Referencia a la colección "USERS" con el uid del usuario actual
  const db = getFirestore();
  const userDocRef = doc(db, "USERS", currentUserData.uid);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Podrías agregar una acción global de guardado si lo deseas
  }

  // Función que actualiza un campo en Firestore
  const handleUpdateField = async (field, value) => {
    try {
      await updateDoc(userDocRef, {
        [field]: value
      });
      console.log(`${field} actualizado correctamente!`);
    } catch (error) {
      console.error(`Error actualizando ${field}:`, error);
    }
  };

  // Función para buscar una ubicación mediante la API de Google Maps
  const handleLocationSearch = async () => {
    if (!locationQuery) return;
    try {
      const data = GET_LOCATION(locationQuery)
      if (data.status === "OK" && data.results.length > 0) {
        // Se toma la primera ubicación encontrada (latitud y longitud)
        const location = data.results[0].geometry.location;
        setMapLocation(location);
        // Si lo deseas, puedes actualizar la dirección en Firebase
        await handleUpdateField("province", locationQuery);
        setProvince(locationQuery);
      } else {
        alert("No se encontró la ubicación");
      }
    } catch (error) {
      console.error("Error al buscar la ubicación:", error);
    }
  };

  // Se determina el src del iframe. Si se obtuvo una ubicación de la búsqueda se usa esa,
  // de lo contrario se utiliza la dirección actual del usuario (province)
  let mapSrc = "";
  if (mapLocation && mapLocation.lat && mapLocation.lng) {
    mapSrc = `https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${mapLocation.lat},${mapLocation.lng}`;
  } else if (province) {
    mapSrc = `https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${encodeURIComponent(province)}`;
  } else if (currentUserData?.province) {
    mapSrc = `https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${encodeURIComponent(currentUserData.province)}`;
  }

  return (
    <>
      <section className="configurations-section">
        <div className="personal-data">
          <h2>Configuraciones</h2>
          <p>
            {rol === 'owner'
              ? "Configura los parámetros de la plataforma y los ajustes del gimnasio."
              : "¡ Actualiza tus datos cuando quieras !"}
          </p>
          <div>
            <img id="photo-profile-config" src={currentUserData.imageProfile} alt="" />
            <div className="form-group-imagePerfil">
              <label className="imagePerfil" htmlFor="imagePerfil">
                <img width={20} src={iconChangePhoto} alt="" />
              </label>
              <input style={{ display: 'none' }} type="file" id="imagePerfil" accept="image/*" />
            </div>
          </div>
          <form className="config-form" onSubmit={handleSubmit}>
            <div>
              <div className="form-group">
                <label htmlFor="editProv">Edita tu ubicación</label>
                <select 
                  id="editProv"
                  value={province}
                  onChange={(e) => {
                    setProvince(e.target.value);
                    // Actualiza Firebase al cambiar el valor
                    handleUpdateField("province", e.target.value);
                  }}>
                  <option disabled value="">--seleccione una provincia--</option>
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
              </div>
              {rol === 'owner' && (
                <div className="form-group">
                  <label htmlFor="gimName">Nombre del Gimnasio:</label>
                  <input 
                    type="text" 
                    id="gimName" 
                    value={gymName}
                    onChange={(e) => setGymName(e.target.value)}
                    onBlur={() => handleUpdateField("gymName", gymName)}
                    placeholder="Nombre del gimnasio" />
                </div>
              )}
              <div className="form-group">
                <label htmlFor="gimAddress">Dirección:</label>
                <input
                  type="text"
                  id="gimAddress"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onBlur={() => handleUpdateField("address", address)}
                  placeholder={rol === 'owner' ? "Dirección del gimnasio" : "Añade una dirección..."}
                />
              </div>
            </div>
          </form>
        </div>

        <div className="personal-data">
          <div className="form-group">
            <label htmlFor="gimContact">Contacto:</label>
            <input 
              type="text" 
              id="gimContact" 
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              onBlur={() => handleUpdateField("contact", contact)}
              placeholder={`contacto : ${currentUserData.numberTelf}`} />
          </div>
          <div className="form-group">
            <label id="input-Pass-signin" htmlFor="inputPass">
              Contraseña
              <br />
              <input
                id="inputPass"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleUpdateField("password", password)}
                type={seePass ? 'text' : 'password'}
                name="inputPass"
                maxLength={30}
                required
              />
              <button type="button" className="btn-see" onClick={() => setSeePass(!seePass)}>
                {seePass ? '🔒' : '👁️'}
              </button>
            </label>
          </div>
          <button type="submit" className="back-blue-dark">
              Guardar Configuraciones
            </button>
        </div>

        {/* Sección para actualizar la ubicación en Google Maps */}
        <div className="personal-data">
          {showMapInput ? (
            <div className="personal-data">
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Ingrese una ubicación"
              />
              <button className="back-blue-dark" onClick={handleLocationSearch}>
                Buscar
              </button>
            </div>
          ) : (
            <button className="back-blue-dark" onClick={() => setShowMapInput(true)}>
              Buscar nueva ubicación
            </button>
          )}

          {mapSrc && (
            <div style={{ marginTop: "10px" }}>
              <iframe
                title="Mapa"
                width="100%"
                height="300"
                frameBorder="0"
                style={{ border: 0 }}
                src={mapSrc}
                allowFullScreen
              ></iframe>
            </div>
          )}
        </div>
      </section>
    </>
  )
})

export default Config;
