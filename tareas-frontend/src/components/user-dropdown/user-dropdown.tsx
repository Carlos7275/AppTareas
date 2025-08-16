import { useState, useRef, useEffect, useCallback, memo } from "react";
import "./user-dropdown.css";
import type { Usuarios } from "../../models/usuarios.model";
import { AuthService } from "../../services/auth.service";
import Swal from "sweetalert2";

const UserAvatar = memo(({ foto, toggle }: { foto: string; toggle: () => void }) => (
  <img
    loading="lazy"
    src={foto}
    className="user-avatar"
    onClick={toggle}
    alt="Usuario"
  />
));

export default function UserDropdown() {
  const [usuario, setUsuario] = useState<Usuarios | null>(null);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const authService = new AuthService();

  // Cargar datos del usuario al montar
  useEffect(() => {
    (async () => {
      try {
        const datos = (await authService.me()).data as Usuarios;
        setUsuario(datos);
      } catch (error: any) {
        Swal.fire(
          "¡Hubo un problema!",
          error?.response?.data?.message || "Error desconocido",
          "error"
        );
      }
    })();
  }, []);

  // Cerrar dropdown al hacer clic fuera
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  // Bloquear scroll de fondo cuando dropdown abierto (móvil)
  useEffect(() => {
    if (isDropdownOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isDropdownOpen]);

  const toggleDropdown = () => setDropdownOpen(prev => !prev);
  const closeDropdown = () => setDropdownOpen(false);

  const handleLogout = async () => {
    await authService.cerrarSesion();
    localStorage.removeItem("jwt");
    window.location.href = "/login";
  };

  if (!usuario) return <div className="p-2 w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>;

  return (
    <div className="split-button p-2 relative" ref={dropdownRef}>
      <UserAvatar foto={usuario.foto} toggle={toggleDropdown} />

      {isDropdownOpen && (
        <div
          className="menu-overlay"
          onClick={(e) => {
            // Cierra solo si se hace click sobre el overlay, no el menú
            if (e.target === e.currentTarget) {
              closeDropdown();
            }
          }}
        >
          <div className="menu">
            <div className="user-info">
              <img src={usuario.foto} alt="Foto usuario" />
              <div>
                <b>{usuario.nombres} {usuario.apellidos}</b>
                <p>{usuario.correo}</p>
              </div>
            </div>

            <hr />

            <button onClick={closeDropdown}>
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
