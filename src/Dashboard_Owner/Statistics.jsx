import React from 'react'

const Statistics = React.memo(({users}) => {
    const totalUsers = users.length;
  const activeUsers = users.filter(user => user.s === 'Activo').length;
  const inactiveUsers = users.filter(user => user.s === 'Inactivo').length;
    return (
      <>
      <section className="stats-section">
      <h2>Estadísticas</h2>
      <div className="stats-cards">
        <div className="card">
          <h3>Total de Usuarios</h3>
          <p>{totalUsers}</p>
        </div>
        <div className="card">
          <h3>Usuarios Activos</h3>
          <p>{activeUsers}</p>
        </div>
        <div className="card">
          <h3>Usuarios Inactivos</h3>
          <p>{inactiveUsers}</p>
        </div>
      </div>
      <div className="charts">
      <p>Visualiza gráficos, analiza interacciones en tiempo real y accede a reportes detallados para optimizar tu estrategia.</p>
      </div>
    </section>
      </>
    )
})

export default Statistics