import React, { useMemo, useState } from 'react';
import NavBarHome from './NavBarHome';
import '../Styles/stylesGyms.css';
import { useUserContext } from '../Context/UserContext.jsx'; 
import AllGyms from './AllGyms.jsx';
import CardGym from './CardGym.jsx';
import Search from './Search.jsx';

const Gyms = React.memo(({ userId, role }) => {
  const { users } = useUserContext();

  const gymsFromContext = useMemo(() => {
    const cachedGyms = sessionStorage.getItem("gyms");
    if (cachedGyms) {
      return JSON.parse(cachedGyms);
    }

    const gyms = users
      .filter((user) => user.rol === 'owner')
      .map((user) => ({
        email: user.email,
        imageProfile: user.imageProfile,
        uid: user.uid,
        province: user.province,
        address: user.address,
        contact: user.numberTelf,
        paid: user.paid || {},
        name_gym: user.name_gym,
        gym_data: user.gymData || {},
      }))
      .slice(0, 100);
    
    sessionStorage.setItem("gyms", JSON.stringify(gyms));
    return gyms;
  }, [users]);

  const [searchTerm, setSearchTerm] = useState('');
  const [province, setProvince] = useState('');
  const [selectedGym, setSelectedGym] = useState(null);

  const filteredGyms = useMemo(() => {
    return gymsFromContext.filter(
      (gym) =>
        (gym.name_gym || '').toLowerCase().includes(searchTerm.toLowerCase()) &&
        (!province || (gym.province || '').includes(province))
    );
  }, [gymsFromContext, searchTerm, province]);
  
  return (
    <>
      <main className="main-gyms">
        <Search
          setSearchTerm={setSearchTerm}
          searchTerm={searchTerm}
          setProvince={setProvince}
        />
        <h3 className="gyms_available">
          Gimnasios disponibles: {filteredGyms.length}
        </h3>
        <div className="gym-list">
          <AllGyms filteredGyms={filteredGyms} setSelectedGym={setSelectedGym} />
          <CardGym selectedGym={selectedGym} setSelectedGym={setSelectedGym} />
        </div>
      </main>
      <NavBarHome role={role} userId={userId} />
    </>
  );
});

export default Gyms;
