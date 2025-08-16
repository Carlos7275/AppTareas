import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router";

import dev from "./enviroments/enviroment.dev.ts";
import prod from "./enviroments/enviroment.prod.ts";
import { GenerosService } from "./services/generos.service.ts";
import { PaisesService } from "./services/paises.service.ts";
import { UsuarioService } from "./services/usuario.service.ts";
import { AuthService } from "./services/auth.service.ts";

export const environment =
  process.env.NODE_ENV === "production" ? prod.apiUrl : dev.apiUrl;



export const generosService = new GenerosService();
export const paisesService = new PaisesService();
export const authService = new AuthService();
export const usuarioService = new UsuarioService();

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
