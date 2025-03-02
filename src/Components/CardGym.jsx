// CardGym.jsx
import React, { useEffect, useState } from 'react';
import i_wh from '/whatsapp.webp';
import i_fb from '/facebook.webp';
import i_ig from '/instagram.webp';
import i_tk from '/tik-tok.webp';
import is_am_or_pm from './../Js/pm_am';
import { API_KEY_GOOGLE } from '../FirebaseEnv/firebaseEnv';
import useStarRating from '../Hooks/useStarRating.js';
import useMessage from './../Hooks/useMessage';
import DisplayMessage from './DisplayMessage';
import formatDate from './../Js/formatDate';
import { arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { db } from '../ConfigFirebase/config.js';
import RatingSummary from './RatingSummary'; 

const CardGym = React.memo(({ selectedGym, setSelectedGym, currentUserData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [allRaitings, setAllRaitings] = useState([]);
  const { rating, hoverRating, onMouseEnter, onMouseLeave, onClick, setRating, setHoverRating } = useStarRating();
  const [message, messageError] = useMessage();

  useEffect(() => {
    if (selectedGym) {
      setAllRaitings(selectedGym.raiting || []);
    }
  }, [selectedGym]);

  if (!selectedGym) {
    return (
      <div className="gym-card-empty">
        <h2>Selecciona un gimnasio para ver más detalles.</h2>
      </div>
    );
  }

  const { uid, name_gym, imageProfile, email, contact, address, country, province, gym_data, paid } = selectedGym;

  const handleSubmitComment = async () => {
    try {
      if (!uid) {
        messageError("Usuario no encontrado.");
        return;
      }
      // Se verifica que haya comentario y que se haya confirmado una calificación (rating > 0)
      if (!comment || rating === 0) {
        messageError("Deja un comentario y selecciona una reseña antes de enviar.");
        return;
      }
      const { name, imageProfile: userImage } = currentUserData;
      const createdRaiting = formatDate(new Date().toISOString());
      const userRaiting = {
        c: createdRaiting,
        n: name,
        i: userImage,
        r: rating,
        o: comment,
      };

      const docRefOwner = doc(db, "USERS", uid);
      await updateDoc(docRefOwner, { rt: arrayUnion(userRaiting) });
      messageError("Opinión creada con éxito");

      setAllRaitings(prev => [...prev, userRaiting]);

      const cachedGyms = sessionStorage.getItem('gyms');
      if (cachedGyms) {
        const gyms = JSON.parse(cachedGyms);
        const updatedGyms = gyms.map(gym => {
          if (gym.uid === uid) {
            const existingRatings = gym.raiting || [];
            return { ...gym, raiting: [...existingRatings, userRaiting] };
          }
          return gym;
        });
        sessionStorage.setItem('gyms', JSON.stringify(updatedGyms));
      }

      setIsModalOpen(false);
      handleCloseModal();
    } catch (error) {
      console.log(error);
      messageError("Hubo un error al dejar tu opinión :(");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setComment('');
    setRating(0);
    setHoverRating(0);
  };

  return (
    <>
      {selectedGym && (
        <section className="gym-card_width">
          <div key={uid} className="gym-card__card fade-in">
            <div className="gym-card-header back-blue-dark"></div>
            <section className="gym-card-body">
              <img src={imageProfile} alt={name_gym} className="gym-image gym-image_width" />
              <div>
                <h2 className="name">{name_gym}</h2>
                <p className="gym-card__province">{country} - {province} - {address}</p>
                <a href={`tel:${contact}`} className="contact-link">
                  <h4>{contact}</h4>
                </a>
              </div>
            </section>
            <p className="gym-data__description gym-data__description_lh">
              <strong>{gym_data.g_t} :</strong> {gym_data.des || ''}
            </p>
            {gym_data.m_m && (
              <div className="gym-data__reviews">
                <p>
                  <strong>Aforo máximo:</strong> <span>{gym_data.m_m}</span> personas
                </p>
                <h5 className="review-title" onClick={() => setIsModalOpen(true)} style={{ cursor: 'pointer' }}>
                  <strong>¿Has estado en {name_gym}? ¡Déjanos tu opinión!</strong>
                </h5>
              </div>
            )}
            {allRaitings.length > 0 && (
              <div className="ratings-list">
                {allRaitings.map((r, index) => (
                  <div key={index} className="rating-item">
                    <img src={r.i} alt={r.n} />
                    <div className="rating-info">
                      <strong>{r.n}</strong>
                      <div className="stars">
                        {[...Array(r.r)].map((_, i) => (
                          <span key={i} className="star-user">★</span>
                        ))}
                      </div>
                      <p>{r.o}</p>
                      <h6>Publicado: {r.c}</h6>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <RatingSummary ratings={allRaitings.map(item => item.r)} />
            {paid.i_p && (
              <div className="gym-card__personal-trainer">
                <h3 className="libre-Baskerville">Conoce a nuestro equipo de expertos</h3>
                <div className="gym-card__personal-trainer-container">
                  {gym_data.per?.map((p, index) => (
                    <div key={index} className="gym-card__personal">
                      <img src={p.i} width={30} alt={p.n} />
                      <h4 className="gym-card__personal-trainer-name libre-Baskerville">{p.n}</h4>
                      <h5 className="gym-card__personal-trainer-rol">{p.r}</h5>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="gym-card__tables">
              {gym_data.h?.length > 0 && (
                <table className="schedule-table">
                  <thead>
                    <tr>
                      <th className="libre-Baskerville">Días</th>
                      <th className="libre-Baskerville">Horarios</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gym_data.h.map((hour, index) => (
                      <tr key={index}>
                        <td>{Array.isArray(hour.d) ? hour.d.join(', ') : ''}</td>
                        <td className="td-hours">
                          {Array.isArray(hour.schedules) &&
                            hour.schedules.map(shed =>
                              `| ${shed.on} ${is_am_or_pm(shed.on)} - ${shed.off} ${is_am_or_pm(shed.off)} | `
                            )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {gym_data.m_p?.length > 0 && (
                <table className="plans-table">
                  <thead>
                    <tr>
                      <th className="libre-Baskerville">Plan</th>
                      <th className="libre-Baskerville">Precio</th>
                      <th className="libre-Baskerville">Tipo de pago</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gym_data.m_p.map(({ plan, pr, pay }, index) => (
                      <tr key={index}>
                        <td>{plan}</td>
                        <td>{pr}</td>
                        <td>{pay}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {gym_data.p_m?.length > 0 && (
              <div className="payment-methods">
                <strong>Métodos de pago:</strong>
                <p className="payment-item">{gym_data.p_m.join(' , ')}</p>
              </div>
            )}

            <div className="payment-contacts">
              <p>
                <strong>Email:</strong> {email}
              </p>
              <div className="social-links">
                {[
                  { key: 'wh', icon: i_wh },
                  { key: 'tk', icon: i_tk },
                  { key: 'fb', icon: i_fb },
                  { key: 'ig', icon: i_ig }
                ].map(({ key, icon }) =>
                  gym_data.s_l?.[key] ? (
                    <a
                      key={key}
                      target="_blank"
                      rel="noopener noreferrer"
                      href={gym_data.s_l[key]}
                      className="social-icon"
                    >
                      <img src={icon} width={25} alt="" />
                    </a>
                  ) : null
                )}
              </div>
              {gym_data.branches && gym_data.branches.length > 0 && (
                <div className="branches-container">
                  <h3 className="libre-Baskerville">¡Explora nuestras sedes y vive la experiencia!</h3>
                  <div className="branches">
                    {gym_data.branches.map(branch => (
                      <div key={branch.id} className="branch">
                        <h3 className="libre-Baskerville">{branch.name}</h3>
                        <p>Dir : {branch.address}</p>
                        <iframe
                          width="300"
                          height="200"
                          style={{ border: 0 }}
                          src={`https://www.google.com/maps/embed/v1/place?key=${API_KEY_GOOGLE}&q=${branch.lat},${branch.lng}`}
                          allowFullScreen
                          title={`Mapa de ${branch.name}`}
                        ></iframe>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button className="btn-close-card-gyms" onClick={() => setSelectedGym(null)}>
              X
            </button>
          </div>
        </section>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Déjanos tu opinión</h2>
            <h5>Tu comentario ayudará a otros usuarios a decidirse a entrenar aquí.</h5>
            <textarea
              maxLength={100}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Escribe tu comentario aquí..."
              required
            />
            <div id="star-rating">
              <h5>
                {hoverRating === 1
                  ? '¡¡ 😨 !!'
                  : hoverRating === 2
                  ? '😥🥺'
                  : hoverRating === 3
                  ? '¡No está mal 😀!'
                  : hoverRating === 4
                  ? '¡Muy bien 😄!'
                  : hoverRating === 5
                  ? '¡¡Excelente 🤗🤩!!'
                  : '¡Califícanos!'}
              </h5>
              <div>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${star <= (hoverRating || rating) ? 'selected' : ''}`}
                    onClick={() => onClick(star)}
                    onMouseEnter={() => onMouseEnter(star)}
                    onMouseLeave={onMouseLeave}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            <div className="modal-buttons">
              <button onClick={handleSubmitComment}>Enviar</button>
              <button className="cancel-raiting" onClick={handleCloseModal}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      <DisplayMessage message={message} />
    </>
  );
});

export default CardGym;
