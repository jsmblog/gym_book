import React from 'react';
import i_wh from '/whatsapp.png';
import i_fb from '/facebook.png';
import i_ig from '/instagram.png';
import i_tk from '/tik-tok.png';
import is_am_or_pm from './../Js/pm_am';

const CardGym = React.memo(({ selectedGym , setSelectedGym }) => {
  if (!selectedGym) {
    return (
      <div className="gym-card-empty">
        <h2>Selecciona un gimnasio para ver más detalles.</h2>
      </div>
    );
  }

  const { uid, name_gym, imageProfile, email, contact, address, province, gym_data } = selectedGym || {};
  return (
  <>
  {
    selectedGym !== null && (
      <section className="gym-card_width">
      <div key={uid} className="gym-card__card fade-in">
        <div className="gym-card-header back-blue-dark">
        </div>
        <section className="gym-card-body">
          <img src={imageProfile} alt={name_gym} className="gym-image gym-image_width" />
          <div>
            <h2>{name_gym}</h2>
            <p className="gym-card__province">{province}</p>
          </div>
        </section>
        <p className='gym-data__description gym-data__description_lh'>{gym_data.g_t} : {gym_data.des ? gym_data.des : ''}</p>
        {gym_data.m_m && <p className='max-people'>Aforo máximo: <span>{gym_data.m_m}</span> personas</p>}
        <div className="gym-card__tables">
          {gym_data.h?.length > 0 && (
            <table className="schedule-table">
  <thead>
    <tr>
      <th className='libre-Baskerville'>Días</th>
      <th className='libre-Baskerville'>Horarios</th>
    </tr>
  </thead>
  <tbody>
  {
  gym_data.h.map((hour, index) => (
    <tr key={index}>
      <td>{Array.isArray(hour.d) ? hour.d.join(', ') : ''}</td>
      <td className='td-hours'>{Array.isArray(hour.schedules) && hour.schedules.map(shed => `| ${shed.on} ${is_am_or_pm(shed.on)} - ${shed.off} ${is_am_or_pm(shed.off)} | `)}</td>
    </tr>
  ))
}

  </tbody>
</table>
        
          )}
          {gym_data.m_p?.length > 0 && (
            <table className="plans-table">
              <thead>
                <tr>
                  <th className='libre-Baskerville'>Plan</th>
                  <th className='libre-Baskerville'>Precio</th>
                  <th className='libre-Baskerville'>Tipo de pago</th></tr>
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
            <h3 className="gym-card__province">Métodos de pago:</h3>
            <p className="payment-item">{gym_data.p_m.join(' , ')}</p>
          </div>
        )}
        <div className="payment-contacts">
        <p className='gym-card__address'>Dir: {address}</p>
        <p><strong>Email:</strong> {email}</p>
        <p><strong>Contacto:</strong> {contact}</p>
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
        </div>
      <button className='btn-close-card-gyms' onClick={()=> setSelectedGym(null)}>
        X 
      </button>
      </div>
    </section>
    )
  }
  </>  
  );
});

export default CardGym;
