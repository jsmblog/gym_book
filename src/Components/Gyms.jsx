import React from 'react'
import NavBarHome from './NavBarHome';
import '../Styles/stylesGyms.css'

const Gyms = React.memo(({userId}) => {
    return (
      <>
      <main className="main-gyms">
        hola
      </main>
      <NavBarHome userId={userId} />
      </>
    )
});

export default Gyms