import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getIdToken } from "firebase/auth";

const ProtectedRoute = ({ user, role, allowedRoles, emailVerified }) => {
  const [isTokenValid, setIsTokenValid] = useState(false);
  useEffect(() => {
    const validateToken = async () => {
      try {
        if (!user) {
          setIsTokenValid(false);
          return;
        }

        const token = await getIdToken(user, false); 
        setIsTokenValid(token);
       
      } catch (error) {
        console.error("Error al validar el token:", error.message);
        setIsTokenValid(false);
      } 
    };

    validateToken();
  }, [user]);

  if (!user || !isTokenValid) {
    return <Navigate to="/" replace />;
  }

  if (!emailVerified) {
    return <Navigate to="/*" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/*" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
