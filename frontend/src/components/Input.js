import { jsx as _jsx } from "react/jsx-runtime";
export const Input = ({ placeholder, onChange, type, onKeyDown }) => {
    return _jsx("input", { type: type, placeholder: placeholder, onChange: onChange, onKeyDown: onKeyDown, className: "flex-1 rounded-lg border-2 border-gray-300 h-11 px-4 text-sm focus:outline-none focus:border-black transition-colors" });
};
