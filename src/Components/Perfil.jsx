import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../Styles/stylesPerfil.css';

const Perfil = React.memo(() => {
    const { state: user } = useLocation() || {};
    const navigate = useNavigate();

    if (!user) {
        return <div className="perfil-container">Usuario no encontrado</div>;
    }

    const backHome = () => {
        navigate(-1, { replace: true });
    };

    const mediaPosts = user.posts?.flatMap(post => post.m || []) || [];

    return (
        <div className="perfil-container">
            <button id='back-to-home' onClick={backHome}>←</button>
            <div className="perfil-header">
                <div className='photo-perfil'>
                    <img src={user.imageProfile} alt="Perfil" className="perfil-avatar" />
                    <div className='isOnline' style={{ backgroundColor: user.isOnline ? 'greenyellow' : 'gray' }}></div>
                    <div><h6>({user.isOnline ? 'Activo' : 'No Disponible'})</h6>
                    </div>
                </div>
                <div className="perfil-info">
                    <h2>{user.rol === 'instructor' ? 'Instr :' : ''} {user.name}</h2>
                    <p><strong>Vive en:</strong> {user.province}</p>
                    <p><strong>Género:</strong> {user.gender}</p>
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
