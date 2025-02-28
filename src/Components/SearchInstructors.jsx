// src/components/SearchInstructors.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import provinces from '../Js/provinces';
import useGeolocation from '../Hooks/useGeolocation';

const SearchInstructors = React.memo(({ setSearchTerm, searchTerm, setProvince }) => {
  const navigate = useNavigate();
  const { getUserLocation, loading } = useGeolocation(setProvince);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleProvinceChange = (e) => {
    setProvince(e.target.value);
  };

  const backHome = () => {
    navigate(-1, { replace: true });
  };

  return (
    <>
      <div className="gym-filter">
        <button onClick={backHome} id="go-back-search">←</button>
        <input
          type="text"
          placeholder="Busca un instructor por nombre..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
        <button className="back-blue-dark" onClick={getUserLocation}>
          Instructores cerca
        </button>
        <label>
          Filtrar:{" "}
          <select onChange={handleProvinceChange} className="province-select" defaultValue="">
            <option value="">-- Todas las provincias --</option>
            {provinces.map((p, index) => (
              <optgroup key={index} label={p.provincia}>
                {p.cantones.sort().map((canton, i) => (
                  <option value={`${p.provincia} ${canton}`} key={i}>{canton}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
      </div>

      {loading && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="loader-search"></div>
          </div>
        </div>
      )}
    </>
  );
});

export default SearchInstructors;
