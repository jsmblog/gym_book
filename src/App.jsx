import './App.css';
import { APP, STORAGE, AUTH_USER as auth, db } from './ConfigFirebase/config.js';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './Components/Landing';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import SignUpUser from './Components/SignUpUser';
import SignUpBearer from './Components/SignUpBearer';
import Login from './Components/Login';
import RoomWaiting from './Components/RoomWaiting.jsx';
import PageNotFound from './Components/PageNotFound.jsx';
import ProtectedRoute from './Components/ProtectedRoute.jsx';
import Home from './Components/Home';
import Profile from './Components/Profile';
import Marketplace from './Components/Marketplace';
import Gyms from './Components/Gyms.jsx';
import OfflineDetector from './Components/OfflineDetector.jsx';

function App() {
  const [dataUser, setDataUser] = useState([]);
  const [user, setUser] = useState(null);
  const [emailVerified, setEmailVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState('');
  const userId = user?.uid || '';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const fetchDataUser = async () => {
      if (!user) return;
      try {
        const docRefUser = doc(db, 'USERS', user.uid);
        const docSnap = await getDoc(docRefUser);
        if (docSnap.exists()) {
          const user = docSnap.data();
          setDataUser(user || []);
          setEmailVerified(user.v);
          setRole(user.rol);
        } else {
          console.error('No user data found');
        }
      } catch (error) {
        console.error('Error fetching user data:', error.message);
      }
    };

    fetchDataUser();

    const timer = setTimeout(() => setIsLoading(false), 3000);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [auth, user]);

  if (isLoading) {
    return <div id='Loader-App' >
     <div className="loader"></div>
    </div>;
  }

  return (
    <>
    <Router>
      <Routes>
      <Route
            path="/"
            element={
                user ? (
                    <Navigate
                        to={role === "user" || role === "owner" ? `/Home/${userId}` : role === "admin" ? `/Admin/${userId}` : '/'}
                        replace
                    />
                ) : (
                    <Landing/>
                )
            }
        />
        <Route
            element={<ProtectedRoute emailVerified={emailVerified} user={user} role={role} allowedRoles={['user','owner']} />}
        >
            <Route
                path="/Home/:userId"
                element={
                    <Home role={role} userId={userId}  user={user} />
                }
            />   
        </Route>
        <Route path="/*" element={<PageNotFound />} />
        <Route path='/registro/usuario' element={ <SignUpUser/> } />
        <Route path='/registro/propietario' element={ <SignUpBearer/> } />
        <Route path='/ingreso' element={ <Login/> } />
        <Route path="/area-de-espera" element={<RoomWaiting />} />
        <Route path='/profile/:userId' element={<Profile />} />
        <Route path='/gimnasios/:userId' element={<Gyms  userId={userId} />} />
      </Routes>
    </Router>
    <OfflineDetector/>
    </>

  );
}

export default App;
