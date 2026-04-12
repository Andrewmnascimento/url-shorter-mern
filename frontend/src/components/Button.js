import { jsx as _jsx } from "react/jsx-runtime";
export const Button = ({ onClick, disabled, children }) => {
    return (_jsx("button", { className: "rounded-lg bg-black text-white font-semibold px-5 h-11 text-sm\n                 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed\n                 transition-colors whitespace-nowrap", onClick: onClick, disabled: disabled, children: children }));
};
