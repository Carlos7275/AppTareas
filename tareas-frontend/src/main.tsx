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
import { TareasService } from "./services/tareas.service.ts";
import { TitleService } from "./services/title.service.ts";
import { ReporteService } from "./services/reportes.service.ts";

export const environment =
  process.env.NODE_ENV === "production" ? prod.apiUrl : dev.apiUrl;

export const generosService = new GenerosService();
export const paisesService = new PaisesService();
export const authService = new AuthService();
export const usuarioService = new UsuarioService();
export const tareasService = new TareasService();
export const titleService = new TitleService();
export const reportesService = new ReporteService();

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
