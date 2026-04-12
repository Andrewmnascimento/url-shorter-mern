import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Input } from './Input';
import { Button } from './Button';
import { useState } from 'react';
export const LoginForm = ({ handleLoginClick, handleRegisterClick }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    return (_jsxs("div", { className: "flex flex-col items-center gap-2 w-full max-w-xl", children: [_jsxs("div", { className: "flex w-full gap-2", children: [_jsx(Input, { placeholder: "Email", type: "email", onKeyDown: () => { }, onChange: event => setEmail(event.currentTarget.value) }), _jsx(Input, { placeholder: "Password", type: "password", onKeyDown: () => { }, onChange: event => setPassword(event.currentTarget.value) })] }), _jsxs("div", { className: "flex w-full gap-2 justify-center", children: [_jsx(Button, { onClick: () => handleLoginClick(email, password), disabled: false, children: "Login" }), _jsx(Button, { onClick: () => handleRegisterClick(email, password), disabled: false, children: "Register" })] })] }));
};
