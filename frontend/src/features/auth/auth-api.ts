import { requestJson, requestVoid } from "../../lib/api";

export const login = (email: string, password: string) =>
  requestJson<{ message: string }>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
    "Erro ao fazer login.",
  );

export const register = (email: string, password: string) =>
  requestJson<{ message: string }>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
    "Erro ao registrar.",
  );

export const logout = () =>
  requestVoid(
    "/auth/logout",
    {
      method: "POST",
    },
    "Erro ao fazer logout.",
  );

export const refreshSession = () =>
  requestJson<{ message: string }>(
    "/auth/refresh",
    {
      method: "POST",
    },
    "Erro ao renovar a sessao.",
  );
