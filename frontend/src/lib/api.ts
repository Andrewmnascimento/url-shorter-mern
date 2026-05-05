export const API_BASE = import.meta.env.VITE_API_URL ?? "/api";
export const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  status: number;

  constructor(
    status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const readErrorMessage = async (response: Response, fallback: string) => {
  try {
    const data = (await response.json()) as { error?: unknown };
    if (typeof data.error === "string" && data.error.trim()) {
      return data.error;
    }
  } catch {
    return fallback;
  }

  return fallback;
};

const buildHeaders = (headers?: HeadersInit) => ({
  "Content-Type": "application/json",
  ...headers,
});

export async function requestJson<T>(
  path: string,
  init: RequestInit = {},
  fallbackError = "Erro inesperado.",
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: buildHeaders(init.headers),
  });

  if (!response.ok) {
    throw new ApiError(response.status, await readErrorMessage(response, fallbackError));
  }

  return (await response.json()) as T;
}

export async function requestVoid(
  path: string,
  init: RequestInit = {},
  fallbackError = "Erro inesperado.",
): Promise<void> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: buildHeaders(init.headers),
  });

  if (!response.ok) {
    throw new ApiError(response.status, await readErrorMessage(response, fallbackError));
  }
}

export const buildPublicUrl = (shortUrl: string) => `${PUBLIC_URL}/${shortUrl}`;
