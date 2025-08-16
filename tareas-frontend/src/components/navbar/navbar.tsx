import { useEffect, useState } from "react";
import "./navbar.css";
import { Link } from "react-router";
import UserDropdown from "../user-dropdown/user-dropdown";

function Navbar() {
  const body = document.body;

  const [menuActivo, setMenuActivo] = useState(false);
  const [temaOscuro, setTemaOscuro] = useState(
    localStorage.getItem("dark-theme") === "true"
  );
  const [scrolled, setScrolled] = useState(false);

  const toggleMenu = () => {
    setMenuActivo(!menuActivo);
  };

  const toggleTema = () => {
    const nuevoTema = !temaOscuro;

    console.log(nuevoTema)
    body.setAttribute("data-bs-theme", nuevoTema ? "dark" : "light");

    setTemaOscuro(nuevoTema);

    localStorage.setItem("dark-theme", nuevoTema.toString());
    document.documentElement.classList.toggle("dark-theme", nuevoTema);
  };

  const rutasValidas = ["/"];

  useEffect(() => {
    const isRutaValida = rutasValidas.includes(location.pathname);

    const onScroll = () => {
      if (isRutaValida) {
        setScrolled(window.scrollY > 50);
      } else {
        setScrolled(true);
      }
    };

    if (isRutaValida) {
      window.addEventListener("scroll", onScroll);
      setScrolled(window.scrollY > 50); // Evalúa estado inicial si es válida
    } else {
      setScrolled(true); // Asegura que no aplique la clase
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [location.pathname]);

  useEffect(() => {
    body.setAttribute("data-bs-theme", temaOscuro ? "dark" : "light");

    if (temaOscuro) {
      document.documentElement.classList.add("dark-theme");
    } else {
      document.documentElement.classList.remove("dark-theme");
    }
  }, [temaOscuro]);

  const getLinkClass = (path: any) => {
    return location.pathname === path ? "active" : "";
  };

  const closeMenuOnLinkClick = () => {
    if (menuActivo) {
      setMenuActivo(false);
    }
  };

  const isLogin = localStorage.getItem("jwt") != null;

  return (
    <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <div className="logo">
        <Link to="/" onClick={closeMenuOnLinkClick}>
          <img src="/images/logo.png" alt="Logo" />
          <span className="logo-title">TodoList</span>
        </Link>
      </div>

      <ul className={`navbar_items ${menuActivo ? "active" : ""}`}>
        <li>
          <Link
            to="/"
            className={getLinkClass("/")}
            onClick={closeMenuOnLinkClick}
          >
            Inicio
          </Link>
        </li>

        {isLogin && (
          <li>
            <Link
              to="/dashboard-tareas"
              className={getLinkClass("/")}
              onClick={closeMenuOnLinkClick}
            >
              Tareas
            </Link>
          </li>
        )}

        <li>
          <a onClick={toggleTema} style={{ cursor: "pointer" }}>
            <i
              id="btn_tema"
              className={`bi ${temaOscuro ? "bi-moon" : "bi-sun"} text-light`}
            ></i>
          </a>
        </li>
        {isLogin ? (
          <li>
            <UserDropdown />
          </li>
        ) : (
          <li>
            <Link to={"/login"}>Iniciar Sesión</Link>
          </li>
        )}
      </ul>

      <span className="navbar-button" onClick={toggleMenu}>
        <i
          className={`fa ${!menuActivo ? "bi bi-list" : "bi bi-x-lg"}`}
          id="btn_navbar"
        ></i>
      </span>
    </nav>
  );
}

export default Navbar;
