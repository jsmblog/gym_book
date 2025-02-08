import React, { useEffect, useState } from 'react'

const Usuarios = React.memo(({users,setUsers}) => {
    // Estados para la gestión de usuarios
      const [searchQuery, setSearchQuery] = useState('');
      const [filteredUsers, setFilteredUsers] = useState([]);
      
      const [currentPage, setCurrentPage] = useState(1);
      const itemsPerPage = 10; 
      // Estados para el formulario de agregar usuario
      const [showAddUserForm, setShowAddUserForm] = useState(false);
      const [newUserName, setNewUserName] = useState("");
      const [newUserEmail, setNewUserEmail] = useState("");
      const [newUserStatus, setNewUserStatus] = useState("Activo");
      const [newUserMembership, setNewUserMembership] = useState("Básico");
    
      // Simulación de datos iniciales (esto se reemplazaría por una llamada a una API)
      useEffect(() => {
        const fakeData = [
          { id: 1, name: 'Juan Pérez', email: 'juan@example.com', status: 'Activo', membership: 'Premium', lastLogin: '2025-02-05' },
          { id: 2, name: 'María López', email: 'maria@example.com', status: 'Inactivo', membership: 'Básico', lastLogin: '2025-01-20' },
          { id: 3, name: 'Carlos Sánchez', email: 'carlos@example.com', status: 'Activo', membership: 'Premium', lastLogin: '2025-02-06' },
          { id: 4, name: 'Ana Gómez', email: 'ana@example.com', status: 'Activo', membership: 'Básico', lastLogin: '2025-02-03' },
        ];
        setUsers(fakeData);
        setFilteredUsers(fakeData);
      }, []);
    
      // Filtrado de usuarios basado en la búsqueda (nombre o email)
      useEffect(() => {
        const filtered = users.filter(user =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredUsers(filtered);
        setCurrentPage(1); // Reinicia la paginación al buscar
      }, [searchQuery, users]);
     
      // calculos para la paginación
      const indexOfLastUser = currentPage * itemsPerPage;
      const indexOfFirstUser = indexOfLastUser - itemsPerPage;
      const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
      const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    
      const handleSearchChange = (e) => {
          setSearchQuery(e.target.value);
        };
      
        // Función para agregar un nuevo usuario
        const handleAddUserSubmit = (e) => {
          e.preventDefault();
          // Generamos un ID único basado en el máximo actual o 1 si no hay usuarios
          const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
          const newUser = {
            id: newId,
            name: newUserName,
            email: newUserEmail,
            status: newUserStatus,
            membership: newUserMembership,
            lastLogin: new Date().toISOString().slice(0, 10) // Formato AAAA-MM-DD
          };
      
          // Actualizamos la lista de usuarios
          const updatedUsers = [...users, newUser];
          setUsers(updatedUsers);
          // Actualizamos también los usuarios filtrados en caso de que la búsqueda esté activa
          setFilteredUsers(updatedUsers);
      
          // Limpiamos el formulario y ocultamos la sección de agregar usuario
          setNewUserName("");
          setNewUserEmail("");
          setNewUserStatus("Activo");
          setNewUserMembership("Básico");
          setShowAddUserForm(false);
        };
      
    return (
      <>
      <section className="users-management">
        <div className="table-header">
          <h2 className='libre-Baskerville'>Gestión de Usuarios</h2>
          <div className="header-actions">
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {!showAddUserForm && (
              <button className="back-blue-dark" onClick={() => setShowAddUserForm(true)}>
                Agregar Usuario
              </button>
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
            <div className="form-actions">
              <button type="submit" className="btn-submit">Agregar Usuario</button>
              <button type="button" className="btn-delete" onClick={() => setShowAddUserForm(false)}>
                Cancelar
              </button>
            </div>
          </form>
        )}
  
        <div className="table-container-admin">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Estado</th>
              <th>Membresía</th>
              <th>Último Acceso</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.status}</td>
                  <td>{user.membership}</td>
                  <td>{user.lastLogin}</td>
                  <td className="td-actions">
                    <button className="btn-edit">🖋️</button>
                    <button className="btn-delete">🗑️</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-results">No se encontraron usuarios</td>
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
      </>
    )
  }
)
export default Usuarios