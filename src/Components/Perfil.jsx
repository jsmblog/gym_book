import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../Styles/stylesPerfil.css';
import decrypt from './../Js/decrypt';
import iconThreePoint from '/tres-puntos.webp'
import useMessage from './../Hooks/useMessage';
import DisplayMessage from './DisplayMessage';
import is_am_or_pm from './../Js/pm_am';
import { arrayRemove, doc, updateDoc } from 'firebase/firestore';
import { db } from '../ConfigFirebase/config';

const Perfil = React.memo(({ currentUserData }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const user = location.state || currentUserData || {};
    const uid = currentUserData?.uid || null;
    const [message, messageError] = useMessage();
    const [showEditMenu, setShowEditMenu] = useState(false);
    const [formData, setFormData] = useState({
        name: user.name || '',
        province: user.province || '',
        address: user.address || '',
        maxCapacity: user.gymData?.m_m || ''
    });

    if (!user) {
        return <div className="perfil-container-empty"><h2>¡¡ Usuario no encontrado 🚫 !!</h2></div>;
    }

    const backHome = () => {
        navigate(-1, { replace: true });
    };

    const toggleEditMenu = () => {
        setShowEditMenu(!showEditMenu);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveChanges = () => {
        console.log("Datos guardados:", formData);
        setShowEditMenu(false);
        // Aquí agregarías la lógica para actualizar en Firestore
    };

    const mediaPosts = user.posts?.flatMap(post => post.m?.map(media => ({ ...media, des: decrypt(post.d), postId: post.post_id })) || []) || [];

    const handleDeleteMedia = async (post) => {
        try {
         const docRef = doc(db,"USERS",currentUserData?.uid);
         const targetPost = user.posts?.find(p => p.post_id === post.postId);
         await updateDoc(docRef,{
         posts:arrayRemove(targetPost)
         })
         messageError("Publicación eliminada");
        } catch (error) {
         console.log(error.message);
         messageError("¡ Sucedió un error !")
        }
     };
    return (
        <>
            <div className="perfil-container">
                <button id='back-to-home' onClick={backHome}>←</button>
                <div className="perfil-header">
                    {uid === user.uid && (
                        <div className="edit-container">
                            <button className="edit-button" onClick={toggleEditMenu}>
                                <img width={18} src={iconThreePoint} alt="" />
                            </button>
                            {showEditMenu && (
                                <div className="edit-menu fade-in">
                                    <label>Nombre:</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} />
                                    <label>Provincia:</label>
                                    <input type="text" name="province" value={formData.province} onChange={handleInputChange} />
                                    {user.rol === 'owner' && <><label>Dirección:</label>
                                        <input type="text" name="address" value={formData.address} onChange={handleInputChange} /></>}
                                    {
                                        user.role === 'owner' && <><label>Aforo Máximo:</label>
                                            <input type="number" min="0" name="maxCapacity" value={formData.maxCapacity} onChange={handleInputChange} /></>
                                    }
                                    <button className="back-blue-dark save-button" onClick={handleSaveChanges}>Guardar</button>
                                </div>
                            )}
                        </div>
                    )}
                    <div className='photo-perfil'>
                        <img src={user.imageProfile} alt="Perfil" className="perfil-avatar" />
                        <div className='isOnline' style={{ backgroundColor: user.isOnline ? 'greenyellow' : 'gray' }}></div>
                        <h6>({user.isOnline ? 'Activo' : 'No Disponible'})</h6>
                    </div>
                    <div className="perfil-info">
                        <div className="perfil-name">
                            <h2 id='nameUser-perfil'>{user.rol === 'instructor' ? 'Instr :' : ''} {user.rol === 'owner' && user.name_gym ? `${user.name_gym}` : user.name}</h2>
                            <p><strong>{user.rol === 'owner' ? 'Ubicación' : 'Vive en'}: </strong> {user.province}</p>
                            {user.gender && <p><strong>Sexo: </strong> {user.gender}</p>}
                            {user.rol === 'owner' && <p>{`Dirección : ${user.address}`}</p>}
                            {user.rol === 'owner' || user.rol === 'instructor' && <p>{`Contacto : ${user.email}`}</p>}
                            {user.rol === 'owner' && <p>{`Tipo : ${user.gymData.g_t}`}</p>}
                            {user.rol === 'owner' && <p>{`Aforo máximo : ${user.gymData.m_m}`}</p>}
                            {user.rol === 'instructor' && <p>{`Especialidad : ${user.instr.p_i.s.join(' , ')}`}</p>}
                            {user.rol === 'instructor' && <p>{`Experiencia : ${user.instr.p_i.exp} años`}</p>}
                        </div>
                        {
                            user.rol === 'instructor' && <div>
                                <table className="table-table-striped">
                                    <thead>
                                        <tr>
                                            <th className='libre-Baskerville'>Días</th>
                                            <th className='libre-Baskerville'>Hora</th>
                                            <th className='libre-Baskerville'>Modalidad</th>
                                            <th className='libre-Baskerville'>Métodos de pago</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            user.instr?.avb.
                                                schedules?.map((sch, index) => (
                                                    <tr key={index}>
                                                        <td>{sch.d.join(', ')}</td>
                                                        <td>{sch.schedules?.length > 0 && sch.schedules?.map((h) => `${h.on} ${is_am_or_pm(h.on)} - ${h.off} ${is_am_or_pm(h.on)}`)}</td>
                                                        <td>{user.instr?.avb.m?.join(', ')}</td>
                                                        <td>{user.instr?.p_i.p_m?.join(', ')}</td>
                                                    </tr>
                                                ))
                                        }
                                    </tbody>
                                </table>
                            </div>
                        }
                        {
                            user.rol === 'owner' && <div>
                                <table className="table-table-striped">
                                    <thead>
                                        <tr>
                                            <th className='libre-Baskerville'>Días</th>
                                            <th className='libre-Baskerville'>Horarios</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            user.gymData.h.map((hour, index) => (
                                                <tr key={index}>
                                                    <td>{Array.isArray(hour.d) ? hour.d.join(', ') : ''}</td>
                                                    <td className='td-hours'>{Array.isArray(hour.schedules) && hour.schedules.map(shed => `| ${shed.on} ${is_am_or_pm(shed.on)} - ${shed.off} ${is_am_or_pm(shed.off)} | `)}</td>
                                                </tr>
                                            ))
                                        }

                                    </tbody>
                                </table>
                            </div>
                        }
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
                                {uid === user.uid && (
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
            <DisplayMessage message={message} />
        </>
    );
});

export default Perfil;
