import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './Components/Landing';
import SignUpUser from './Components/SignUpUser';
import SignUpBearer from './Components/SignUpBearer';
import Login from './Components/Login';
import RoomWaiting from './Components/RoomWaiting.jsx';
import PageNotFound from './Components/PageNotFound.jsx';
import ProtectedRoute from './Components/ProtectedRoute.jsx';
import Home from './Components/Home';
import Gyms from './Components/Gyms.jsx';
import OfflineDetector from './Components/OfflineDetector.jsx';
import InstructorSignUp from './Components/InstructorSignUp';
import {useUserContext } from './Context/UserContext.jsx';
import Perfil from './Components/Perfil.jsx';
import './Styles/stylesDarkMode.css'
import Administration from './Dashboard_Owner/Administration.jsx';
import Admin from './Components/Admin.jsx';

function App() {
  const { authUser, currentUserData, isLoading } = useUserContext();

  if (isLoading) {
    return (
      <div id='Loader-App'>
        <div className="loader"></div>
      </div>
    );
  }

  const role = currentUserData?.rol || "";
  const userId = authUser?.uid || "";

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            authUser ? (
              <Navigate
                to={
                  role === "user" || role === "owner" || role === "instructor"
                    ? `/Home/${userId}`
                    : role === "admin"
                    ? `/Admin/${userId}`
                    : '/'
                }
                replace
              />
            ) : (
              <Landing />
            )
          }
        />
        {/*Ruta protegida para usuarios autenticados*/}
        <Route
          element={
            <ProtectedRoute emailVerified={currentUserData?.v} user={authUser} role={role} allowedRoles={['user','owner','instructor','admin']} />
          }
        >
          <Route
            path="/Home/:userId"
            element={<Home role={role} userId={userId} user={authUser} />}
          />
          <Route path='/Admin/:userId' element={<Admin userId={userId}/>} />
        <Route path='/administracion/:userId'  element={<Administration currentUserData={currentUserData} />} />
        <Route path='/gimnasios/:userId' element={<Gyms role={role} userId={userId} />} />
        <Route path='/perfil/:userId' element={ <Perfil currentUserData={currentUserData} /> } />
        </Route>

        <Route path="/*" element={<PageNotFound />} />
        <Route path='/registro/usuario' element={<SignUpUser />} />
        <Route path='/registro/propietario' element={<SignUpBearer />} />
        <Route path='/ingreso' element={<Login />} />
        <Route path='/registro/instructor' element={<InstructorSignUp />} />
        <Route path="/area-de-espera" element={<RoomWaiting />} />
      </Routes>
      <OfflineDetector />
    </Router>
  );
}

export default App;
