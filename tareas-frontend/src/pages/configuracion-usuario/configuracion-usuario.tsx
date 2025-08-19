import { NavLink, Outlet } from "react-router";
import "./configuracion-usuario.css";

export default function ConfiguracionUsuario() {
  return (
    <div
      className="container p-0 animate__animated animate__pulse "
      style={{ marginTop: "65px" }}
    >
      <h3 className="fw-bold mb-3">Opciones del usuario</h3>
      <div className="row">
        {/* Barra lateral */}
        <div className="col-md-15 col-xl-2">
          <div className="card  bg-dark   ">
            <div className="list-group list-group-flush">
              <NavLink
                to="perfil"
                className={({ isActive }) =>
                  isActive ? "list-group-item active" : "list-group-item"
                }
              >
                <span className="material-icons">people</span>
                <span className="d-inline p-1">Perfil</span>
              </NavLink>
              <NavLink
                to="cambiar-password"
                className={({ isActive }) =>
                  isActive ? "list-group-item active" : "list-group-item"
                }
              >
                <span className="material-icons">password</span>
                <span className="d-inline p-1">Cambiar contraseña</span>
              </NavLink>
            </div>
          </div>
        </div>

        {}
        <div className="col-md-9 col-xl-10">
          <div className="tab-content">
            <div className="card shadow">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
