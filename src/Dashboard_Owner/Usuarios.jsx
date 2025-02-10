import React, { useEffect, useState } from 'react';
import fakeUsers from './Js/fakeUsers'; // Lista de usuarios de ejemplo
import useMessage from './../Hooks/useMessage';
import DisplayMessage from './../Components/DisplayMessage';
import { db } from '../ConfigFirebase/config.js';
import { arrayUnion, arrayRemove, doc, setDoc, updateDoc } from 'firebase/firestore';
import uuid from './../Js/uuid';
import formatDate from './../Js/formatDate';

const Usuarios = React.memo(({ currentUserData, users, setUsers }) => {
  // Estados para búsqueda, paginación y formulario de nuevo usuario
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserStatus, setNewUserStatus] = useState('Activo');
  const [newUserMembership, setNewUserMembership] = useState('Básico'); 
  const [newUserMembershipDate, setNewUserMembershipDate] = useState(''); 
  const [newUserMembershipType, setNewUserMembershipType] = useState('mensualidad');
  const [newUserMembershipAmount, setNewUserMembershipAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, messageError] = useMessage();

  // Estados para filtrar por estado y membresía
  const [statusFilter, setStatusFilter] = useState('');
  const [membershipFilter, setMembershipFilter] = useState('');

  // Estados para edición inline (se incluyen los nuevos campos)
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingUserData, setEditingUserData] = useState({
    n: '',
    e: '',
    s: '',
    m: '',
    md: '',    
    mt: '',    
    amount: ''
  });

  useEffect(() => {
    const userList = currentUserData?.paid?.i_p ? currentUserData.users : fakeUsers;
    setUsers(userList);
    setFilteredUsers(userList);
  }, [currentUserData, setUsers]);

  useEffect(() => {
    let filtered = users;
    // Filtrado por búsqueda (nombre o email)
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.n.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.e.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    // Filtrado por estado
    if (statusFilter) {
      filtered = filtered.filter(user => user.s === statusFilter);
    }
    // Filtrado por membresía
    if (membershipFilter) {
      filtered = filtered.filter(user => user.m === membershipFilter);
    }
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchQuery, statusFilter, membershipFilter, users]);

  // Cálculos para la paginación
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Función para calcular la fecha de finalización de la membresía
  const calculateFinalDate = (dateStr, membershipType) => {
    if (!dateStr) return '';
    const startDate = new Date(dateStr);
    let monthsToAdd = 0;
    switch (membershipType) {
      case 'mensualidad':
        monthsToAdd = 1;
        break;
      case 'trimestral':
        monthsToAdd = 3;
        break;
      case 'Semestral':
        monthsToAdd = 6;
        break;
      case 'anualidad':
        monthsToAdd = 12;
        break;
      default:
        monthsToAdd = 0;
    }
    startDate.setMonth(startDate.getMonth() + monthsToAdd);
    return formatDate(startDate.toISOString());
  };

  // Función para agregar nuevo usuario
  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (!newUserName || !newUserEmail || !newUserMembershipDate || !newUserMembershipAmount) {
      messageError("Complete los campos");
      setSaving(false);
      return;
    }
    // Validar que la fecha de membresía no sea futura
    const selectedDate = new Date(newUserMembershipDate);
    const today = new Date();
    if (selectedDate > today) {
      messageError("La fecha de membresía no puede ser futura");
      setSaving(false);
      return;
    }

    const newUser = {
      i: uuid(5),
      n: newUserName,
      e: newUserEmail,
      s: newUserStatus,
      m: newUserMembership, // Plan de membresía (Básico o Premium)
      md: newUserMembershipDate, // Fecha de membresía en formato YYYY-MM-DD
      fmd: calculateFinalDate(newUserMembershipDate, newUserMembershipType), // Fecha final calculada
      mt: newUserMembershipType, // Tipo de membresía (mensualidad, trimestral, Semestral, anualidad)
      amount: newUserMembershipAmount, // Monto pagado
      c: formatDate(new Date().toISOString()) // Fecha de registro del usuario
    };

    try {
      const docRef = doc(db, 'USERS', currentUserData?.uid);
      await setDoc(docRef, { u: arrayUnion(newUser) }, { merge: true });
      messageError("¡¡ Usuario agregado con éxito !!");
      setSaving(false);
      // Reiniciar el formulario
      setNewUserName("");
      setNewUserEmail("");
      setNewUserStatus("Activo");
      setNewUserMembership("Básico");
      setNewUserMembershipDate("");
      setNewUserMembershipType("mensualidad");
      setNewUserMembershipAmount("");
      setShowAddUserForm(false);
    } catch (error) {
      console.error("Error al guardar el usuario:", error);
      messageError("Sucedió un error, intentalo nuevamente");
      setSaving(false);
    }
  };

  const removeUser = async (userId) => {
    try {
      if(!currentUserData.paid.i_p){
        messageError("¡¡ Suscríbete a un plan !!");
        return;
        }
      if (currentUserData.rol === 'owner') {
        const docRef = doc(db, 'USERS', currentUserData?.uid);
        const userToRemove = users.find(u => u.i === userId);
        if (!userToRemove) {
          messageError("Usuario no encontrado");
          return;
        }
        await updateDoc(docRef, {
          u: arrayRemove(userToRemove)
        });
      }
    } catch (error) {
      console.error("Error al remover el usuario:", error);
    }
  };

  // Funciones para editar un usuario (se incluyen los nuevos campos)
  const handleEditClick = (user) => {
    setEditingUserId(user.i);
    setEditingUserData({ 
      n: user.n, 
      e: user.e, 
      s: user.s, 
      m: user.m, 
      md: user.md, 
      mt: user.mt,
      amount: user.amount 
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    if(!currentUserData.paid.i_p){
    messageError("¡¡ Suscríbete a un plan !!");
    return;
    }
    const oldUser = users.find(u => u.i === editingUserId);
    if (!oldUser) {
      messageError("Usuario no encontrado");
      return;
    }
    const updatedUser = { 
      ...oldUser, 
      ...editingUserData,
      fmd: calculateFinalDate(editingUserData.md, editingUserData.mt) // Recalcula la finalización
    };
    setIsUpdating(true);
    try {
      const docRef = doc(db, 'USERS', currentUserData?.uid);
      // Eliminar el usuario antiguo y agregar el actualizado
      await updateDoc(docRef, {
        u: arrayRemove(oldUser)
      });
      await updateDoc(docRef, {
        u: arrayUnion(updatedUser)
      });
      messageError("Usuario actualizado con éxito");
      setEditingUserId(null);
      setTimeout(() => {
        setIsUpdating(false);
      }, 1000);
      setEditingUserData({ n: '', e: '', s: '', m: '', md: '', mt: '', amount: '' });
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      messageError("Error al actualizar el usuario");
    }
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditingUserData({ n: '', e: '', s: '', m: '', md: '', mt: '', amount: '' });
  };

  return (
    <>
      <section className="users-management">
        <h4 className='added'>
          {`${currentUsers.length} ${users?.length === 0 || users?.length > 1 ? `usuarios añadidos` : `usuario añadido`}`}
        </h4>
        <div className="table-header">
          <h2 className='libre-Baskerville'>Gestión de Usuarios {!currentUserData.paid.i_p && '(ejemplo)'} </h2>
          {isUpdating && <div className='updating'></div>}
          <div className="header-actions">
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Filtrar por estado</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
            <select value={membershipFilter} onChange={(e) => setMembershipFilter(e.target.value)}>
              <option value="">Filtrar por membresía</option>
              <option value="Básico">Básico</option>
              <option value="Premium">Premium</option>
            </select>
            {currentUserData?.paid?.i_p ? (
              <button className="back-blue-dark" onClick={() => setShowAddUserForm(true)}>
                Agregar
              </button>
            ) : (
              <button className="back-blue-dark">Suscríbete a un plan</button>
            )}
          </div>
        </div>

        {showAddUserForm && (
          <form onSubmit={handleAddUserSubmit} className="add-user-form">
            <div className="form-group">
              <label>Nombre:</label>
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Estado:</label>
              <select
                value={newUserStatus}
                onChange={(e) => setNewUserStatus(e.target.value)}
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
            {/* Plan de membresía */}
            <div className="form-group">
              <label>Membresía:</label>
              <select
                value={newUserMembership}
                onChange={(e) => setNewUserMembership(e.target.value)}
              >
                <option value="Básico">Básico</option>
                <option value="Premium">Premium</option>
              </select>
            </div>
            {/* Nuevos campos */}
            <div className="form-group">
              <label>Fecha Membresía:</label>
              <input
                type="date"
                value={newUserMembershipDate}
                onChange={(e) => setNewUserMembershipDate(e.target.value)}
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="form-group">
              <label>Tipo Membresía:</label>
              <select
                value={newUserMembershipType}
                onChange={(e) => setNewUserMembershipType(e.target.value)}
              >
                <option value="mensualidad">Mensualidad</option>
                <option value="trimestral">Trimestral</option>
                <option value="Semestral">Semestral</option>
                <option value="anualidad">Anualidad</option>
              </select>
            </div>
            <div className="form-group">
              <label>Monto:</label>
              <input
                type="number"
                min={0}
                value={newUserMembershipAmount}
                onChange={(e) => setNewUserMembershipAmount(e.target.value)}
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-submit back-blue-dark" disabled={saving}>
                {saving ? 'Guardando...' : 'Agregar Usuario'}
              </button>
              <button type="button" className="btn-delete" onClick={() => setShowAddUserForm(false)}>
                X
              </button>
            </div>
          </form>
        )}

        <div className="table-container-admin">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Registrado</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Estado</th>
                <th>Membresía</th>
                <th>Tipo Membresía</th>
                <th>Monto</th>
                <th>Fecha membresía</th>
                <th>Finalización Membresía</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map((user, index) => (
                  <tr key={user.i}>
                    <td>{index + 1}</td>
                    <td>{user.c}</td>
                    <td>
                      {editingUserId === user.i ? (
                        <input
                          type="text"
                          name="n"
                          value={editingUserData.n}
                          onChange={handleEditChange}
                        />
                      ) : (
                        user.n
                      )}
                    </td>
                    <td>
                      {editingUserId === user.i ? (
                        <input
                          type="email"
                          name="e"
                          value={editingUserData.e}
                          onChange={handleEditChange}
                        />
                      ) : (
                        user.e
                      )}
                    </td>
                    <td>
                      {editingUserId === user.i ? (
                        <select name="s" value={editingUserData.s} onChange={handleEditChange}>
                          <option value="Activo">Activo</option>
                          <option value="Inactivo">Inactivo</option>
                        </select>
                      ) : (
                        user.s
                      )}
                    </td>
                    <td>
                      {editingUserId === user.i ? (
                        <select name="m" value={editingUserData.m} onChange={handleEditChange}>
                          <option value="Básico">Básico</option>
                          <option value="Premium">Premium</option>
                        </select>
                      ) : (
                        user.m
                      )}
                    </td>
                    <td>
                      {editingUserId === user.i ? (
                        <select name="mt" value={editingUserData.mt} onChange={handleEditChange}>
                          <option value="mensualidad">Mensualidad</option>
                          <option value="trimestral">Trimestral</option>
                          <option value="Semestral">Semestral</option>
                          <option value="anualidad">Anualidad</option>
                        </select>
                      ) : (
                        user.mt
                      )}
                    </td>
                    <td>
                      {editingUserId === user.i ? (
                        <input
                          type="number"
                          name="amount"
                          min={0}
                          value={editingUserData.amount}
                          onChange={handleEditChange}
                        />
                      ) : (
                        <span>$ {user.amount}</span>
                      )}
                    </td>
                    <td>
                      {editingUserId === user.i ? (
                        <input
                          type="date"
                          name="md"
                          value={editingUserData.md}
                          onChange={handleEditChange}
                          max={new Date().toISOString().split('T')[0]}
                        />
                      ) : (
                        // Puedes formatear la fecha si lo deseas: formatDate(user.md)
                        user.md
                      )}
                    </td>
                    <td>
                      {editingUserId === user.i
                        ? calculateFinalDate(editingUserData.md, editingUserData.mt)
                        : calculateFinalDate(user.md, user.mt)}
                    </td>
                    <td className="td-actions">
                      {editingUserId === user.i ? (
                        <div className="cancel-or-saved">
                          <button className="btn-save" onClick={handleSaveEdit}>Guardar</button>
                          <button className="btn-cancel" onClick={handleCancelEdit}>Cancelar</button>
                        </div>
                      ) : (
                        <>
                          <button className="btn-edit" onClick={() => handleEditClick(user)}>🖋️</button>
                          <button className="btn-delete" onClick={() => removeUser(user.i)}>🗑️</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="no-results">
                    No se encontraron usuarios
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={currentPage === i + 1 ? 'active' : ''}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </button>
        </div>
      </section>
      <DisplayMessage message={message} />
    </>
  );
});

export default Usuarios;
