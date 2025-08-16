import "./App.css";
import { Navigate, Routes } from "react-router";
import Navbar from "./components/navbar/navbar";
import { Route } from "react-router";
import inicio from "./assets/pages/inicio/inicio";
import { PublicRoute } from "./guards/public.guard";
import Login from "./assets/pages/login/login";
import { isTokenExpired } from "./utils/auth.util";
import Swal from "sweetalert2";
import { useEffect } from "react";
import Registro from "./assets/pages/registro/registro";
import Error404 from "./assets/pages/error404/error404";
import Error500 from "./assets/pages/error500/error500";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTokenRefresher } from "./hooks/useTokenRefresher";
import { ProtectedRoute } from "./guards/protected.guard";
import DashboardTareas from "./assets/pages/dashboard-tareas/dashboard-tareas";
import ConfiguracionUsuario from "./assets/pages/configuracion-usuario/configuracion-usuario";
import Perfil from "./assets/pages/perfil/perfil";
import { UserProvider } from "./providers/user.provider";
import CambiarContra from "./assets/pages/cambiar-contra/cambiar-contra";

function App() {
  useTokenRefresher();

  useEffect(() => {
    setTimeout(() => {
      verificarToken();
    }, 1000);
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
      <UserProvider>
        <Navbar />
        <div id="contenido">
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

            <Route
              element={
                <ProtectedRoute>
                  <DashboardTareas />
                </ProtectedRoute>
              }
              path="dashboard-tareas"
            ></Route>
            <Route
              path="configuracion-usuario"
              element={
                <ProtectedRoute>
                  <ConfiguracionUsuario />
                </ProtectedRoute>
              }
            >
              <Route path="perfil" Component={Perfil}></Route>
              <Route path="cambiar-password" Component={CambiarContra}></Route>
              <Route index element={<Navigate to="perfil" replace />} />{" "}
            </Route>
            <Route path="*" element={<Error404 />} />

            <Route path="error404" Component={Error404}></Route>
            <Route path="error500" Component={Error500}></Route>
          </Routes>
        </div>
      </UserProvider>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
}

export default App;
