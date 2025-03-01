import React, { useMemo, useState } from 'react';
import NavBarHome from './NavBarHome';
import '../Styles/stylesGyms.css'; // Hoja de estilos externa
import { useUserContext } from '../Context/UserContext.jsx'; 

// Componentes existentes para Gimnasios
import AllGyms from './AllGyms.jsx';
import CardGym from './CardGym.jsx';
import Search from './Search.jsx';

// NUEVOS componentes para Instructores (ejemplos)
import AllInstructors from './AllInstructors.jsx';
import CardInstructor from './CardInstructor.jsx';
import SearchInstructors from './SearchInstructors.jsx';
import decrypt from '../Js/decrypt.js';

const Gyms = React.memo(({ userId, role }) => {
  const { users } = useUserContext();

  const [activeTab, setActiveTab] = useState('gyms');

  const gymsFromContext = useMemo(() => {
    const cachedGyms = sessionStorage.getItem('gyms');
    if (cachedGyms) {
      return JSON.parse(cachedGyms);
    }
    const gyms = users
      .filter((user) => user.rol === 'owner')
      .map((user) => ({
        email: user.email,
        imageProfile: user.imageProfile,
        uid: user.uid,
        country: user.country,
        province: user.province,
        address: user.address,
        contact: user.numberTelf,
        paid: user.paid || {},
        name_gym: user.name_gym,
        gym_data: user.gymData || {},
      }))
      .slice(0, 100);

    sessionStorage.setItem('gyms', JSON.stringify(gyms));
    return gyms;
  }, [users]);

  const [searchTermGym, setSearchTermGym] = useState('');
  const [provinceGym, setProvinceGym] = useState('');
  const [selectedGym, setSelectedGym] = useState(null);

  const filteredGyms = useMemo(() => {
    return gymsFromContext.filter(
      (gym) =>
        (gym.name_gym || '')
          .toLowerCase()
          .includes(searchTermGym.toLowerCase()) &&
        (!provinceGym || (gym.province || '').includes(provinceGym))
    );
  }, [gymsFromContext, searchTermGym, provinceGym]);

  const instructorsFromContext = useMemo(() => {
    const cachedInstructors = sessionStorage.getItem('instructors');
    if (cachedInstructors) {
      return JSON.parse(cachedInstructors);
    }
    const instructors = users
      .filter((user) => user.rol === 'instructor')
      .map((user) => ({
        email: user.email,
        imageProfile: user.imageProfile,
        uid: user.uid,
        birth: user.birth,
        country: user.country,
        province: user.province,
        address: user.address,
        contact: user.numberTelf,
        paid: user.paid || {},
        name_instructor: user.name,
        instructor_data: user.instr || {},
      }))
      .slice(0, 100);

    sessionStorage.setItem('instructors', JSON.stringify(instructors));
    return instructors;
  }, [users]);

  const [searchTermInstructor, setSearchTermInstructor] = useState('');
  const [provinceInstructor, setProvinceInstructor] = useState('');
  const [selectedInstructor, setSelectedInstructor] = useState(null);

  const filteredInstructors = useMemo(() => {
    return instructorsFromContext.filter(
      (inst) =>
        (inst.name_instructor || '')
          .toLowerCase()
          .includes(searchTermInstructor.toLowerCase()) &&
        (!provinceInstructor || (inst.province || '').includes(provinceInstructor))
    );
  }, [instructorsFromContext, searchTermInstructor, provinceInstructor]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <>
      <main className="main-gyms">
        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'gyms' ? 'active' : ''}`}
            onClick={() => handleTabChange('gyms')}
          >
            Gimnasios
          </button>
          <button
            className={`tab-button ${activeTab === 'instructors' ? 'active' : ''}`}
            onClick={() => handleTabChange('instructors')}
          >
            Instructores
          </button>
        </div>
        <div className={`tab-content ${activeTab === 'gyms' ? 'active' : ''}`}>
          <Search
            setSearchTerm={setSearchTermGym}
            searchTerm={searchTermGym}
            setProvince={setProvinceGym}
          />
          <h3 className="gyms_available">
            Gimnasios disponibles: {filteredGyms.length}
          </h3>
          <div className="gym-list">
            <AllGyms filteredGyms={filteredGyms} setSelectedGym={setSelectedGym} />
            <CardGym selectedGym={selectedGym} setSelectedGym={setSelectedGym} />
          </div>
        </div>

        <div className={`tab-content ${activeTab === 'instructors' ? 'active' : ''}`}>
          <SearchInstructors
            setSearchTerm={setSearchTermInstructor}
            searchTerm={searchTermInstructor}
            setProvince={setProvinceInstructor}
          />
          <h3 className="gyms_available">
            Instructores disponibles: {filteredInstructors.length}
          </h3>
          <div className="gym-list">
            <AllInstructors
              filteredInstructors={filteredInstructors}
              setSelectedInstructor={setSelectedInstructor}
            />
            <CardInstructor
              selectedInstructor={selectedInstructor}
              setSelectedInstructor={setSelectedInstructor}
            />
          </div>
        </div>
      </main>

      <NavBarHome role={role} userId={userId} />
    </>
  );
});

export default Gyms;
