import { useEffect, useState, type ChangeEvent } from "react";
import {
  Box,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Pagination,
  Button,
  Chip,
} from "@mui/material";
import { Download, Refresh, Search } from "@mui/icons-material";
import type { Reportes } from "../../models/reportes.model";
import Swal from "sweetalert2";
import { reportesService, titleService } from "../../main";
import { useDebounce } from "../../utils/search.util";

export default function Descargas() {
  const [reportes, setReportes] = useState<Reportes[]>([]);
  const [filtros, setFiltros] = useState({ estado: "T", busqueda: "" });
  const [pagina, setPagina] = useState<number>(1);
  const [limite, setLimite] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  const debouncedBusqueda = useDebounce(filtros.busqueda, 500);

  const obtenerReportes = async () => {
    try {
      const { data, total } = await reportesService.miListado(
        debouncedBusqueda,
        pagina,
        limite,
        filtros.estado
      );
      setReportes(data as Reportes[]);
      setTotal(total as number);
    } catch (error: any) {
      const mensaje = error?.response?.data?.message || "Error desconocido";
      Swal.fire("¡Hubo un error!", mensaje, "error");
    }
  };

  useEffect(() => {
    setPagina(1);
  }, [debouncedBusqueda, filtros.estado, limite]);

  useEffect(() => {
    obtenerReportes();
  }, [debouncedBusqueda, filtros.estado, pagina, limite]);

  titleService.setTitle("Tareas - Descargas");

  const handleFilterChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const handleDownload = (reporte: Reportes) => {
    if (reporte.nombreArchivo) {
      window.open(reporte.nombreArchivo, "_blank");
    }
  };

  return (
    <div className="animate__animated animate__fadeIn">
      <Box p={4}>
        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          <TextField
            label="Buscar Reporte"
            type="search"
            name="busqueda"
            value={filtros.busqueda}
            onChange={handleFilterChange}
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

          <FormControl sx={{ minWidth: 100 }}>
            <InputLabel>Elementos</InputLabel>
            <Select
              className="text-body"
              value={limite}
              onChange={(e) => setLimite(Number(e.target.value))}
            >
              {[1, 5, 10, 20, 50, 100].map((el) => (
                <MenuItem key={el} value={el}>
                  {el}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              className="text-body"
              name="estado"
              value={filtros.estado}
              onChange={(event) => {
                const { name, value } = event.target as {
                  name?: string;
                  value: string;
                };
                setFiltros((prev) => ({
                  ...prev,
                  [name ?? "estado"]: value,
                }));
              }}
            >
              <MenuItem value="T">Todos</MenuItem>
              <MenuItem value="COMPLETADO">Completado</MenuItem>
              <MenuItem value="PROCESANDO">Procesando</MenuItem>
              <MenuItem value="PENDIENTE">Pendiente</MenuItem>
              <MenuItem value="ERROR">Error</MenuItem>
              <MenuItem value="REINTENTANDO">En proceso</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Paper>
          <Table className="bg-body">
            <TableHead>
              <TableRow>
                <TableCell className="text-body">ID</TableCell>
                <TableCell className="text-body">Nombre</TableCell>
                <TableCell className="text-body">Fecha</TableCell>
                <TableCell className="text-body">Estado</TableCell>
                <TableCell className="text-body">Error</TableCell>
                <TableCell className="text-body">Descargar</TableCell>
                <TableCell>
                  <Button onClick={obtenerReportes} startIcon={<Refresh />} />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportes.length > 0 ? (
                reportes.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-body">{r.id}</TableCell>
                    <TableCell className="text-body">{r.tipo.nombre}</TableCell>
                    <TableCell className="text-body">
                      {new Date(r.created).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-body">
                      <Chip
                        label={r.estado}
                        color={
                          r.estado === "COMPLETADO"
                            ? "success"
                            : r.estado === "PROCESANDO" ||
                              r.estado === "REINTENTANDO"
                            ? "info"
                            : r.estado === "PENDIENTE"
                            ? "warning"
                            : r.estado === "ERROR"
                            ? "error"
                            : "default"
                        }
                        size="small"
                      />
                    </TableCell>{" "}
                    <TableCell className="text-body">
                      {r.error || "-"}
                    </TableCell>
                    <TableCell className="text-body">
                      {r.estado === "COMPLETADO" && r.nombreArchivo ? (
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<Download />}
                          onClick={() => handleDownload(r)}
                        >
                          Descargar
                        </Button>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="text-body" colSpan={7} align="center">
                    No hay datos
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>

        {limite > 0 && (
          <Pagination
            className="text-body"
            count={Math.ceil(total / limite)}
            page={pagina}
            onChange={(_, val) => setPagina(val)}
            color="primary"
            sx={{ mt: 2, display: "flex", justifyContent: "center" }}
          />
        )}
      </Box>
    </div>
  );
}
