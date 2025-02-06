import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import '../Styles/stylesPageNotFound.css';
import catIcon from '/gato_asustado.webp'

const PageNotFound = () => {
  const navigate = useNavigate(); 
  const [messageDisplay, setMessageDisplay] = useState('');
  const message = 'Oops, la página que buscas no está disponible. ¡Parece que te has perdido!';
  const goBack = () => {
    navigate(-1, { replace: true }); 
  };
  const refresh = () => {
    navigate('/')
  }

useEffect(() => {
  let index = 0 ;
  const interval = setInterval(() => {
    if(index <= message.length){
      setMessageDisplay(message.substring(0,index));
      index++;
    }else {
      clearInterval(interval)
    }
  }, 100);
  return () => clearInterval(interval);
}, [])

  return (
    <>
      <section id='cont-page-not-found'>
        <h2 className='merriweather-bold'>{messageDisplay}</h2>
        <h5 id='txt-access-denied' >{`No tienes acceso a esta página o perdiste conexión a internet. Vuelve a intentarlo.`}</h5>
        <img id='icon-page-not-found' src={catIcon} alt="" />
        <div className='div-refresh'>
        <button id='btn-go-back' onClick={goBack}>Volver a la página anterior</button> 
        <button id='btn-refresh-page' onClick={refresh} >⟳</button>
        </div>
      </section>
    </>
  );
};

export default PageNotFound;
