import { useState } from "react";

interface FormProps {
  onShortURLClick: (longURL: string) => void;
}

export const Form = ({ onShortURLClick }: FormProps) => {
  const [longURL, setLongURL] = useState("");
  return (
    <div className="flex flex-col items-center gap-3">
      <input type="text" placeholder="Insira aqui a sua url" className="rounded-md border-black border-2 w-125 h-10 p-3" onChange={(event) => setLongURL(event.currentTarget.value)}/>
      <button className="w-40 rounded-md border-black border-4 bg-black text-white font-bold" onClick={() => onShortURLClick(longURL)}>Encurtar URL</button>
    </div>
  )
};