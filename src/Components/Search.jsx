import React, { useState } from 'react';
import provinces from '../Js/provinces';
import { useNavigate } from 'react-router-dom';

const Search = React.memo(({ setSearchTerm, searchTerm, setProvince }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const backHome = () => {
    navigate(-1, { replace: true });
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const provinceName = await getProvinceFromCoordinates(latitude, longitude);
        setProvince(provinceName);
        setLoading(false);
      }, (error) => {
        console.error("Error obteniendo la ubicación:", error);
        setLoading(false);
      });
    } else {
      console.error("Geolocalización no soportada en este navegador.");
    }
  };

  const getProvinceFromCoordinates = async (lat, lon) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
      const data = await response.json();
      return data.address.state || "";
    } catch (error) {
      console.error("Error obteniendo la provincia:", error);
      return "";
    }
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
          Buscar por mi ubicación
        </button>
        <label>
          Filtrar: {" "}
          <select onChange={(e) => setProvince(e.target.value)} className="province-select">
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
