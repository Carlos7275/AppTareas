import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  FormControlLabel,
  Checkbox,
  Stack,
  Typography,
} from "@mui/material";
import ModalWrapper, {
  type ModalWrapperProps,
} from "../modal-wrapper/modal-wrapper";
import { Save } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { useEffect } from "react";
import { formatDateTimeLocal } from "../../utils/date.util";
import Swal from "sweetalert2";
import { tareasService } from "../../main";

interface ModalTareasProps extends ModalWrapperProps {
  data?: any;
  onSave?: (dto: any) => void;
}

export default function ModalTareas({
  open,
  onClose,
  data,
  onSave,
}: ModalTareasProps) {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nombre: data?.nombre || "",
      descripcion: data?.descripcion || "",
      prioridad: data?.prioridad || "",
      completada: data?.completado || false,
      rangoFechas: false,
      fechaInicio: data?.fecha_inicio || "",
      fechaFin: data?.fecha_fin || "",
      fechaTerminacion: data?.fecha_terminado || "",
    },
  });

  const rangoFechas = watch("rangoFechas");
  const completada = watch("completada");
  const fechaInicio = watch("fechaInicio");
  const fechaFin = watch("fechaFin");

  useEffect(() => {
    if (completada && !data && !watch("fechaTerminacion")) {
      setValue("fechaTerminacion", new Date().toISOString().slice(0, 16));
    }
  }, [completada, setValue, data, watch]);

  useEffect(() => {
    if (open) {
      reset({
        nombre: data?.nombre || "",
        descripcion: data?.descripcion || "",
        prioridad: data?.prioridad || "",
        completada: data?.completado || false,
        rangoFechas: !!(data?.fecha_inicio && data?.fecha_fin),
        fechaInicio: formatDateTimeLocal(data?.fecha_inicio),
        fechaFin: formatDateTimeLocal(data?.fecha_fin),
        fechaTerminacion: formatDateTimeLocal(data?.fecha_terminado),
      });
    }
  }, [open, data, reset]);

  const onSubmit = (formData: any) => {
    const dto = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      prioridad: formData.prioridad,
      completado: formData.completada,
      fecha_inicio: formData.fechaInicio || null,
      fecha_fin: formData.fechaFin || null,
      fecha_terminado: formData.fechaTerminacion || null,
    };

    data ? modificarTarea(dto) : agregarTarea(dto);
  };

  const modificarTarea = async (datos: any) => {
    try {
      const respuesta = await tareasService.modificarTarea(data.id, datos);
      Swal.fire(
        respuesta.message,
        "¡Se creo correctamente la tarea!",
        "success"
      );

      onSave?.(data);
      onClose();
    } catch (error: any) {
      const mensaje = error?.response?.data?.message || "Error desconocido";
      Swal.fire("¡Hubo un error!", mensaje, "error");
    }
  };

  const agregarTarea = async (data: any) => {
    try {
      const respuesta = await tareasService.crearTarea(data);
      Swal.fire(
        respuesta.message,
        "¡Se creo correctamente la tarea!",
        "success"
      );

      onSave?.(data);
      onClose();
    } catch (error: any) {
      const mensaje = error?.response?.data?.message || "Error desconocido";
      Swal.fire("¡Hubo un error!", mensaje, "error");
    }
  };

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={data ? "Modificar Tarea" : "Agregar Tarea"}
      className="overflow-auto"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3} sx={{ p: 2, maxHeight: "70vh", overflowY: "auto" }}>
          <Controller
            name="nombre"
            control={control}
            rules={{ required: "Nombre de la tarea es obligatorio" }}
            render={({ field }) => (
              <>
                <TextField
                  {...field}
                  fullWidth
                  label="Nombre de la tarea"
                  error={!!errors.nombre}
                />
                {errors.nombre && (
                  <Typography variant="caption" color="error">
                    {errors.nombre.message?.toString()}
                  </Typography>
                )}
              </>
            )}
          />

          <Controller
            name="descripcion"
            control={control}
            rules={{ required: "Descripción de la tarea es obligatoria" }}
            render={({ field }) => (
              <>
                <TextField
                  className="textbody"
                  {...field}
                  multiline
                  rows={3}
                  fullWidth
                  label="Descripción de la tarea"
                  error={!!errors.descripcion}
                  slotProps={{
                    input: {
                      sx: {
                        color: "inherit",
                        "& textarea": {
                          color: "inherit",
                        },
                      },
                    },
                  }}
                />
                {errors.descripcion && (
                  <Typography variant="caption" color="error">
                    {errors.descripcion.message?.toString()}
                  </Typography>
                )}
              </>
            )}
          />

          <Controller
            name="prioridad"
            control={control}
            rules={{ required: "Debes seleccionar una prioridad" }}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.prioridad}>
                <InputLabel>Prioridad</InputLabel>
                <Select {...field} className="text-body">
                  {["LEVE", "NORMAL", "ALTA"].map((p) => (
                    <MenuItem key={p} value={p}>
                      {p}
                    </MenuItem>
                  ))}
                </Select>
                {errors.prioridad && (
                  <Typography variant="caption" color="error">
                    {errors.prioridad.message?.toString()}
                  </Typography>
                )}
              </FormControl>
            )}
          />

          <Controller
            name="completada"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox {...field} checked={field.value} />}
                label="¿Tarea completada?"
              />
            )}
          />

          <Controller
            name="rangoFechas"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox {...field} checked={field.value} />}
                label="¿Rango de fechas?"
              />
            )}
          />

          <Stack direction="row" spacing={2}>
            <Controller
              name="fechaInicio"
              control={control}
              rules={{
                validate: (value) => {
                  if (rangoFechas && !value) return "Fecha Inicial obligatoria";
                  if (fechaFin && value && value > fechaFin)
                    return "Fecha Inicial no puede ser mayor a Fecha de Entrega";
                  return true;
                },
              }}
              render={({ field }) => (
                <>
                  <TextField
                    {...field}
                    label="Fecha Inicial"
                    type="datetime-local"
                    slotProps={{ inputLabel: { shrink: true } }}
                    fullWidth
                    disabled={!rangoFechas}
                    error={!!errors.fechaInicio}
                  />
                  {errors.fechaInicio && (
                    <Typography variant="caption" color="error">
                      {errors.fechaInicio.message?.toString()}
                    </Typography>
                  )}
                </>
              )}
            />

            <Controller
              name="fechaFin"
              control={control}
              rules={{
                required: "Fecha de Entrega obligatoria",
                validate: (value) => {
                  if (fechaInicio && value < fechaInicio)
                    return "Fecha de Entrega no puede ser menor a Fecha Inicial";
                  return true;
                },
              }}
              render={({ field }) => (
                <>
                  <TextField
                    {...field}
                    label="Fecha de Entrega"
                    type="datetime-local"
                    slotProps={{ inputLabel: { shrink: true } }}
                    fullWidth
                    error={!!errors.fechaFin}
                  />
                  {errors.fechaFin && (
                    <Typography variant="caption" color="error">
                      {errors.fechaFin.message?.toString()}
                    </Typography>
                  )}
                </>
              )}
            />
          </Stack>

          {completada && (
            <Controller
              name="fechaTerminacion"
              control={control}
              rules={{
                required: "Fecha de Terminación obligatoria",
                validate: (value) => {
                  if (fechaInicio && value < fechaInicio)
                    return "Fecha de Terminación no puede ser menor a Fecha Inicial";

                  return true;
                },
              }}
              render={({ field }) => (
                <>
                  <TextField
                    {...field}
                    label="Fecha de Terminación"
                    type="datetime-local"
                    slotProps={{ inputLabel: { shrink: true } }}
                    fullWidth
                    error={!!errors.fechaTerminacion}
                  />
                  {errors.fechaTerminacion && (
                    <Typography variant="caption" color="error">
                      {errors.fechaTerminacion.message?.toString()}
                    </Typography>
                  )}
                </>
              )}
            />
          )}

          <Button type="submit" variant="contained" startIcon={<Save />}>
            Guardar
          </Button>
        </Stack>
      </form>
    </ModalWrapper>
  );
}
