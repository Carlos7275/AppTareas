import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Visibility, VisibilityOff, Save } from "@mui/icons-material";
import Swal from "sweetalert2";
import { usuarioService } from "../../../main";

interface FormValues {
  Contraseña: string;
  NuevaContraseña: string;
  ContraseñaAux: string;
}

export default function CambiarContra() {
  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { Contraseña: "", NuevaContraseña: "", ContraseñaAux: "" },
  });

  const [hide, setHide] = useState(true);
  const [hide1, setHide1] = useState(true);

  const [hide2, setHide2] = useState(true);

  const password = watch("NuevaContraseña");

  const onSubmit = async (data: FormValues) => {
    try {
      const respuesta = await usuarioService.cambiarContraseña(data);
      Swal.fire(respuesta.message, respuesta.data as string, "success").then(
        () => {
          window.location.reload();
        }
      );
    } catch (error: any) {
      const mensaje = error?.response?.data?.message || "Error desconocido";

      Swal.fire("¡Hubo un error!", mensaje, "error");
    }
  };

  return (
    <div className="container w-100 mt-5 rounded-4 shadow-lg" id="login">
      <div className="row gx-0 d-flex align-items-stretch">
        <div className="col-md-8 col-lg-6 p-5 d-flex flex-column justify-content-center">
          <h3 className="fw-bold text-center py-4">Cambiar Contraseña</h3>
          <div className="alert alert-info text-center" role="alert">
            ¡Asegúrate de elegir una contraseña segura y fácil de recordar! 🔒
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="Contraseña"
              control={control}
              rules={{ required: "Ingrese una contraseña válida" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  type={hide ? "password" : "text"}
                  label="Ingrese su contraseña actual"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  error={!!errors.Contraseña}
                  helperText={errors.Contraseña?.message}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setHide(!hide)} edge="end">
                            {hide ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              )}
            />
            <Controller
              name="NuevaContraseña"
              control={control}
              rules={{ required: "Ingrese una contraseña válida" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  type={hide1 ? "password" : "text"}
                  label="Ingrese su nueva contraseña"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  error={!!errors.NuevaContraseña}
                  helperText={errors.NuevaContraseña?.message}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setHide1(!hide1)}
                            edge="end"
                          >
                            {hide1 ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              )}
            />

            <Controller
              name="ContraseñaAux"
              control={control}
              rules={{
                required: "Confirme su contraseña",
                validate: (value) =>
                  value === password || "Las contraseñas no coinciden",
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  type={hide2 ? "password" : "text"}
                  label="Confirme su nueva contraseña"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  error={!!errors.ContraseñaAux}
                  helperText={errors.ContraseñaAux?.message}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setHide2(!hide2)}
                            edge="end"
                          >
                            {hide2 ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              )}
            />

            <Box textAlign="center" mt={4}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<Save />}
                size="large"
              >
                Guardar
              </Button>
            </Box>
          </form>
        </div>

        <div className="col-md-5 col-lg-6 d-none d-md-block">
          <img
            src="/images/reset"
            loading="lazy"
            className="img-fluid h-100 w-100"
            style={{ objectFit: "cover", borderRadius: "0 0.5rem 0.5rem 0" }}
            alt="Reset"
          />
        </div>
      </div>
    </div>
  );
}
