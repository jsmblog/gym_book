import { useState } from 'react';

const useGeolocation = (setProvince) => {
  const [loading, setLoading] = useState(false);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const provinceName = await getProvinceFromCoordinates(latitude, longitude);
          setProvince(provinceName);
          setLoading(false);
        },
        (error) => {
          console.error("Error obteniendo la ubicación:", error);
          setLoading(false);
        }
      );
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

  return { getUserLocation, loading };
};

export default useGeolocation;
