import type { JSX } from "react";
import { Navigate } from "react-router";

interface PublicRouteProps {
  children: JSX.Element;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const token = localStorage.getItem("jwt");

  if (token) {
    // Si ya está logueado, redirige al dashboard
    return <Navigate to="/" replace />;
  }

  return children;
};
