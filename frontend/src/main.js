import { jsx as _jsx } from "react/jsx-runtime";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router";
import App from './App';
import { ProtectedDashboard } from './components/ProtectedDashboard';
const router = createBrowserRouter([
    { path: "/", element: _jsx(App, {}) },
    { path: "/dashboard", element: _jsx(ProtectedDashboard, {}) }
]);
createRoot(document.getElementById('root')).render(_jsx(StrictMode, { children: _jsx(RouterProvider, { router: router }) }));
