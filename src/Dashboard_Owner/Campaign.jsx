import React from 'react'

const Campaign = React.memo(() => {
    return (
      <>
      <section className="campaigns-section">
      <h2>Campañas</h2>
      <p>Esta sección permitirá crear y gestionar campañas de email, promociones y notificaciones.</p>
      <form className="campaign-form">
        <div className="form-group">
          <label htmlFor="campaignName">Nombre de la campaña:</label>
          <input type="text" id="campaignName" placeholder="Nombre de la campaña" />
        </div>
        <div className="form-group">
          <label htmlFor="campaignMessage">Mensaje:</label>
          <textarea id="campaignMessage" placeholder="Escribe el mensaje de la campaña"></textarea>
        </div>
        <button type="submit" className="btn-submit">Enviar Campaña</button>
      </form>
    </section>
      </>
    )
})

export default Campaign