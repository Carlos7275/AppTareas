import "./App.css";
import { Routes } from "react-router";
import Navbar from "./components/navbar/navbar";
import { Route } from "react-router";
import inicio from "./assets/pages/inicio/inicio";
import { PublicRoute } from "./guards/public.guard";
import Login from "./assets/pages/login/login";
import { isTokenExpired } from "./utils/auth.util";
import Swal from "sweetalert2";
import { useEffect } from "react";
import Registro from "./assets/pages/registro/registro";

function App() {
  useEffect(() => {
    verificarToken();
  }, []);

  const verificarToken = () => {
    const token = localStorage.getItem("jwt");
    if (token && isTokenExpired(token)) {
      localStorage.removeItem("jwt");

      Swal.fire(
        "¡Atención!",
        "¡'Su Sesión Expiro, vuelva iniciar sesion para continuar navegando!!'!",
        "info"
      ).then(() => {
        window.location.reload();
      });
    }
  };
  return (
    <>
      <Navbar />
      <Routes>
        <Route Component={inicio} path="/" />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        ></Route>

        <Route
          path="/registro"
          element={
            <PublicRoute>
              <Registro />
            </PublicRoute>
          }
        ></Route>
      </Routes>
    </>
  );
}

export default App;
