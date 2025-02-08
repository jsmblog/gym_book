import React from 'react'

const Config = React.memo((() => {
    return (
      <>
      <section className="configurations-section">
      <h2>Configuraciones</h2>
      <p>Configura los parámetros de la plataforma y los ajustes del gimnasio.</p>
      <form className="config-form">
        <div className="form-group">
          <label htmlFor="gimName">Nombre del Gimnasio:</label>
          <input type="text" id="gimName" placeholder="Nombre del gimnasio" />
        </div>
        <div className="form-group">
          <label htmlFor="gimAddress">Dirección:</label>
          <input type="text" id="gimAddress" placeholder="Dirección del gimnasio" />
        </div>
        <div className="form-group">
          <label htmlFor="gimContact">Contacto:</label>
          <input type="text" id="gimContact" placeholder="Número de contacto" />
        </div>
        <button type="submit" className="btn-submit">Guardar Configuraciones</button>
      </form>
    </section>
      </>
    )
  }))

export default Config