import React from 'react'
import provinces from '../Js/provinces';
import { useNavigate } from 'react-router-dom';

const Search = React.memo(({setSearchTerm,searchTerm,setProvince,filteredGyms}) => {
  const navigate = useNavigate();
  const backHome = () => {
    navigate(-1, { replace: true });
};  
  return (
      <>
      <div className="gym-filter">
      <button onClick={backHome} id='go-back-search'>←</button>
            <input
              type="text"
              placeholder="🔎 Busca un gimnasio por su nombre..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <label>
              filtrar: {" "}
              <select onChange={e => setProvince(e.target.value)} className="province-select">
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
      </>
    )
});

export default Search