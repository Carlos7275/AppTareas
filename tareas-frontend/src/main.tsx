import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router";

import dev from "./enviroments/enviroment.dev.ts";
import prod from "./enviroments/enviroment.prod.ts";

export const environment =
  process.env.NODE_ENV === "production" ? prod.apiUrl : dev.apiUrl;

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
