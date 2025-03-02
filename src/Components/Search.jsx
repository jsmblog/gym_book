// src/components/Search.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import provinces from '../Js/provinces';
import useGeolocation from '../Hooks/useGeolocation';

const Search = React.memo(({ setSearchTerm, searchTerm, setProvince }) => {
  const navigate = useNavigate();
  const { getUserLocation, loading } = useGeolocation(setProvince);

  const backHome = () => {
    navigate(-1, { replace: true });
  };

  return (
    <>
      <div className="gym-filter">
        <button onClick={backHome} id="go-back-search">←</button>
        <input
          type="text"
          placeholder="🔎 Busca un gimnasio por su nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button className="back-blue-dark" onClick={getUserLocation}>
          Gimnasios cerca
        </button>
        <label>
          Filtrar:{" "}
          <select onChange={(e) => setProvince(e.target.value)} className="province-select" defaultValue="">
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

export default Search;
