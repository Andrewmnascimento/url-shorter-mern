import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { UrlForm } from "./components/Form";
import { useState } from "react";
import { LoginForm } from "./components/LoginForm";
import { Button } from "./components/Button";
import Cookies from "js-cookie";
import { useNavigate } from "react-router";
import { saveCreatedLink } from "./lib/dashboard-storage.js";
const API_BASE = import.meta.env.VITE_API_URL ?? "/api";
const BACKEND_URL = import.meta.env.VITE_PUBLIC_URL ?? "http://localhost:3000";
function App() {
    const navigate = useNavigate();
    const [url, setUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(Boolean(Cookies.get("accessToken")));
    const [originalRetry, setOriginalRetry] = useState(false);
    const createUrl = async (longUrl) => {
        const jwtAccessToken = Cookies.get("accessToken");
        const response = await fetch(`${API_BASE}/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(jwtAccessToken ? { "Authorization": `Bearer ${jwtAccessToken}` } : {}) },
            body: JSON.stringify({ longUrl: longUrl }),
            credentials: 'include'
        });
        if (!response.ok)
            throw new Error("Erro ao encurtar a URL.");
        const shortUrl = await response.json();
        return shortUrl;
    };
    const onRefresh = async (err) => {
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
    };
    const onShortURLClick = async (longUrl) => {
        setIsLoading(true);
        setError("");
        setUrl("");
        try {
            const shortUrl = await createUrl(longUrl);
            saveCreatedLink(longUrl, shortUrl);
            setUrl(`${BACKEND_URL}/${shortUrl}`);
        }
        catch (err) {
            await onRefresh(err);
            const shortUrl = await createUrl(longUrl);
            saveCreatedLink(longUrl, shortUrl);
            setUrl(`${BACKEND_URL}/${shortUrl}`);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    const handleLoginClick = async (email, password) => {
        setError("");
        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, password: password }),
                credentials: 'include'
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Erro ao fazer login.");
            }
            setIsLoggedIn(true);
            return true;
        }
        catch (err) {
            const message = err instanceof Error ? err.message : "Erro ao fazer login. Tente Novamente";
            setError(message);
        }
    };
    const handleRegisterClick = async (email, password) => {
        setError("");
        try {
            const response = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, password: password }),
                credentials: 'include'
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Erro ao fazer registro.");
            }
            setIsLoggedIn(true);
            return true;
        }
        catch (err) {
            const message = err instanceof Error ? err.message : "Erro ao registrar. Tente Novamente";
            setError(message);
        }
    };
    const handleLogoutClick = async () => {
        try {
            const response = await fetch(`${API_BASE}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            if (!response.ok)
                throw new Error("Erro ao fazer logout.");
            setIsLoggedIn(false);
        }
        catch {
            setError("Erro ao fazer logout. Tente Novamente");
        }
    };
    return (_jsxs("div", { className: "flex flex-col items-center m-3 w-screen h-screen gap-2", children: [isLoggedIn ? (_jsxs("div", { children: [_jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-4xl font-bold text-gray-900", children: "Encurtador de URL" }), _jsx("p", { className: "text-gray-500 mt-2 text-sm", children: "Cole sua URL longa e obtenha um link curto" })] }), _jsx(UrlForm, { onShortURLClick: onShortURLClick, isLoading: isLoading }), url && (_jsxs("div", { className: "w-full bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between gap-3 shadow-sm", children: [_jsx("span", { className: "text-sm text-gray-700 truncate", children: url }), _jsx(Button, { onClick: handleCopy, children: copied ? "Copiado ✓" : "Copiar" })] })), _jsxs("div", { className: "mt-3 flex gap-2", children: [_jsx(Button, { disabled: false, onClick: () => navigate("/dashboard"), children: "Dashboard" }), _jsx(Button, { disabled: false, onClick: () => handleLogoutClick(), children: "Sair" })] })] })) : (_jsxs("div", { className: "flex flex-col gap-3 justify-center items-center", children: [_jsx("h1", { className: "text-4xl font-bold text-gray-900", children: "Fa\u00E7a Cadastro ou login para acessar o encurtador de URL!!" }), _jsx(LoginForm, { handleLoginClick: handleLoginClick, handleRegisterClick: handleRegisterClick })] })), error && (_jsx("div", { className: "w-full bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3", children: error }))] }));
}
export default App;
