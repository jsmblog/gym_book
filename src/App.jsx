// App.jsx
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
import Profile from './Components/Profile';
import Gyms from './Components/Gyms.jsx';
import OfflineDetector from './Components/OfflineDetector.jsx';
import InstructorSignUp from './Components/InstructorSignUp';
import { AuthProvider, useUserContext } from './Context/UserContext.jsx';

function AppContent() {
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
        <Route
          element={
            <ProtectedRoute emailVerified={currentUserData?.v} user={authUser} role={role} allowedRoles={['user','owner','instructor']} />
          }
        >
          <Route
            path="/Home/:userId"
            element={<Home role={role} userId={userId} user={authUser} />}
          />
        </Route>
        <Route path="/*" element={<PageNotFound />} />
        <Route path='/registro/usuario' element={<SignUpUser />} />
        <Route path='/registro/propietario' element={<SignUpBearer />} />
        <Route path='/ingreso' element={<Login />} />
        <Route path='/registro/instructor' element={<InstructorSignUp />} />
        <Route path="/area-de-espera" element={<RoomWaiting />} />
        <Route path='/profile/:userId' element={<Profile />} />
        <Route path='/gimnasios/:userId' element={<Gyms userId={userId} />} />
      </Routes>
      <OfflineDetector />
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
