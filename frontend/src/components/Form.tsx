import { useState } from "react";

interface FormProps {
  onShortURLClick: (longURL: string) => void;
  isLoading?: boolean;
}

export const Form = ({ onShortURLClick, isLoading = false }: FormProps) => {
  const [longURL, setLongURL] = useState("");
  const [error, setError] = useState("");
  
  const isValidURL = (url: string) => {
    try{
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = () => {
    if (!longURL.trim()) {
      setError("Por favor, insira uma URL.");
      return;
    }
    if (!isValidURL(longURL)) {
      setError("URL inválida. Inclua http:// ou https://");
      return;
    }
    setError("");
    onShortURLClick(longURL);
  };

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-xl">
      <div className="flex w-full gap-2">
        <input type="text" 
        placeholder="Insira aqui a sua url" 
        className="flex-1 rounded-lg border-2 border-gray-300 h-11 px-4 text-sm focus:outline-none focus:border-black transition-colors" 
        onChange={(event) => setLongURL(event.currentTarget.value)}
        onKeyDown={ (event) => event.key == "Enter" && handleSubmit()}
        />
        <button 
        className="rounded-lg bg-black text-white font-semibold px-5 h-11 text-sm
                     hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors whitespace-nowrap" 
        onClick={handleSubmit}
        disabled={isLoading}
        >
        {isLoading ? "Encurtando..." : "Encurtar URL"}
        </button>
      </div>

      {error && (
        <p className="text-red-500 text-xs self-start">{error}</p>
      )}
    </div>
  )
};