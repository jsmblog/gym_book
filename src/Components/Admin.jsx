import React, { useMemo, useState } from 'react';
import '../Styles/stylesAdmin.css';
import { useUserContext } from '../Context/UserContext';
import SesionOff from './SesionOff';

const Admin = React.memo(({ userId }) => {
  const { users } = useUserContext();

  const [filterDate, setFilterDate] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterPlan, setFilterPlan] = useState('');
  const [filterGender, setFilterGender] = useState('');

  const uniqueDates = useMemo(() => {
    return [...new Set(users.map((user) => user.createAccount))];
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => user.uid !== userId)
      .filter((user) => !filterDate || user.createAccount === filterDate)
      .filter(
        (user) =>
          !filterRole ||
          user.rol.toLowerCase() === filterRole.toLowerCase()
      )
      .filter(
        (user) =>
          !filterPlan ||
          ((user.paid && user.paid.i_p) ? 'Básico' : 'Free') === filterPlan
      )
      .filter((user) => !filterGender || user.gender === filterGender);
  }, [userId, users, filterDate, filterRole, filterPlan, filterGender]);

  return (
    <div id="dashboard">
      <header id="dashboard-header">
        <h1>Bienvenido Administrador</h1>
        <div className="sesionOff">
          <SesionOff />
        </div>
      </header>
      <div id="dashboard-body">
        <section id="dashboard-content">
          <div id="filters">
            <select
              id="filter-date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            >
              <option value="">Todas las fechas</option>
              {uniqueDates.map((date, index) => (
                <option key={index} value={date}>
                  {date}
                </option>
              ))}
            </select>
            <select
              id="filter-role"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="">Todos los roles</option>
              <option value="owner">Owner</option>
              <option value="instructor">Instructor</option>
              <option value="user">Usuario</option>
            </select>
            <select
              id="filter-plan"
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
            >
              <option value="">Todos los planes</option>
              <option value="Básico">Básico</option>
              <option value="Free">Free</option>
            </select>
            <select
              id="filter-gender"
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
            >
              <option value="">Todos los géneros</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
            </select>
            <h4 className='libre-Baskerville'>Total de usuarios: {filteredUsers.length}</h4>
          </div>
          <div className='cont-table'>
          <table id="users-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Foto</th>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Registro</th>
                <th>Género</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Gym</th>
                <th>País</th>
                <th>Provincia/Dirección</th>
                <th>Plan</th>
                <th>On/Off</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user ,index) => (
                <tr key={user.uid}>
                  <td>{index + 1}</td>
                  <td>
                    <img
                    title={user.uid}
                      src={user.imageProfile}
                      alt={user.name}
                      className="user-image"
                    />
                  </td>
                  <td>{user.name}</td>
                  <td>{user.rol}</td>
                  <td>{user.createAccount}</td>
                  <td>{user.gender || 'null'}</td>
                  <td>{user.email}</td>
                  <td>{user.numberTelf}</td>
                  <td>{user.name_gym ? user.name_gym : '---'}</td>
                  <td>{user.country || 'null'}</td>
                  <td>
                    {`${user.province} ${
                      user.address ? `- ${user.address}` : ''
                    }`}
                  </td>
                  <td>{user.paid && user.paid.i_p ? 'Básico' : 'Free'}</td>
                  <td>{user.isOnline ? 'Activo' : 'Off'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </section>
      </div>
    </div>
  );
});

export default Admin;
