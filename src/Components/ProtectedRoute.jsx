import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ user, role, allowedRoles, emailVerified }) => {
  if (!user) return <Navigate to="/" replace />;
  if (!emailVerified || (allowedRoles && !allowedRoles.includes(role))) {
    return <Navigate to="/*" replace />;
  }
  return <Outlet />;
};
export default ProtectedRoute;