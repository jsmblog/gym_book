import React, { useState, useEffect } from "react";

const OfflineDetector = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null; // No mostrar nada si hay conexión

  return (
    <div className="offline-warning fade-in">
      ⚠️ Sin conexión a Internet. Verifica tu conexión.
    </div>
  );
};

export default OfflineDetector;