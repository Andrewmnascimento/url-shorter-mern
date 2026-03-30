import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router";
import App from './App';
import { ProtectedDashboard } from './components/ProtectedDashboard';

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/dashboard", element: <ProtectedDashboard /> }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
