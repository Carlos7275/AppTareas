import "./App.css";
import { Navigate, Routes, Route } from "react-router";
import Navbar from "./components/navbar/navbar";
import { PublicRoute } from "./guards/public.guard";
import { ProtectedRoute } from "./guards/protected.guard";
import { isTokenExpired } from "./utils/auth.util";
import Swal from "sweetalert2";
import { useEffect, Suspense, lazy } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTokenRefresher } from "./hooks/useTokenRefresher";
import { UserProvider } from "./providers/user.provider";
import InicioTareas from "./pages/inicio-tareas/inicio-tareas";
import Tareas from "./pages/tareas/tareas";
import { CircularProgress } from "@mui/material";
import Footer from "./components/footer/footer";

const Inicio = lazy(() => import("./pages/inicio/inicio"));
const Login = lazy(() => import("./pages/login/login"));
const Registro = lazy(() => import("./pages/registro/registro"));
const Error404 = lazy(() => import("./pages/error404/error404"));
const Error500 = lazy(() => import("./pages/error500/error500"));
const DashboardTareas = lazy(
  () => import("./pages/dashboard-tareas/dashboard-tareas")
);
const ConfiguracionUsuario = lazy(
  () => import("./pages/configuracion-usuario/configuracion-usuario")
);
const Perfil = lazy(() => import("./pages/perfil/perfil"));
const CambiarContra = lazy(
  () => import("./pages/cambiar-contra/cambiar-contra")
);

const DescargasLazy = lazy(() => import("./pages/descargas/descargas"));
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
        "¡Su sesión expiró, vuelva a iniciar sesión para continuar navegando!",
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
          <Suspense
            fallback={
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100vh",
                  width: "100%",
                }}
              >
                <CircularProgress />
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Inicio />} />

              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />

              <Route
                path="/registro"
                element={
                  <PublicRoute>
                    <Registro />
                  </PublicRoute>
                }
              />

              <Route
                path="dashboard-tareas"
                element={
                  <ProtectedRoute>
                    <DashboardTareas />
                  </ProtectedRoute>
                }
              >
                <Route path="inicio" element={<InicioTareas />} />
                <Route path="tareas" element={<Tareas />} />
                <Route path="descargas" element={<DescargasLazy />}></Route>
                <Route index element={<Navigate to="inicio" replace />} />
              </Route>

              <Route
                path="configuracion-usuario"
                element={
                  <ProtectedRoute>
                    <ConfiguracionUsuario />
                  </ProtectedRoute>
                }
              >
                <Route path="perfil" element={<Perfil />} />
                <Route path="cambiar-password" element={<CambiarContra />} />
                <Route index element={<Navigate to="perfil" replace />} />
              </Route>

              <Route path="*" element={<Error404 />} />
              <Route path="error404" element={<Error404 />} />
              <Route path="error500" element={<Error500 />} />
            </Routes>
          </Suspense>
        </div>
        <Footer />
      </UserProvider>

      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
}

export default App;
