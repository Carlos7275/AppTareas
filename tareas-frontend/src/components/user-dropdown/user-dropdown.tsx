import { useState, useRef, useEffect, useCallback } from "react";
import "./user-dropdown.css";
import type { Usuarios } from "../../models/usuarios.model";
import { useNavigate } from "react-router";
import { authService } from "../../main";
import { useUser } from "../../providers/user.provider";
import { errorHandler } from "../../services/errorhandler.service";

function UserAvatar({ foto, toggle }: { foto: string; toggle: () => void }) {
  return (
    <img
      loading="lazy"
      src={foto}
      className="user-avatar"
      onClick={toggle}
      alt="Usuario"
    />
  );
}

export default function UserDropdown() {
  const { usuario, setUsuario } = useUser();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigator = useNavigate();

  // Cargar datos del usuario al montar
  useEffect(() => {
    (async () => {
      try {
        const datos = (await authService.me()).data as Usuarios;
        setUsuario(datos);
      } catch (error: any) {
        errorHandler(error);
      }
    })();
  }, []);

  // Cerrar dropdown al hacer clic fuera
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);
  const closeDropdown = () => setDropdownOpen(false);

  const handleLogout = async () => {
    await authService.cerrarSesion();
    localStorage.removeItem("jwt");
    window.location.href = "/login";
  };

  if (!usuario)
    return (
      <div className="p-2 w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
    );

  return (
    <div className="split-button p-2 relative" ref={dropdownRef}>
      <UserAvatar foto={usuario.foto} toggle={toggleDropdown} />

      {isDropdownOpen && (
        <div
          className="menu-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeDropdown();
            }
          }}
        >
          <div className="menu">
            <div className="user-info">
              <img src={usuario.foto} alt="Foto usuario" />
              <div>
                <b>
                  {usuario.nombres} {usuario.apellidos}
                </b>
                <p>{usuario.correo}</p>
              </div>
            </div>

            <hr />

            <button
              onClick={() => {
                closeDropdown();
                navigator("configuracion-usuario");
              }}
            >
              <span className="material-icons">perm_identity</span>
              Configuración de Usuario
            </button>

            <button
              className="logout"
              onClick={() => {
                handleLogout();
                closeDropdown();
              }}
            >
              <span className="material-icons">logout</span>
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
