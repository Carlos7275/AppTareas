import { useEffect, useRef, useState } from "react";
import { titleService } from "../../main";
import "./dashboards-tareas.css";
import { NavLink, Outlet } from "react-router";

export default function Admin() {
  const [sidenavActivado, setSidenavActivado] = useState(false);

  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    titleService.setTitle("Panel de tareas");
    DeshabilitarMenu();
  }, []);

  const menuBtnChange = () => {
    if (sidebarRef.current && closeBtnRef.current) {
      if (sidenavActivado) {
        closeBtnRef.current.classList.replace("bx-menu", "bx-menu-alt-right");
      } else {
        closeBtnRef.current.classList.replace("bx-menu-alt-right", "bx-menu");
      }
    }
  };

  const toggleSidebar = () => {
    setSidenavActivado((prev) => !prev);
  };

  useEffect(() => {
    menuBtnChange();
  }, [sidenavActivado]);

  const DeshabilitarMenu = () => {
    const menu = document.querySelector("nav");
    if (menu) {
      menu.classList.add("disabled");
      setSidenavActivado(false);
    }
  };

  return (
    <>
      <div
        ref={sidebarRef}
        className={`sidebar shadow rounded-1 ${sidenavActivado ? "open" : ""}`}
        id="sidebar"
      >
        <i
          ref={closeBtnRef}
          className="bx bx-menu text-body"
          role="button"
          id="btn"
          onClick={toggleSidebar}
        ></i>

        <ul className="nav-list list-unstyled">
          <li>
            <NavLink
              to="inicio"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <i className="bx bx-grid-alt"></i>
              <span className="links_name ms-2">Inicio</span>
              <span className="tooltip">Inicio</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="tareas">
              <i className="bx bx-list-ul"></i>
              <span className="links_name ms-2">Tareas</span>
              <span className="tooltip">Tareas</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="descargas">
              <i className="bx bx-download"></i>
              <span className="links_name ms-2">Descargas</span>
              <span className="tooltip">Descargas</span>
            </NavLink>
          </li>
        </ul>
      </div>

      <div className="home-section">
        <div className="container" style={{ marginTop: "50px" }}>
          <Outlet />
        </div>
      </div>
    </>
  );
}
