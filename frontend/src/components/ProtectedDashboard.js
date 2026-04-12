import { jsx as _jsx } from "react/jsx-runtime";
import Cookies from "js-cookie";
import { Navigate } from "react-router";
import { UserDashboard } from './pages/UserDashboard';
export const ProtectedDashboard = () => {
    const accessToken = Cookies.get("accessToken");
    if (!accessToken) {
        return _jsx(Navigate, { to: "/", replace: true });
    }
    return _jsx(UserDashboard, {});
};
