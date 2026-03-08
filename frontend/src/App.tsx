import { Form } from "./components/Form"
import { useState } from "react"

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000"

function App() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const createUrl = async (longUrl: string) => {
    const response = await fetch(`${API_BASE}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({ longUrl: longUrl}),
    });
    if (!response.ok) throw new Error("Erro ao encurtar a URL.");
    const shortUrl = await response.json();
    return shortUrl;
  };
  const onShortURLClick = async (longUrl: string) => {
    setIsLoading(true);
    setError("");
    setUrl("");
    try{
      const shortUrl = await createUrl(longUrl);
      setUrl(`${API_BASE}/${shortUrl}`);
    } catch {
      setError("Não foi possivel encurtar a URL. Tente Novamente");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center m-3 w-screen h-screen gap-2">
      <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Encurtador de URL</h1>
          <p className="text-gray-500 mt-2 text-sm">Cole sua URL longa e obtenha um link curto</p>
      </div>

      <Form onShortURLClick={onShortURLClick} isLoading={isLoading}/>
      {error && (
          <div className="w-full bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

      {url && (
         <div className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between gap-3 shadow-sm">
         <span className="text-sm text-gray-700 truncate">{url}</span>
         <button
          onClick={handleCopy}
          className="shrink-0 text-sm font-semibold px-4 py-1.5 rounded-md bg-black text-white hover:bg-gray-800 transition-colors"
          >
          {copied ? "Copiado ✓" : "Copiar"}
          </button>
          </div>
      )}      
    </div>
  )
}

export default App
