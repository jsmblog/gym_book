import React from 'react';
import i_wh from '/whatsapp.webp';
import i_fb from '/facebook.webp';
import i_ig from '/instagram.webp';
import i_tk from '/tik-tok.webp';
// import iconEmpty from "/conjunto-vacio.png";
import sliceText from './../Js/sliceText';

const AllGyms = React.memo(({ filteredGyms, setSelectedGym }) => {
  return (
    <section className="all-gyms">
      {filteredGyms?.length > 0 ?  filteredGyms?.map(({ uid, name_gym, imageProfile, province, country,gym_data, email, contact, address,paid }) => (
        <div 
          key={uid} 
          className="gym-card"
          onClick={() => setSelectedGym({ uid, name_gym, imageProfile, country,province, gym_data, email, contact, address,paid })}
        >
          <div className="gym-card__image">
            <img src={imageProfile} alt={name_gym} className="gym-image" />
            <h5 className='merriweather-bold'>{name_gym}</h5>
            <p className="gym-card__province">{country} - {province}</p>
          </div>
          <p className='gym-data__description'>{gym_data.g_t} : {gym_data.des? sliceText(gym_data.des,50) : '' }</p>
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
                  <img src={icon} width={25} alt={key} />
                </a>
              ) : null
            )}
          </div>
        </div>
      )) : (
        <div className="no-gyms">
            <p className='merriweather-bold'>No se encontraron gimnasios con los criterios de búsqueda. ❌</p>
        </div>
      )
    }
    </section>
  );
});

export default AllGyms;
