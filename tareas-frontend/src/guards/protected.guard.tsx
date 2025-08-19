import  type { JSX } from "react";
import { Navigate } from "react-router";

interface ProtectedRouteProps {
  children: JSX.Element;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const token = localStorage.getItem("jwt"); // o tu estado de auth

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
