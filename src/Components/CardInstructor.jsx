// CardInstructor.jsx
import React, { useEffect, useState } from 'react';
import is_am_or_pm from '../Js/pm_am';
import RatingSummary from './RatingSummary';
import useStarRating from '../Hooks/useStarRating.js';
import useMessage from './../Hooks/useMessage';
import { arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { db } from '../ConfigFirebase/config.js';
import DisplayMessage from './DisplayMessage';
import formatDate from '../Js/formatDate.js';

const CardInstructor = React.memo(({ selectedInstructor, setSelectedInstructor, currentUserData }) => {
  if (!selectedInstructor) {
    return (
      <div className="gym-card-empty">
        <h2>Selecciona un instructor para ver más detalles.</h2>
      </div>
    );
  }
  const {
    uid,
    imageProfile,
    name_instructor,
    birth,
    email,
    province,
    country,
    contact,
    instructor_data = {},
    raiting = [] // reseñas actuales
  } = selectedInstructor;
  
  const CALCULATED_AGE = new Date().getFullYear() - new Date(birth).getFullYear();
  const { p_i = {}, avb = {} } = instructor_data;
  const { s = [], bio = '', exp = '', p_m = [] } = p_i;
  const { m = [], schedules = [] } = avb;

  const [allRaitings, setAllRaitings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comment, setComment] = useState('');
  const { rating, hoverRating, onMouseEnter, onMouseLeave, onClick, setRating, setHoverRating } = useStarRating();
  const [message, messageError] = useMessage();

  useEffect(() => {
    if (selectedInstructor) {
      setAllRaitings(raiting || []);
    }
  }, [selectedInstructor]);

  const handleSubmitComment = async () => {
    try {
      if (!uid) {
        messageError("Usuario no encontrado.");
        return;
      }
      if (!comment || rating === 0) {
        messageError("Deja un comentario y selecciona una reseña antes de enviar.");
        return;
      }
      const { name, imageProfile: userImage } = currentUserData;
      const createdRaiting = formatDate(new Date().toLocaleString()) 
      const userRaiting = {
        c: createdRaiting,
        n: name,
        i: userImage,
        r: rating,
        o: comment,
      };

      const docRef = doc(db, "USERS", uid);
      await updateDoc(docRef, { rt: arrayUnion(userRaiting) });
      messageError("Opinión creada con éxito");

      setAllRaitings(prev => [...prev, userRaiting]);
      const cachedInstructors = sessionStorage.getItem('instructors');
      if (cachedInstructors) {
        const instructors = JSON.parse(cachedInstructors);
        const updatedInstructors = instructors.map(inst => {
          if (inst.uid === uid) {
            const existingRatings = inst.raiting || [];
            return { ...inst, raiting: [...existingRatings, userRaiting] };
          }
          return inst;
        });
        sessionStorage.setItem('instructors', JSON.stringify(updatedInstructors));
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
      {selectedInstructor && (
        <section className="gym-card_width">
          <div className="gym-card__card fade-in">
            <div className="gym-card-header back-blue-dark"></div>
            <section className="gym-card-body">
              <img src={imageProfile} alt={name_instructor} className="gym-image gym-image_width" />
              <div>
                <h2 className="name">{name_instructor} - {CALCULATED_AGE} años</h2>
                <p className="gym-card__province">{country} - {province}</p>
                <a href={`tel:${contact}`} className="contact-link">
                  <h4>{contact}</h4>
                </a>
              </div>
            </section>
            <p className="gym-data__description gym-data__description_lh">
              {bio || "Sin biografía disponible."}
            </p>
            <div className="gym-card__specialty-and-payments">
              <p>
                <strong>Experto en:</strong> {s.join(', ')} con {exp} años de experiencia
              </p>
              <p>
                <strong>Modalidad de trabajo:</strong> {m.join(', ')}
              </p>
              <p>
                <strong>Métodos de pago aceptados:</strong> {p_m.join(', ')}
              </p>
              <p>
                <strong>Email:</strong> {email}
              </p>
            </div>
            
            <div className="instructor-rating-button">
              <h5 className="review-title" onClick={() => setIsModalOpen(true)}>
                <strong>¿Has tomado clases con {name_instructor}? ¡Déjanos tu opinión!</strong>
              </h5>
            </div>

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
            {schedules.length > 0 && (
              <div className="gym-card__tables">
                <table className="schedule-table">
                  <thead>
                    <tr>
                      <th className="libre-Baskerville">Días</th>
                      <th className="libre-Baskerville">Horarios</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map(({ d, schedules }, index) => (
                      <tr key={index}>
                        <td>{Array.isArray(d) ? d.join(', ') : ''}</td>
                        <td className="td-hours">
                          {Array.isArray(schedules) &&
                            schedules.map(({ on, off }) =>
                              `| ${on} ${is_am_or_pm(on)} - ${off} ${is_am_or_pm(off)} | `
                            )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <button className="btn-close-card-gyms" onClick={() => setSelectedInstructor(null)}>
              X
            </button>
          </div>
        </section>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Déjanos tu opinión</h2>
            <h5>Tu comentario ayudará a otros usuarios a decidirse a tomar clases con {currentUserData.name}.</h5>
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

export default CardInstructor;
