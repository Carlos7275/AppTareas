import {
  Button,
  InputAdornment,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Paper,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Tooltip,
  Stack,
  Chip,
  CircularProgress,
  Checkbox,
} from "@mui/material";
import {
  Add,
  AttachFile,
  Delete,
  Edit,
  Refresh,
  Search,
} from "@mui/icons-material";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router";
import Swal from "sweetalert2";
import { reportesService, tareasService, titleService } from "../../main";
import ModalTareas from "../../modals/modal-tareas/modal-tareas";
import { useDebounce } from "../../utils/search.util";
import type { Tareas } from "../../models/tareas.model";

export default function Tareas() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [page, setPage] = useState<number>(
    Number(searchParams.get("page") || 1)
  );
  const [total, setTotal] = useState<number>(0);
  const [elementos, setElementos] = useState<number>(
    Number(searchParams.get("elementos") || 10)
  );
  const [estado, setEstado] = useState<string>(
    searchParams.get("estado") || "T"
  );
  const [prioridad, setPrioridad] = useState<string>(
    searchParams.get("prioridad") || "T"
  );
  const [fechaInicio, setFechaInicio] = useState<string>(
    searchParams.get("fechaInicio") || ""
  );
  const [fechaFin, setFechaFin] = useState<string>(
    searchParams.get("fechaFin") || ""
  );
  const [busqueda, setBusqueda] = useState<string>(
    searchParams.get("busqueda") || ""
  );
  const [tareas, setTareas] = useState<Tareas[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<{
    open: boolean;
    data: Tareas | null;
  }>({
    open: false,
    data: null,
  });

  const debouncedBusqueda = useDebounce(busqueda, 500);

  const handleOpenModal = useCallback((data: Tareas | null = null) => {
    setOpenModal({ open: true, data });
  }, []);

  const handleCloseModal = useCallback(() => {
    setOpenModal({ open: false, data: null });
  }, []);

  const actualizarURL = useCallback(
    (search: string) => {
      const params: Record<string, string> = {
        page: page.toString(),
        elementos: elementos.toString(),
        estado,
        prioridad,
      };
      if (fechaInicio) params.fechaInicio = fechaInicio;
      if (fechaFin) params.fechaFin = fechaFin;
      if (search) params.busqueda = search;
      setSearchParams(params);
    },
    [page, elementos, estado, prioridad, fechaInicio, fechaFin, setSearchParams]
  );

  const obtenerTareas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await tareasService.miListado(
        debouncedBusqueda,
        page,
        elementos,
        prioridad,
        estado,
        fechaInicio,
        fechaFin
      );
      setTareas(res.data as Tareas[]);
      setTotal(res.total as number);
    } catch (error: any) {
      Swal.fire(
        "¡Hubo un error!",
        error?.response?.data?.message || "Error desconocido",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [
    debouncedBusqueda,
    page,
    elementos,
    prioridad,
    estado,
    fechaInicio,
    fechaFin,
  ]);

  const eliminarTarea = useCallback(
    async (id: number) => {
      try {
        const result = await Swal.fire({
          title: "¿Estás seguro?",
          text: "Esta acción eliminará la tarea permanentemente.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Sí, eliminar",
          cancelButtonText: "Cancelar",
          reverseButtons: true,
        });

        if (result.isConfirmed) {
          const respuesta = await tareasService.eliminarTarea(id);
          Swal.fire("Eliminada", respuesta.message, "success").then(() =>
            obtenerTareas()
          );
        }
      } catch (error: any) {
        Swal.fire(
          "¡Hubo un error!",
          error?.response?.data?.message || "Error desconocido",
          "error"
        );
      }
    },
    [obtenerTareas]
  );

  const cambiarEstatusTarea = useCallback(
    async (id: number) => {
      try {
        const resultado = await tareasService.cambiarEstado(id);
        Swal.fire(resultado.message, resultado.data.toString(), "success");
        obtenerTareas();
      } catch (error: any) {
        Swal.fire(
          "¡Hubo un error!",
          error?.response?.data?.message || "Error desconocido",
          "error"
        );
      }
    },
    [obtenerTareas]
  );

  const solicitudReporte = useCallback(async () => {
    try {
      const data = {
        id_tipo_reporte: 1,
        filtros: {
          busqueda,
          fechaInicio,
          fechaFin,
          prioridad,
          estado,
        },
      };
      const response = await reportesService.solicitarReporte(data);
      Swal.fire({
        title: response.message,
        text: response.data.toString(),
        icon: "success",
        timer: 3000,
        showConfirmButton: true,
        timerProgressBar: true,
      });
    } catch (error: any) {
      Swal.fire(
        "¡Hubo un error!",
        error?.response?.data?.message || "Error desconocido",
        "error"
      );
    }
  }, [busqueda, fechaInicio, fechaFin, prioridad, estado]);

  const handleBusqueda = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(event.target.value);
    setPage(1);
  };

  useEffect(() => {
    actualizarURL(debouncedBusqueda);
  }, [
    debouncedBusqueda,
    page,
    elementos,
    estado,
    prioridad,
    fechaInicio,
    fechaFin,
    actualizarURL,
  ]);

  useEffect(() => {
    obtenerTareas();
  }, [obtenerTareas]);

  titleService.setTitle("Apartado de Tareas");

  return (
    <>
      <div className="animate__animated animate__fadeIn">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          sx={{ p: 2, boxShadow: 1, borderRadius: 2, width: "100%" }}
        >
          <TextField
            label="Buscar Tarea"
            type="search"
            value={busqueda}
            onChange={handleBusqueda}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            className="text-body"
            label="Fecha Inicio"
            type="date"
            value={fechaInicio}
            onChange={(e) => {
              setFechaInicio(e.target.value);
              setPage(1);
            }}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            className="text-body"
            label="Fecha Fin"
            type="date"
            value={fechaFin}
            onChange={(e) => {
              setFechaFin(e.target.value);
              setPage(1);
            }}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <FormControl sx={{ minWidth: 100 }}>
            <InputLabel>Elementos</InputLabel>
            <Select
              className="text-body"
              value={elementos}
              onChange={(e) => {
                setElementos(Number(e.target.value));
                setPage(1);
              }}
            >
              {[1, 5, 10, 20, 50, 100].map((el) => (
                <MenuItem key={el} value={el}>
                  {el}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 100 }}>
            <InputLabel>Prioridad</InputLabel>
            <Select
              className="text-body"
              value={prioridad}
              onChange={(e) => {
                setPrioridad(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="T">Todos</MenuItem>
              <MenuItem value="L">Leve</MenuItem>
              <MenuItem value="N">Normal</MenuItem>
              <MenuItem value="A">Alta</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 100 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              className="text-body"
              value={estado}
              onChange={(e) => {
                setEstado(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="T">Todos</MenuItem>
              <MenuItem value="C">Completado</MenuItem>
              <MenuItem value="N">No Completado</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenModal(null)}
          >
            Agregar
          </Button>
          <Button
            onClick={solicitudReporte}
            variant="outlined"
            color="success"
            startIcon={<AttachFile />}
          >
            Solicitar Reporte
          </Button>
        </Stack>

        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "200px",
            }}
          >
            <CircularProgress />
          </div>
        ) : (
          <TableContainer component={Paper} className="bg-body" sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  {[
                    "",
                    "Tarea",
                    "Fecha de creacion",
                    "Fecha Inicio",
                    "Fecha Fin",
                    "Fecha de terminacion",
                    "Prioridad",
                    "Estado",
                    "Acciones",
                  ].map((title) => (
                    <TableCell key={title} className="text-body">
                      {title}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Button onClick={obtenerTareas} startIcon={<Refresh />} />
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tareas.length === 0 ? (
                  <TableRow>
                    <TableCell
                      className="text-body"
                      colSpan={10}
                      align="center"
                    >
                      No hay datos
                    </TableCell>
                  </TableRow>
                ) : (
                  tareas.map((t) => (
                    <TableRow key={t.id} hover>
                      <TableCell>
                        <Tooltip title="Cambiar Estatus Tarea">
                          <Checkbox
                            checked={t.completado}
                            onChange={() => cambiarEstatusTarea(t.id)}
                            color="success"
                          />
                        </Tooltip>
                      </TableCell>
                      <TableCell className="text-body">{t.nombre}</TableCell>
                      <TableCell>
                        {new Date(t.created).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-body">
                        {t.fecha_inicio
                          ? new Date(t.fecha_inicio).toLocaleString()
                          : "-"}
                      </TableCell>
                      <TableCell className="text-body">
                        {t.fecha_fin
                          ? new Date(t.fecha_fin).toLocaleString()
                          : "-"}
                      </TableCell>
                      <TableCell className="text-body">
                        {t.fecha_terminado
                          ? new Date(t.fecha_terminado).toLocaleString()
                          : "-"}
                      </TableCell>
                      <TableCell className="text-body">
                        <Chip
                          label={t.prioridad}
                          color={
                            t.prioridad === "ALTA"
                              ? "error"
                              : t.prioridad === "NORMAL"
                              ? "warning"
                              : "success"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell className="text-body">
                        <Chip
                          label={t.estadoCompletado || "No completada"}
                          color={
                            t.estadoCompletado === "Completada con retraso"
                              ? "error"
                              : t.estadoCompletado === "Completada a tiempo"
                              ? "success"
                              : "default"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell className="text-body">
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Editar">
                            <Button
                              variant="contained"
                              color="warning"
                              onClick={() => handleOpenModal(t)}
                            >
                              <Edit />
                            </Button>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => eliminarTarea(t.id)}
                            >
                              <Delete />
                            </Button>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {elementos > 0 && (
          <Pagination
            count={Math.ceil(total / elementos)}
            page={page}
            onChange={(_event, value) => setPage(value)}
            color="primary"
            sx={{ mt: 2, display: "flex", justifyContent: "center" }}
          />
        )}

        <ModalTareas
          open={openModal.open}
          onClose={handleCloseModal}
          onSave={obtenerTareas}
          data={openModal.data}
        />
      </div>
    </>
  );
}
