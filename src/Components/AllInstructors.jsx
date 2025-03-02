import React from 'react';
import i_wh from '/whatsapp.webp';
import i_fb from '/facebook.webp';
import i_ig from '/instagram.webp';
import i_tk from '/tik-tok.webp';
import sliceText from './../Js/sliceText';

const AllInstructors = React.memo(({ filteredInstructors, setSelectedInstructor }) => {
  return (
    <section className="all-gyms"> 
      {filteredInstructors?.length > 0 ? filteredInstructors.map(({ uid, name_instructor, imageProfile,birth, country,province, instructor_data, email, contact, address,raiting }) => (
        <div 
          key={uid} 
          className="gym-card" 
          onClick={() => setSelectedInstructor({ uid, name_instructor, imageProfile,birth , country,province, instructor_data, email, contact, address,raiting })}
        >
          <div className="gym-card__image">
            <img src={imageProfile} alt={name_instructor} className="gym-image" />
            <h5 className='merriweather-bold'>{name_instructor}</h5>
            <p className="gym-card__province">{country} - {province}</p>
          </div>
          <p className='gym-data__description'>
            <strong>{instructor_data?.p_i?.s?.join(', ')} :</strong> {instructor_data?.p_i?.bio ? sliceText(instructor_data.p_i.bio, 50) : ''}
          </p>
          <h5>{instructor_data.p_i?.exp} años de experiencia</h5>
          <div className="social-links">
            {[
              { key: 'wh', icon: i_wh },
              { key: 'tk', icon: i_tk },
              { key: 'fb', icon: i_fb },
              { key: 'ig', icon: i_ig },
            ].map(({ key, icon }) =>
              instructor_data.s_l?.[key] ? ( 
                <a 
                  key={key} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  href={ instructor_data.s_l?.[key]} 
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
          <p className='merriweather-bold'>No se encontraron instructores con los criterios de búsqueda. ❌</p>
        </div>
      )}
    </section>
  );
});

export default AllInstructors;
