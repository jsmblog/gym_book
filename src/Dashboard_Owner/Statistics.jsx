import React from 'react'

const Statistics = React.memo(({users}) => {
    const totalUsers = users.length;
  const activeUsers = users.filter(user => user.status === 'Activo').length;
  const inactiveUsers = users.filter(user => user.status === 'Inactivo').length;
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
        <p>Aquí se mostrarán gráficos y reportes detallados...</p>
      </div>
    </section>
      </>
    )
})

export default Statistics