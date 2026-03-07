import { Form } from "./components/Form"
import { useState } from "react"

function App() {
  const [url, setUrl] = useState("");
  const [isHidden, setIsHidden] = useState(true);
  const createUrl = async (longUrl: string) => {
    const response = await fetch("http://localhost:3000/api", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({ longUrl: longUrl}),
    });
    const shortUrl = await response.json();
    return shortUrl;
  };
  const onShortURLClick = async (longUrl: string) => {
    console.log('clicou, longUrl:', longUrl);
    const shortUrl = await createUrl(longUrl);
    setUrl("http://localhost:3000/api?shortURL=" + shortUrl)
    setIsHidden(false);
  };

  return (
    <div className="flex flex-col items-center m-3 w-screen h-screen gap-2">
      <h1 className="text-3xl font-bold">Encurtador de url</h1>
      <Form onShortURLClick={onShortURLClick} />
      <div className={ isHidden ? 'hidden' : ''}>
        <h1>A URL encurtada é {url}</h1>
      </div>        
    </div>
  )
}

export default App
