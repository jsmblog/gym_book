import React, { useEffect, useMemo, useState } from 'react';
import NavBarHome from './NavBarHome';
import '../Styles/stylesGyms.css';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from '../ConfigFirebase/config.js';
import decrypt from '../Js/decrypt';
import AllGyms from './AllGyms.jsx';
import CardGym from './CardGym.jsx';
import Search from './Search.jsx';

const Gyms = React.memo(({ userId,role }) => {
  const [gyms, setGyms] = useState(() => {
    const savedGyms = sessionStorage.getItem('gymsData');
    return savedGyms ? JSON.parse(savedGyms) : [];
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [province, setProvince] = useState('');
  const [selectedGym, setSelectedGym] = useState(null);

  useEffect(() => {
    if (gyms.length === 0) {
      (async () => {
        const snapshot = await getDocs(
          query(collection(db, 'USERS'), where('rol', '==', 'owner'), limit(100))
        );

        const gymsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            email: decrypt(data.e),
            imageProfile: decrypt(data.img),
            uid: data.uid,
            province: decrypt(data.pro),
            address: decrypt(data.dir),
            contact: decrypt(data.tel),
            name_gym: decrypt(data.n_g).toLowerCase(),
            gym_data: data.gymData || {}
          };
        });

        setGyms(gymsData);
        sessionStorage.setItem('gymsData', JSON.stringify(gymsData));
      })();
    }
  }, [gyms]);

  const filteredGyms = useMemo(() => {
    return gyms.filter(gym =>
      gym.name_gym.includes(searchTerm.toLowerCase()) &&
      (!province || gym.province.includes(province))
    );
  }, [gyms, searchTerm, province]);

  return (
    <>
      <main className="main-gyms">
        <Search 
          setSearchTerm={setSearchTerm} 
          searchTerm={searchTerm} 
          setProvince={setProvince} 
          filteredGyms={filteredGyms} 
        />
        <h3 className='gyms_available' >Gimnasios disponibles : {filteredGyms.length}</h3>
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
