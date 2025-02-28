import React from 'react';
import is_am_or_pm from '../Js/pm_am';

const CardInstructor = React.memo(({ selectedInstructor, setSelectedInstructor }) => {
  if (!selectedInstructor) {
    return (
      <div className="gym-card-empty">
        <h2>Selecciona un instructor para ver más detalles.</h2>
      </div>
    );
  }

  const {
    imageProfile,
    name_instructor,
    birth,
    email,
    province,
    contact,
    instructor_data = {}
  } = selectedInstructor;
  
  const CALCULATED_AGE =  new Date().getFullYear() - new Date(birth).getFullYear();

  const { p_i = {}, avb = {} } = instructor_data;
  const { s = [], bio = '' , exp = '' , p_m = [] } = p_i;
  const { m = [], schedules = [] } = avb;

  return (
    <>
      {selectedInstructor !== null && (
        <section className="gym-card_width">
          <div className="gym-card__card fade-in">
            <div className="gym-card-header back-blue-dark"></div>
            <section className="gym-card-body">
              <img
                src={imageProfile}
                alt={name_instructor}
                className="gym-image gym-image_width"
              />
              <div>
                <h2 className='name'>{name_instructor} - {CALCULATED_AGE} años</h2>
                <p className="gym-card__province">{province}</p>
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
              <strong>Métodos de pago aceptado :</strong> {p_m.join(', ')}
            </p>
            </div>
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
            <div className="payment-contacts">
              <p>
                <strong>Email:</strong> {email}
              </p>
            </div>
            <button className="btn-close-card-gyms" onClick={() => setSelectedInstructor(null)}>
              X
            </button>
          </div>
        </section>
      )}
    </>
  );
});

export default CardInstructor;
