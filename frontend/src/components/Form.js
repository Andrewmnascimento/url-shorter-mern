import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Input } from "./Input";
import { Button } from "./Button";
export const UrlForm = ({ onShortURLClick, isLoading = false }) => {
    const [longURL, setLongURL] = useState("");
    const [error, setError] = useState("");
    const isValidURL = (url) => {
        try {
            new URL(url);
            return true;
        }
        catch {
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
    return (_jsxs("div", { className: "flex flex-col items-center gap-2 w-full max-w-xl", children: [_jsxs("div", { className: "flex w-full gap-2", children: [_jsx(Input, { type: "text", placeholder: "Insira aqui a sua url", onChange: (event) => setLongURL(event.currentTarget.value), onKeyDown: (event) => event.key == "Enter" && handleSubmit() }), _jsx(Button, { onClick: handleSubmit, disabled: isLoading, children: isLoading ? "Encurtando..." : "Encurtar URL" })] }), error && (_jsx("p", { className: "text-red-500 text-xs self-start", children: error }))] }));
};
