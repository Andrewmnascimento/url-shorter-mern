import Cookies from "js-cookie";
import { useState } from "react";
import { login, logout, register } from "../auth-api";

export function useAuthSession() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(Cookies.get("accessToken")));

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    setIsLoggedIn(true);
  };

  const handleRegister = async (email: string, password: string) => {
    await register(email, password);
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    await logout();
    Cookies.remove("accessToken");
    setIsLoggedIn(false);
  };

  return {
    isLoggedIn,
    handleLogin,
    handleRegister,
    handleLogout,
  };
}
