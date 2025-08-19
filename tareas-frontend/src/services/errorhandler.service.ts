import { AxiosError } from "axios";
import { toast } from "react-toastify";
import ReactDOM from "react-dom/client";
import Error404 from "../pages/error404/error404";
import Error500 from "../pages/error500/error500";
import React from "react";

export const errorHandler = (error: AxiosError) => {
  if (!error.response) {
    toast.error("Error de red o servidor caído");
    return;
  }

  let ErrorComponent: React.FC | null = null;

  switch (error.response.status) {
    case 403:
      if ((error.response.data as any)?.message === "Acceso denegado") {
        localStorage.removeItem("jwt");
        localStorage.removeItem("usuario");
        window.location.reload();
      }
      toast.error((error.response.data as any)?.message || "Error 403");
      window.location.reload();
      break;

    case 404:
      toast.error((error.response.data as any)?.message || "Recurso no encontrado");
      ErrorComponent = Error404;
      break;

    case 500:
      toast.error("Error interno del servidor");
      ErrorComponent = Error500;
      break;

    default:
      toast.error((error.response.data as any)?.message || error.message);
  }

  if (ErrorComponent) {
    const contenido = ReactDOM.createRoot(document.getElementById("contenido")!);
    contenido.render(React.createElement(ErrorComponent));
  }
};
