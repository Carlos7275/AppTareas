import { useEffect, useState } from "react";
import type { Estadisticas_Tareas } from "../../models/estadisticas-tareas";
import Swal from "sweetalert2";
import { tareasService, titleService } from "../../main";
import {
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaFlag,
  FaCalendarAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router";
import { CircularProgress } from "@mui/material";

interface Contador {
  total_tareas: number;
  tareas_completadas: number;
  tareas_pendientes: number;
  porcentaje_completado: number;
  leve: number;
  normal: number;
  mediana: number;
  alta: number;
  proximas_a_expirar: number;
}

export default function InicioTareas() {
  const [estadisticas, setEstadisticas] = useState<Estadisticas_Tareas>();
  const [contador, setContador] = useState<Contador>({
    total_tareas: 0,
    tareas_completadas: 0,
    tareas_pendientes: 0,
    porcentaje_completado: 0,
    leve: 0,
    normal: 0,
    mediana: 0,
    alta: 0,
    proximas_a_expirar: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    obtenerEstadisticas();
  }, []);

  useEffect(() => {
    if (!estadisticas) return;

    const duration = 1000;
    const steps = 50;
    const increment = (valor: number) => valor / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      setContador({
        total_tareas: Math.min(
          estadisticas.total_tareas,
          Math.floor(increment(estadisticas.total_tareas) * currentStep)
        ),
        tareas_completadas: Math.min(
          estadisticas.tareas_completadas,
          Math.floor(increment(estadisticas.tareas_completadas) * currentStep)
        ),
        tareas_pendientes: Math.min(
          estadisticas.tareas_pendientes,
          Math.floor(increment(estadisticas.tareas_pendientes) * currentStep)
        ),
        porcentaje_completado: Math.min(
          estadisticas.porcentaje_completado,
          Math.floor(increment(estadisticas.porcentaje_completado) * currentStep)
        ),
        leve: Math.min(
          estadisticas.leve,
          Math.floor(increment(estadisticas.leve) * currentStep)
        ),
        normal: Math.min(
          estadisticas.normal,
          Math.floor(increment(estadisticas.normal) * currentStep)
        ),
        mediana: Math.min(
          estadisticas.mediana,
          Math.floor(increment(estadisticas.mediana) * currentStep)
        ),
        alta: Math.min(
          estadisticas.alta,
          Math.floor(increment(estadisticas.alta) * currentStep)
        ),
        proximas_a_expirar: Math.min(
          estadisticas.proximas_a_expirar,
          Math.floor(increment(estadisticas.proximas_a_expirar) * currentStep)
        ),
      });

      if (currentStep >= steps) clearInterval(interval);
    }, duration / steps);

    return () => clearInterval(interval);
  }, [estadisticas]);

  const obtenerEstadisticas = async () => {
    try {
      const resultado = await tareasService.obtenerEstadisticas();
      setEstadisticas(resultado.data as Estadisticas_Tareas);
    } catch (error: any) {
      const mensaje = error?.response?.data?.message || "Error desconocido";
      Swal.fire("¡Hubo un error!", mensaje, "error");
    }
  };

  const generarMensaje = (tipo: string, valor: number) => {
    switch (tipo) {
      case "total":
        return `Tienes ${valor} tareas registradas`;
      case "completadas":
        return valor === 0
          ? "Aún no has completado tareas"
          : `¡Has completado ${valor} tareas!`;
      case "pendientes":
        return valor === 0
          ? "No tienes tareas pendientes"
          : `¡Atención! ${valor} tareas pendientes`;
      case "expiran":
        return valor === 0
          ? "Ninguna tarea próxima a expirar"
          : `${valor} tareas próximas a expirar`;
      case "prioridad":
        return valor === 0
          ? "Sin tareas de esta prioridad"
          : `${valor} tareas con esta prioridad`;
      case "porcentaje":
        return valor === 100
          ? "¡Excelente! Todas completadas"
          : `Completado al ${valor}%`;
      default:
        return "";
    }
  };

  const irATareas = (filtros: { estado?: string; prioridad?: string }) => {
    const params = new URLSearchParams();
    if (filtros.estado) params.append("estado", filtros.estado);
    if (filtros.prioridad) params.append("prioridad", filtros.prioridad);
    navigate(`/dashboard-tareas/tareas?${params.toString()}`);
  };

  if (!estadisticas) {
    return (
      <p className="text-center text-muted mt-4">
        <CircularProgress />
      </p>
    );
  }

  const estadisticasPrincipales = [
    {
      icon: <FaTasks />,
      tipo: "total",
      valor: contador.total_tareas,
      color: "primary",
      filtros: {},
    },
    {
      icon: <FaCheckCircle />,
      tipo: "completadas",
      valor: contador.tareas_completadas,
      color: "success",
      filtros: { estado: "C" },
    },
    {
      icon: <FaClock />,
      tipo: "pendientes",
      valor: contador.tareas_pendientes,
      color: "danger",
      filtros: { estado: "N" },
    },
    {
      icon: <FaCalendarAlt />,
      tipo: "expiran",
      valor: contador.proximas_a_expirar,
      color: "warning",
      filtros: { estado: "N" },
    },
  ];

  const prioridades = [
    { prio: "Leve", color: "secondary" },
    { prio: "Normal", color: "primary" },
    { prio: "Mediana", color: "warning" },
    { prio: "Alta", color: "danger" },
  ];

    titleService.setTitle("Tareas - Inicio");
  

  return (
    <div className="container animate__animated animate__zoomIn mt-4">
      <div className="row g-3">
        {estadisticasPrincipales.map((item, i) => (
          <div key={i} className="col-12 col-md-6 col-lg-3">
            <div
              className={`alert alert-${item.color} shadow-sm rounded-4 d-flex flex-column`}
              role="alert"
            >
              <div className="d-flex align-items-center mb-2">
                <span className="me-3 fs-3">{item.icon}</span>
                <div>
                  <strong>{item.tipo.toUpperCase()}</strong>
                  <div className="small">{generarMensaje(item.tipo, item.valor)}</div>
                </div>
              </div>
              <button
                className="btn btn-sm border mt-auto"
                onClick={() => irATareas(item.filtros)}
              >
                Ver Tareas
              </button>
            </div>
          </div>
        ))}

        {prioridades.map((item, i) => {
          const value = contador[item.prio.toLowerCase() as keyof Contador];
          return (
            <div key={i} className="col-6 col-md-3">
              <div
                className={`alert alert-${item.color} shadow-sm rounded-4 d-flex flex-column`}
                role="alert"
              >
                <div className="d-flex align-items-center mb-2">
                  <FaExclamationTriangle className="me-2" />
                  <div>
                    <strong>{item.prio}</strong>
                    <div className="small">{generarMensaje("prioridad", value)}</div>
                  </div>
                </div>
                <button
                  className="btn btn-sm border mt-auto"
                  onClick={() => irATareas({ prioridad: item.prio.charAt(0) })}
                >
                  Ver Tareas
                </button>
              </div>
            </div>
          );
        })}

        <div className="col-12">
          <div
            className="alert alert-info d-flex align-items-center shadow-sm rounded-4"
            role="alert"
          >
            <FaFlag className="me-2 fs-3" />
            <div>
              <strong>Completado</strong>
              <div className="small">
                {generarMensaje("porcentaje", contador.porcentaje_completado)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
