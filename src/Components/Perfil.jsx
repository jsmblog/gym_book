import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../Styles/stylesPerfil.css';

const Perfil = React.memo(({ currentUserData }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const user = location.state || currentUserData;
    const uid = currentUserData?.uid || null;

    if (!user) {
        return <div className="perfil-container">Usuario no encontrado</div>;
    }
    
    console.log(user);

    const backHome = () => {
        navigate(-1, { replace: true });
    };

    const handleEdit = () => {
        console.log("Editar perfil");
        // Aquí puedes agregar la lógica para editar el perfil
    };

    const handleDeleteMedia = (postId) => {
        console.log(`Eliminar post con ID: ${postId}`);
        // Aquí puedes agregar la lógica para eliminar la imagen o video
    };

    const mediaPosts = user.posts?.flatMap(post => post.m?.map(media => ({ ...media, postId: post.post_id })) || []) || [];

    return (
        <div className="perfil-container">
            <button id='back-to-home' onClick={backHome}>←</button>
            {uid === user.uid && (
                <button className="edit-button" onClick={handleEdit}>
                    ✏️
                </button>
            )}
            <div className="perfil-header">
                <div className='photo-perfil'>
                    <img src={user.imageProfile} alt="Perfil" className="perfil-avatar" />
                    <div className='isOnline' style={{ backgroundColor: user.isOnline ? 'greenyellow' : 'gray' }}></div>
                    <h6>({user.isOnline ? 'Activo' : 'No Disponible'})</h6>
                </div>
                <div className="perfil-info">
                    <h2 id='nameUser-perfil'>{user.rol === 'instructor' ? 'Instr :' : ''} {user.rol === 'owner' && user.name_gym ? `${user.name_gym}` : user.name}</h2>
                    <p><strong>{user.rol === 'owner' ? 'Ubicación' : 'Vive en'}: </strong> {user.province}</p>
                    {user.gender && <p><strong>Sexo: </strong> {user.gender}</p>}
                    {user.rol === 'owner' && <p>{`Dirección : ${user.address}`}</p>}
                    {user.rol === 'owner' && <p>{`Contacto : ${user.email}`}</p>}
                    {user.rol === 'owner' && <p>{`Tipo : ${user.gymData.g_t}`}</p>}
                    {user.rol === 'owner' && <p>{`Aforo máximo : ${user.gymData.m_m}`}</p>}
                </div>
            </div>
            <div className="perfil-posts">
                {mediaPosts.length > 0 ? (
                    mediaPosts.map((media, index) => (
                        <div key={index} className="post-item">
                            {media.type === "image" ? (
                                <img src={media.file} alt="Imagen de publicación" className="media-item" />
                            ) : (
                                <video controls className="media-item">
                                    <source src={media.file} type="video/mp4" />
                                    Tu navegador no soporta la reproducción de videos.
                                </video>
                            )}
                            {uid === user.uid && (
                                <button className="delete-button" onClick={() => handleDeleteMedia(media.postId)}>
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
    );
});

export default Perfil;
