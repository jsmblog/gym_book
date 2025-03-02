import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../Styles/stylesPerfil.css';
import decrypt from './../Js/decrypt';
import iconThreePoint from '/tres-puntos.webp';
import useMessage from './../Hooks/useMessage';
import DisplayMessage from './DisplayMessage';
import is_am_or_pm from './../Js/pm_am';
import { arrayRemove, arrayUnion, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../ConfigFirebase/config';

const Perfil = React.memo(({ currentUserData }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpenCardFollowers, setIsOpenCardFollowers] = useState(false);
  // Se obtiene la info del usuario a través de location o currentUserData
  const user = location.state || currentUserData || {};

  // Desestructuramos propiedades relevantes del usuario
  const {
    uid: userId,
    name,
    imageProfile,
    province,
    address,
    gymData = {},
    posts = [],
    rol,
    gender,
    email,
    name_gym,
    isOnline,
    instr = {}
  } = user;

  // Desestructuramos la información del usuario actual
  const {
    uid: currentUserUid,
    name: currentUserName,
    imageProfile: currentUserImage
  } = currentUserData || {};

  const [message, messageError] = useMessage();
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [formData, setFormData] = useState({
    name: name || '',
    province: province || '',
    address: address || '',
    maxCapacity: gymData.m_m || ''
  });

  const [followers, setFollowers] = useState(user.f || []);

  useEffect(() => {
    if (!userId) return;
    const userRef = doc(db, "USERS", userId);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const updatedUser = snapshot.data();
        if (updatedUser.f) {
          setFollowers(updatedUser.f);
        }
      }
    });
    return () => unsubscribe();
  }, [userId]);

  if (!userId) {
    return (
      <div className="perfil-container-empty">
        <h2>¡¡ Usuario no encontrado 🚫 !!</h2>
      </div>
    );
  }

  const backHome = () => navigate(-1, { replace: true });
  const toggleEditMenu = () => setShowEditMenu((prev) => !prev);

  const handleInputChange = ({ target: { name, value } }) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = () => {
    console.log("Datos guardados:", formData);
    setShowEditMenu(false);
    // Lógica para actualizar en Firestore
  };

  // Procesamos las publicaciones multimedia, descifrando la descripción de cada post
  const mediaPosts = posts.flatMap((post) =>
    post.m?.map((media) => ({
      ...media,
      des: decrypt(post.d),
      postId: post.post_id
    })) || []
  );

  const handleDeleteMedia = async (mediaItem) => {
    try {
      const docRef = doc(db, "USERS", currentUserUid);
      const targetPost = posts.find((p) => p.post_id === mediaItem.postId);
      if (targetPost) {
        await updateDoc(docRef, { posts: arrayRemove(targetPost) });
        messageError("Publicación eliminada");
      }
    } catch (error) {
      console.error(error.message);
      messageError("¡ Sucedió un error !");
    }
  };

  const handleFollow = async (userId) => {
    try {
      if (userId === currentUserUid) {
        return messageError("No puedes seguirte a ti mismo");
      }
  
      const isFollowing = followers.some(follower => follower.i === currentUserUid);
      const docRef = doc(db, "USERS", userId);
      const followerData = {
        i: currentUserUid,
        n: currentUserName,
        p: currentUserImage
      };
  
      if (isFollowing) {
        await updateDoc(docRef, { f: arrayRemove(followerData) });
        return messageError("Has dejado de seguir a este usuario");
      } else {
        await updateDoc(docRef, { f: arrayUnion(followerData) });
        return messageError("Has seguido a este usuario");
      }
    } catch (error) {
      console.error("Error al seguir usuario:", error);
      messageError("Ocurrió un error al seguir al usuario");
    }
  };

  // Datos específicos para usuario 'owner'
  const { h: gymHours = [], g_t, m_m } = gymData;

  // Datos específicos para usuario 'instructor'
  const { p_i = {}, avb = {} } = instr;
  const { s: specialties = [], exp, p_m: paymentMethods = [] } = p_i;
  const { schedules: instructorSchedules = [], m: modality = [] } = avb;

  return (
    <>
      <div className="perfil-container">
        <button id="back-to-home" onClick={backHome}>
          ←
        </button>
        <div className="perfil-header">
          {currentUserUid === userId && (
            <div className="edit-container">
              {/* Botón de edición descomentable si se requiere */}
              {/* <button className="edit-button" onClick={toggleEditMenu}>
                <img width={18} src={iconThreePoint} alt="Editar" />
              </button> */}
              {showEditMenu && (
                <div className="edit-menu fade-in">
                  <label>Nombre:</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} />
                  <label>Provincia:</label>
                  <input type="text" name="province" value={formData.province} onChange={handleInputChange} />
                  {rol === 'owner' && (
                    <>
                      <label>Dirección:</label>
                      <input type="text" name="address" value={formData.address} onChange={handleInputChange} />
                    </>
                  )}
                  {rol === 'owner' && (
                    <>
                      <label>Aforo Máximo:</label>
                      <input
                        type="number"
                        min="0"
                        name="maxCapacity"
                        value={formData.maxCapacity}
                        onChange={handleInputChange}
                      />
                    </>
                  )}
                  <button className="back-blue-dark save-button" onClick={handleSaveChanges}>
                    Guardar
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="photo-perfil">
            <img src={imageProfile} alt={`Perfil de ${name}`} className="perfil-avatar" />
            <div className="isOnline" style={{ backgroundColor: isOnline ? 'greenyellow' : 'gray' }}></div>
            <h6>({isOnline ? 'Activo' : 'No Disponible'})</h6>
          </div>

          <div className="perfil-info">
            <div className="perfil-name">
              <h2 id="nameUser-perfil">
                {rol === 'instructor' ? 'Instr :' : ''} {rol === 'owner' && name_gym ? name_gym : name}
              </h2>
              <p>
                <strong>{rol === 'owner' ? 'Ubicación' : 'Vive en'}: </strong>
                {province}
              </p>
              {gender && <p><strong>Sexo: </strong> {gender}</p>}
              {rol === 'owner' && <p><strong>Dirección: </strong> {address}</p>}
              {(rol === 'owner' || rol === 'instructor') && <p><strong>Contacto: </strong> {email}</p>}
              {rol === 'owner' && (
                <>
                  <p><strong>Tipo: </strong> {g_t}</p>
                  <p><strong>Aforo máximo: </strong> {m_m}</p>
                </>
              )}
              {rol === 'instructor' && (
                <>
                  <p><strong>Especialidad: </strong> {specialties.join(' , ')}</p>
                  <p><strong>Experiencia: </strong> {exp} años</p>
                </>
              )}
            </div>

            {rol === 'instructor' && (
              <div>
                <table className="table-table-striped">
                  <thead>
                    <tr>
                      <th className="libre-Baskerville">Días</th>
                      <th className="libre-Baskerville">Hora</th>
                      <th className="libre-Baskerville">Modalidad</th>
                      <th className="libre-Baskerville">Métodos de pago</th>
                    </tr>
                  </thead>
                  <tbody>
                    {instructorSchedules.map((sch, index) => (
                      <tr key={index}>
                        <td>{Array.isArray(sch.d) ? sch.d.join(', ') : ''}</td>
                        <td>
                          {sch.schedules?.length > 0 &&
                            sch.schedules.map((h) =>
                              `${h.on} ${is_am_or_pm(h.on)} - ${h.off} ${is_am_or_pm(h.off)}`
                            )}
                        </td>
                        <td>{modality.join(', ')}</td>
                        <td>{paymentMethods.join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {rol === 'owner' && (
              <div>
                <table className="table-table-striped">
                  <thead>
                    <tr>
                      <th className="libre-Baskerville">Días</th>
                      <th className="libre-Baskerville">Horarios</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gymHours.map((hour, index) => (
                      <tr key={index}>
                        <td>{Array.isArray(hour.d) ? hour.d.join(', ') : ''}</td>
                        <td className="td-hours">
                          {Array.isArray(hour.schedules) &&
                            hour.schedules.map((shed) =>
                              `| ${shed.on} ${is_am_or_pm(shed.on)} - ${shed.off} ${is_am_or_pm(shed.off)} | `
                            )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="cont-followers">
            <button onClick={()=> setIsOpenCardFollowers(true)}>
              {followers.length} {followers.length === 1 ? 'Seguidor' : 'Seguidores'}
            </button>
            <button onClick={()=>handleFollow(userId)} className="back-blue-dark">
              {followers.some((follower) => follower.i === currentUserUid)
                ? 'Dejar de seguir'
                : 'Seguir'}
            </button>
          </div>
        </div>

        <div className="perfil-posts">
          {mediaPosts.length > 0 ? (
            mediaPosts.map((media, index) => (
              <div key={index} className="post-item">
                {media.t === "image" ? (
                  <img src={media.f} alt="Imagen de publicación" className="media-item" />
                ) : (
                  <video controls className="media-item">
                    <source src={media.f} type="video/mp4" />
                    Tu navegador no soporta la reproducción de videos.
                  </video>
                )}
                {media.des && (
                  <div className="media-description">
                    <p>{media.des}</p>
                  </div>
                )}
                {currentUserUid === userId && (
                  <button className="delete-button" onClick={() => handleDeleteMedia(media)}>
                    🗑️
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="no-posts">No hay contenido multimedia...</p>
          )}
        </div>
      </div>
      {
        isOpenCardFollowers && (
          <section className='modal-overlay'>
           <div className='card-followers fade-in-left' >
            {
              followers?.length > 0 ? (
                followers.map(({i,n,p}) => (
                  <div key={i} className='user-foolower' >
                    <img src={p} alt="" />
                    <h3>{n}</h3>
                    <button onClick={()=> handleFollow(i)} className='back-blue-dark'>
                      Seguir
                    </button>
                  </div>
                ))
              ) : <h5>Sin seguidores...</h5>
            }
            <button onClick={()=>setIsOpenCardFollowers(false)} className='close-card-followers' >
              X
            </button>
           </div>
          </section>
        )
      }
      <DisplayMessage message={message} />
    </>
  );
});

export default Perfil;
