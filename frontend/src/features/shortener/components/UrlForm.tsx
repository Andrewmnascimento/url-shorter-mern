import { useState } from "react";
import { Input } from "../../../components/Input";
import { Button } from "../../../components/Button";

interface FormProps {
  onShortURLClick: (longURL: string) => Promise<void> | void;
  isLoading?: boolean;
}

const isValidURL = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const UrlForm = ({ onShortURLClick, isLoading = false }: FormProps) => {
  const [longURL, setLongURL] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!longURL.trim()) {
      setError("Por favor, insira uma URL.");
      return;
    }

    if (!isValidURL(longURL)) {
      setError("URL invalida. Inclua http:// ou https://");
      return;
    }

    setError("");
    void onShortURLClick(longURL);
  };

  return (
    <div className="grid gap-2">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Cole aqui sua URL longa"
          value={longURL}
          onChange={(event) => setLongURL(event.currentTarget.value)}
          onKeyDown={(event) => event.key === "Enter" && handleSubmit()}
        />
        <Button className="sm:w-auto" disabled={isLoading} onClick={handleSubmit}>
          {isLoading ? "Encurtando..." : "Encurtar URL"}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};
