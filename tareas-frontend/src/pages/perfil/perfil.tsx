import { useEffect, useState } from "react";
import type { Usuarios } from "../../models/usuarios.model";
import {
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Email, Save } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import type { Generos } from "../../models/generos.model";
import type { Paises } from "../../models/paises.model";
import { errorHandler } from "../../services/errorhandler.service";
import {
  generosService,
  paisesService,
  titleService,
  usuarioService,
} from "../../main";
import { FormAutocomplete } from "../../components/autocomplete/autocomplete-select";
import { useImagePreview } from "../../hooks/useImagePreview";
import Swal from "sweetalert2";
import { useUser } from "../../providers/user.provider";

export default function Perfil() {
  const {
    handleSubmit,
    control,
    register,
    formState: { errors },
  } = useForm<Usuarios>();

  titleService.setTitle("Configuracion del usuario - Perfil");

  const [paises, setPaises] = useState<Paises[]>([]);
  const [generos, setGeneros] = useState<Generos[]>([]);
  const [loading, setLoading] = useState(false);

  const { imgURL, base64, message, preview } = useImagePreview();
  const { usuario } = useUser();

  useEffect(() => {
    if (!usuario) return;
    imgURL.set(usuario.foto);

    setLoading(true);

    const obtenerGenerosPaises = async () => {
      try {
        const paisesResp = await paisesService.obtenerPaises();
        const generosResp = await generosService.obtenerGeneros();

        setPaises(paisesResp.data as Paises[]);
        setGeneros(generosResp.data as Generos[]);
      } catch (error: any) {
        errorHandler(error);
      } finally {
        setLoading(false);
      }
    };

    obtenerGenerosPaises();
  }, [usuario]);

  const onSubmit = async (usuarioForm: Usuarios) => {
    try {
      const data = { ...usuarioForm, foto: base64 };

      if (!message) {
        const respuesta = await usuarioService.modificarUsuario(
          usuario!.id,
          data
        );

        Swal.fire(respuesta.message, respuesta.data as string, "success").then(
          () => {
            window.location.reload();
          }
        );
      }
    } catch (error: any) {
      const mensaje = error?.response?.data?.message || "Error desconocido";
      Swal.fire("¡Hubo un error!", mensaje, "error");
    }
  };
  return (
    <>
      {!loading && usuario ? (
        <div className="card ">
          <div className="card-header">
            <h5>¡Hola {usuario.nombres + " " + usuario.apellidos} !</h5>
          </div>
          <div className="card-body ">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="row">
                <div className="col-md-6">
                  <TextField
                    label="Correo"
                    margin="normal"
                    type="email"
                    defaultValue={usuario.correo}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <Email />
                          </InputAdornment>
                        ),
                      },
                      inputLabel: {
                        shrink: true,
                      },
                    }}
                    {...register("correo", {
                      required: "Ingrese un correo válido",
                    })}
                    error={!!errors.correo}
                    helperText={errors.correo?.message}
                  ></TextField>
                  <hr />
                  <h6>Datos Personales</h6>
                  <TextField
                    className="p-2"
                    type="text"
                    label="Nombre"
                    margin="normal"
                    defaultValue={usuario.nombres}
                    {...register("nombres", { required: "Ingrese el nombre" })}
                  ></TextField>
                  <TextField
                    className="p-2"
                    type="text"
                    margin="normal"
                    label="Apellidos"
                    defaultValue={usuario.apellidos}
                    {...register("apellidos", {})}
                    error={!!errors.apellidos}
                    helperText={errors.apellidos?.message}
                  ></TextField>
                  <br />
                  <TextField
                    label="Fecha de nacimiento"
                    margin="normal"
                    className="p-2"
                    defaultValue={usuario.fecha_nacimiento}
                    {...register("fecha_nacimiento", {
                      required: "Ingrese la fecha de nacimiento",
                    })}
                    error={!!errors.fecha_nacimiento}
                    helperText={errors.fecha_nacimiento?.message}
                    type="date"
                  ></TextField>

                  <TextField
                    label="Telefono"
                    margin="normal"
                    className="p-2"
                    defaultValue={usuario.telefono}
                    {...register("telefono", {
                      required: "Ingrese la fecha de nacimiento",
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "El teléfono debe tener 10 números",
                      },
                    })}
                    error={!!errors.telefono}
                    helperText={errors.telefono?.message}
                    type="tel"
                  ></TextField>
                  <FormAutocomplete
                    name="id_genero"
                    label="Género"
                    control={control}
                    errors={errors}
                    options={generos}
                    getOptionLabel={(o) => o.descripcion}
                    getOptionValue={(o) => o.id}
                    value={usuario.id_genero}
                    rules={{ required: "Seleccione un género" }}
                  />

                  <FormAutocomplete
                    name="id_pais"
                    label="País"
                    control={control}
                    errors={errors}
                    options={paises}
                    getOptionLabel={(o) => o.nombre}
                    getOptionValue={(o) => o.id}
                    imageKey="foto"
                    value={usuario.id_pais}
                    rules={{ required: "Seleccione un país" }}
                  />
                </div>
                <div className="col-md-5 col-xl-5 d-flex justify-content-end align-items start">
                  <div className="text-center">
                    <img
                      src={imgURL.get()!}
                      className="img-fluid rounded-circle shadow"
                      alt="Foto del usuario"
                      style={{
                        width: "190px",
                        height: "190px",
                        objectFit: "cover",
                        objectPosition: "center",
                        aspectRatio: "1 / 1",
                      }}
                    />
                    <input
                      className="p-3"
                      type="file"
                      accept="image/*"
                      onChange={(e) => preview(e.target.files)}
                    />
                    {message && <p style={{ color: "red" }}>{message}</p>}
                  </div>
                </div>
                <div className="card-footer">
                  <Box display="flex" justifyContent="flex-end">
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<Save />}
                    >
                      Guardar
                    </Button>
                  </Box>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="spinner-container">
          <CircularProgress />
        </div>
      )}
    </>
  );
}
