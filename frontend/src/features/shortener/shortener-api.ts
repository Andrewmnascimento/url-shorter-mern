import Cookies from "js-cookie";
import { ApiError, requestJson } from "../../lib/api";
import { refreshSession } from "../auth/auth-api";

const createRequest = (longUrl: string) =>
  requestJson<string>(
    "/",
    {
      method: "POST",
      headers: Cookies.get("accessToken")
        ? { Authorization: `Bearer ${Cookies.get("accessToken")}` }
        : undefined,
      body: JSON.stringify({ longUrl }),
    },
    "Erro ao encurtar a URL.",
  );

export const createShortUrl = async (longUrl: string) => {
  try {
    return await createRequest(longUrl);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      await refreshSession();
      return await createRequest(longUrl);
    }

    throw error;
  }
};
