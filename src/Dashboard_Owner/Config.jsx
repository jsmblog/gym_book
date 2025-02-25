import React, { useState } from 'react'
import '../Styles/stylesConfig.css'
import iconChangePhoto from '/cambiar-de-camara.webp'
import provinces from '../Js/provinces'
import { arrayUnion, doc, setDoc, updateDoc } from "firebase/firestore";
import { AUTH_USER, db, STORAGE } from '../ConfigFirebase/config.js'
import GET_LOCATION from '../Js/SearchLocation';
import { API_KEY_GOOGLE } from '../FirebaseEnv/firebaseEnv.js';
import useMessage from './../Hooks/useMessage';
import convertToWebP from '../Js/convertToWebp.js';
import DisplayMessage from '../Components/DisplayMessage.jsx';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import uuid from './../Js/uuid';
import gymRoles from './Js/rolePersonal.js';
import iconPersonal from '/personal.webp';
import iconSucursal from '/sucursales.webp';
import encrypt from './../Js/encrypt';
import { updatePassword } from 'firebase/auth';
const API_KEY = API_KEY_GOOGLE

const Config = React.memo(({ currentUserData }) => {
  const rol = currentUserData?.rol || ''
  console.log(currentUserData)
  const [province, setProvince] = useState(currentUserData.province || '')
  const [gymName, setGymName] = useState(currentUserData.name_gym || '')
  const [address, setAddress] = useState(currentUserData.address || '')
  const [contact, setContact] = useState(currentUserData.numberTelf || '')
  const [password, setPassword] = useState("")
  const [seePass, setSeePass] = useState(false)
  const [message, messageError] = useMessage();
  const [mapLocation, setMapLocation] = useState(null)
  const userDocRef = doc(db, "USERS", currentUserData.uid);
  const [isHasSearch, setIsHasSearch] = useState(false);
  const [branches, setBranches] = useState(currentUserData.gymData.branches || []);
  const [photo, setPhoto] = useState(null);
  const [isOnBoxSucursal, setIsOnBoxSucursal] = useState(false)
  const [newBranch, setNewBranch] = useState({
    name: '',
    address: '',
    lat: null,
    lng: null
  });
  const [isAddBranch, setIsAddBranch] = useState(false);
    const [isAddedPersonel, setIsAddedPersonel] = useState(false);
  const [isOnBoxPersonnel, setIsOnBoxPersonnel] = useState(false)

  const [editingGymName, setEditingGymName] = useState(false)
  const [editingAddress, setEditingAddress] = useState(false)
  const [editingContact, setEditingContact] = useState(false)
  const [editingPassword, setEditingPassword] = useState(false)

  const handleAddBranch = async () => {
    if (!newBranch.name || !newBranch.address) {
      messageError("Por favor, completa el nombre y la dirección de la sucursal.");
      return;
    }
    setIsAddBranch(true);
    try {
      const data = await GET_LOCATION(newBranch.address);
      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        
        const branchToSave = {
          id: uuid(5), 
          name: newBranch.name,
          address: newBranch.address,
          lat: location.lat,
          lng: location.lng
        };
        
        const updatedBranches = [...branches, branchToSave];
        setBranches(updatedBranches);
  
        await updateDoc(userDocRef, { "gymData.branches": arrayUnion(...updatedBranches) });
        
        setNewBranch({ name: '', address: '', lat: null, lng: null });
        messageError("Sucursal añadida correctamente");
        setIsAddBranch(false);
      } else {
        messageError("No se encontró la ubicación");
      }
    } catch (error) {
      console.log(error);
      messageError("Ocurrió un error al añadir la sucursal");
      setIsAddBranch(false);
    }
  };

  const handleRemoveBranch = async (branchId) => {
    try {
      const gymData = currentUserData.gymData || {}; 
      const branches = gymData.branches || []; 
  
      const updatedBranches = branches.filter(branch => branch.id !== branchId);
      setBranches(updatedBranches);
      await updateDoc(userDocRef, {
        "gymData.branches": updatedBranches, 
      });
      messageError("Sucursal eliminada correctamente");
    } catch (error) {
      console.error("Error al eliminar la sucursal:", error);
      messageError("Ocurrió un error al eliminar la sucursal");
    }
  };

  const handleSearchBranchLocation = async () => {
    if (!newBranch.address) return;
    const data = await GET_LOCATION(newBranch.address);
    setIsHasSearch(true);
    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      setNewBranch({ ...newBranch, location: `https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${location.lat},${location.lng}` });
    } else {
      messageError('No se encontró la ubicación');
    }
  };

  // Estado para personal
  const [personnel, setPersonnel] = useState(currentUserData.gymData.per || []);
  const [newPerson, setNewPerson] = useState({ n: '', r: 'Gerente', i: '' });

  const handleAddPerson = async () => {
    setIsAddedPersonel(true);
    try {
      if (!newPerson.n || !newPerson.r || !newPerson.i) {
        messageError("Debes completar todos los campos para añadir una persona");
        setIsAddedPersonel(false);
        return;
      }
  
      const webpImage = await convertToWebP(newPerson.i);
      
      const storageRef = ref(STORAGE, `profileImages/${currentUserData.uid}/image_${uuid(10)}.webp`);
      
      await uploadBytes(storageRef, webpImage);
      const imageUrl = await getDownloadURL(storageRef);
      
      const personWithImage = { ...newPerson, i: imageUrl }; 
      setPersonnel([...personnel, personWithImage]);
      await updateDoc(userDocRef, { "gymData.per": arrayUnion(personWithImage) }, { merge: true });
      messageError("Personal añadido correctamente");
      setNewPerson({ n: '', r: 'Gerente', i: '' });
      setIsAddedPersonel(false);
    } catch (error) {
      console.log(error);
      messageError("Ocurrió un error al añadir el personal");
      setIsAddedPersonel(false);
    }
  };
  
  const handleRemovePerson = async (index) => {
    try {
      const dataGym = currentUserData.gymData || {};
      const updatedPersonnel = dataGym.per.filter((_, i) => i !== index);
    setPersonnel(updatedPersonnel);
    await updateDoc(userDocRef, {
      "gymData.per": updatedPersonnel, 
    });    messageError("Eliminado correctamente");
    } catch (error) {
      console.log(error.message)
    }
  };
  
  const handleChangePhotoPerfil = async (file) => {
    try {
      if (file) {
        const confirmation = window.confirm('¿Estás seguro de cambiar la foto de perfil?');
        if (!confirmation) return;
        const webpImage = await convertToWebP(file);
        const storageRef = ref(STORAGE, `profileImages/${currentUserData.uid}/image.webp`);
        await uploadBytes(storageRef, webpImage);
        const imageUrl = await getDownloadURL(storageRef);
        await updateDoc(userDocRef, { img: encrypt(imageUrl) });
        messageError("Foto de perfil actualizada correctamente");
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  
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
    setPhoto(file);
    handleChangePhotoPerfil(file);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
  }
  const handleUpdateField = async (field, value) => {
    try {
      if (value.length === 0) return; 
      if (field === 'password') {
        const changePassword = window.confirm('¿Estás seguro de cambiar la contraseña?');
        if (!changePassword) return;
  
        if (value.length < 8) {
          messageError('La contraseña debe tener al menos 8 caracteres');
          return;
        }
  
        await updatePassword(AUTH_USER.currentUser, value);
        messageError('Contraseña actualizada correctamente');
        return;
      }
  
      if (currentUserData[field] === value) {
        messageError('No hay cambios para actualizar');
        return;
      }
  
      if (field !== '') {
        await updateDoc(userDocRef, {
          [field]: encrypt(value)
        });
        messageError(`actualizado correctamente!`);
      }
    } catch (error) {
      console.error(`Error actualizando ${field}:`, error);
  
      if (error.code === 'auth/requires-recent-login') {
        messageError('Por seguridad, debes iniciar sesión nuevamente para cambiar la contraseña.');
      } else {
        messageError(`Error actualizando ${field}`);
      }
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
          <div>
            <img id="photo-profile-config" src={currentUserData.imageProfile} alt={`Foto de perfil de ${currentUserData.name}`} />
            <div className="form-group-imagePerfil">
              <label className="imagePerfil" htmlFor="imagePerfil">
                <img width={20} src={iconChangePhoto} alt="" />
              </label>
              <input style={{ display: 'none' }} type="file" onChange={(e) => getImage(e)}  id="imagePerfil" accept="image/*" />
            </div>
          </div>
          <form className="config-form" onSubmit={handleSubmit}>
          <div>
            {rol === 'owner' && (
              <div className="form-group">
                <label htmlFor="gimName">Nombre del Gimnasio:</label>
                <div className="input-with-icon">
                  <input
                    type="text"
                    id="gimName"
                    value={gymName}
                    onChange={(e) => setGymName(e.target.value)}
                    onBlur={() => {
                      handleUpdateField("n_g", gymName)
                      setEditingGymName(false)
                    }}
                    placeholder="Nombre del gimnasio"
                    disabled={!editingGymName}
                  />
                  {!editingGymName && (
                    <button type="button" onClick={() => setEditingGymName(true)}>
                      ✏️
                    </button>
                  )}
                </div>
              </div>
            )}
            <div className="form-group">
              <label htmlFor="gimAddress">Dirección:</label>
              <div className="input-with-icon">
                <input
                  type="text"
                  id="gimAddress"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onBlur={() => {
                    handleUpdateField("dir", address)
                    setEditingAddress(false)
                  }}
                  placeholder={rol === 'owner' ? "Dirección del gimnasio" : "Añade una dirección..."}
                  disabled={!editingAddress}
                />
                {!editingAddress && (
                  <button type="button" onClick={() => setEditingAddress(true)}>
                    ✏️
                  </button>
                )}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="gimContact">Contacto:</label>
              <div className="input-with-icon">
                <input
                  type="text"
                  id="gimContact"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  onBlur={() => {
                    handleUpdateField("tel", contact)
                    setEditingContact(false)
                  }}
                  placeholder={`contacto : ${currentUserData.numberTelf}`}
                  disabled={!editingContact}
                />
                {!editingContact && (
                  <button type="button" onClick={() => setEditingContact(true)}>
                    ✏️
                  </button>
                )}
              </div>
            </div>
            <div className="form-group">
              <label id="input-Pass-signin" htmlFor="inputPass">
                Contraseña
                <br />
                <div className="input-with-icon">
                  <input
                    id="inputPass"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => {
                      handleUpdateField("password", password)
                      setEditingPassword(false)
                    }}
                    type={seePass ? 'text' : 'password'}
                    name="inputPass"
                    maxLength={30}
                    required
                    disabled={!editingPassword}
                  />
                  <button type="button" className="btn-see-config" onClick={() => setSeePass(!seePass)}>
                    {seePass ? '🔒' : '👁️'}
                  </button>
                  {!editingPassword && (
                    <button type="button" onClick={() => setEditingPassword(true)}>
                      ✏️
                    </button>
                  )}
                </div>
              </label>
            </div>
          </div>
        </form>
        </div>

        <div className="personal-data">
          <div className="form-group">
            <label htmlFor="editProv">Edita tu ubicación</label>
            <select
              id="editProv"
              value={province}
              onChange={(e) => {
                setProvince(e.target.value);
                handleUpdateField("pro", e.target.value);
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
          <div >
            {mapSrc && (
              <div style={{ marginTop: "10px" }}>
                <iframe
                  title="Mapa"
                  width="100%"
                  height="280"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={mapSrc}
                  allowFullScreen
                ></iframe>
              </div>
            )}
          </div>
        </div>
        <div className='personal-data'>
          <div className="gestion-sucrusal">
          <h2>Gestión de Sucursales</h2>
          <div className='search-address'>
            <input
              type='text'
              placeholder='Busca una dirección aquí'
              required
              value={newBranch.address}
              onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
            />
            <button className='' onClick={handleSearchBranchLocation}>🔍</button>
          </div>
          </div>
          {!isHasSearch && <h5>¡ Aquí aparecerá la ubicación de la sucursal !</h5>}
          <input
            type='text'
            placeholder='Nombre de la Sucursal'
            value={newBranch.name}
            required
            onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
          />
          {newBranch.location && (
            <iframe src={newBranch.location} width='300' height='200' allowFullScreen></iframe>
          )}
          {
            currentUserData.paid.i_p ? <button className='back-blue-dark' onClick={handleAddBranch}>{isAddBranch ? 'Añadiendo...' : 'Añadir Sucursal'}</button> : <button className='back-blue-dark'>Suscríbete a un plan</button>
          }
          {
            isOnBoxSucursal && <div id='personnel'>
            {branches.length > 0 ? branches.map((branch) => (
              <div className='card_personnel' key={branch.id}>
                <h4>{branch.name} - {branch.address}</h4>
                <button onClick={() => handleRemoveBranch(branch.id)}>❌</button>
              </div>
            )) : <h3>No haz añadido ninguna sucursal</h3>}
          </div>
          }
          <button onClick={() => setIsOnBoxSucursal(!isOnBoxSucursal)} id='personnel-btn'>
            {!isOnBoxSucursal ? <img width={20} src={iconSucursal} alt="" /> : '❌'}
          </button>

        </div>
        <div className='personal-data'>
          <h2>Gestión de Personal</h2>
          {newPerson.i ? (
            <img
              src={URL.createObjectURL(newPerson.i)}
              alt='Vista previa'
              width='100'
              height='100'
            />
          ) :
          <label id='label-card' htmlFor="image-personal">
            +
            <input
              type='file'
              id='image-personal'
              accept='image/*'
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setNewPerson({ ...newPerson, i: file });
                }
              }}
            />
          </label>
 
        }  
          <input
            type='text'
            placeholder='Nombre'
            required
            value={newPerson.name}
            onChange={(e) => setNewPerson({ ...newPerson, n: e.target.value })}
          />
          <label>
            Selecciona un rol <br />
            <select onChange={(e) => setNewPerson({ ...newPerson, r: e.target.value })}>
              <option disabled>--Selecciona un rol--</option>
              {
                gymRoles.map((role, index) => (
                  <option key={index} value={role}>{role}</option>
                ))
              }
            </select>
          </label>
{
 currentUserData.paid.i_p ? <button className='back-blue-dark' onClick={handleAddPerson}>{isAddedPersonel ? 'Añadiendo...' : 'Añadir Personal'}</button> : <button className='back-blue-dark'>Suscríbete a un plan</button>
}
          {
            isOnBoxPersonnel && <div id='personnel'>
            {personnel.length > 0 ? personnel.map((person, index) => (
              <div className='card_personnel' key={index}>
                {person.i && <img src={person.i} alt={person.n} />}
                <h4>{person.n} -</h4>
                <h4>{person.r}</h4>
                <button onClick={() => handleRemovePerson(index)}>❌</button>
              </div>
            )) : <h3>No hay personal añadido</h3>}
          </div>
          }
          <button onClick={() => setIsOnBoxPersonnel(!isOnBoxPersonnel)} id='personnel-btn'>
            {!isOnBoxPersonnel ? <img width={20} src={iconPersonal} alt="" /> : '❌'}
          </button>
        </div>
      </section>
      <DisplayMessage message={message} />
    </>
  )
})

export default Config;
