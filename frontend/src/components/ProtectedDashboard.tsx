import Cookies from "js-cookie";
import { Navigate } from "react-router";
import { UserDashboard } from './pages/UserDashboard';

export const ProtectedDashboard = () => {
  const accessToken = Cookies.get("accessToken");

  if (!accessToken) {
    return <Navigate to="/" replace />;
  }

  return <UserDashboard />;
};