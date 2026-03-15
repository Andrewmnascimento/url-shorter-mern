import { UrlForm } from "./components/Form"
import { useState } from "react"
import { LoginForm } from "./components/LoginForm";
import { Button } from "./components/Button";
import Cookies from "js-cookie";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";
const BACKEND_URL = import.meta.env.VITE_PUBLIC_URL ?? "http://localhost:3000";

function App() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [originalRetry, setOriginalRetry] = useState(false);

  const createUrl = async (longUrl: string) => {
    const jwtAccessToken = Cookies.get("accessToken");
    const response = await fetch(`${API_BASE}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(jwtAccessToken ? { "Authorization": `Bearer ${jwtAccessToken}` } : {})},
      body: JSON.stringify({ longUrl: longUrl}),
      credentials: 'include'
    });
    if (!response.ok) throw new Error("Erro ao encurtar a URL.");
    const shortUrl = await response.json();
    return shortUrl;
  };

  const onRefresh = async (err: { code?: number }): Promise<string | undefined> => {
    setOriginalRetry(true);
    if (err.code === 401 && originalRetry) {
      const responseRefresh = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        credentials: "include"
      });
      if (responseRefresh.ok) {
        return "Deu tudo certo!";
      }
    }
    return undefined;
  }

  const onShortURLClick = async (longUrl: string) => {
    setIsLoading(true);
    setError("");
    setUrl("");
    try{
      const shortUrl = await createUrl(longUrl);
      setUrl(`${BACKEND_URL}/${shortUrl}`);
    } catch (err: unknown) {
      await onRefresh(err as { code?: number });
      const shortUrl = await createUrl(longUrl);
      setUrl(`${BACKEND_URL}/${shortUrl}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLoginClick = async (email: string, password: string) => {
    setError("");
    try{
      const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({ email: email, password: password }),
      credentials: 'include'
    });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao fazer login.");
      }
      setIsLoggedIn(true);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao fazer login. Tente Novamente";
      setError(message);
    }
  };

  const handleRegisterClick = async (email: string, password: string) => {
    setError("");
    try{
      const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({ email: email, password: password }),
      credentials: 'include'
    });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao fazer registro.");
      }
      setIsLoggedIn(true);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao registrar. Tente Novamente";
      setError(message);
    }
  };

  const handleLogoutClick = async () => {
    try{
      const response = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
      if (!response.ok) throw new Error("Erro ao fazer logout.");
      setIsLoggedIn(false);
    } catch {
      setError("Erro ao fazer logout. Tente Novamente");
    }
  }

  return (
    <div className="flex flex-col items-center m-3 w-screen h-screen gap-2">
      {isLoggedIn ? ( 
        <div>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">Encurtador de URL</h1>
            <p className="text-gray-500 mt-2 text-sm">Cole sua URL longa e obtenha um link curto</p>
          </div>

          <UrlForm onShortURLClick={onShortURLClick} isLoading={isLoading}/>

          {url && (
            <div className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between gap-3 shadow-sm">
              <span className="text-sm text-gray-700 truncate">{url}</span>
              <Button
                onClick={handleCopy}
              >
                {copied ? "Copiado ✓" : "Copiar"}
              </Button>
            </div>
          )}
          <Button disabled={false} onClick={() => handleLogoutClick()}>Sair</Button>
        </div>
      ): (
        <div className="flex flex-col gap-3 justify-center items-center">
          <h1 className="text-4xl font-bold text-gray-900">Faça Cadastro ou login para acessar o encurtador de URL!!</h1>
          <LoginForm handleLoginClick={handleLoginClick} handleRegisterClick={handleRegisterClick} />
        </div>
      )}
      {error && (
            <div className="w-full bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}
    </div>
  )
}

export default App
