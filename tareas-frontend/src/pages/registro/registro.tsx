import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import "./registro.css";
import {
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  KeyboardBackspace,
  Done,
} from "@mui/icons-material";
import type { Paises } from "../../models/paises.model";
import type { Generos } from "../../models/generos.model";
import { FormAutocomplete } from "../../components/autocomplete/autocomplete-select";
import Swal from "sweetalert2";
import { errorHandler } from "../../services/errorhandler.service";
import { paisesService, generosService, usuarioService } from "../../main";

interface FormData {
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  telefono: string;
  id_genero: string;
  id_pais: string;
  username: string;
  correo: string;
  password: string;
  passwordaux: string;
}

export default function Registro() {
  const navigate = useNavigate();

  const [paises, setPaises] = useState<Paises[]>([]);
  const [generos, setGeneros] = useState<Generos[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [hide, setHide] = useState(true);
  const [hide2, setHide2] = useState(true);

  const steps = ["Datos Personales", "Datos de la Cuenta", "Finalizado"];

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
  } = useForm<FormData>();

  const passwordsMatch = watch("password") === watch("passwordaux");

  useEffect(() => {
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
  }, []);

  const nextStep = async () => {
    let valid = false;

    if (activeStep === 0) {
      valid = await trigger([
        "nombres",
        "apellidos",
        "fecha_nacimiento",
        "telefono",
        "id_genero",
        "id_pais",
      ]);
    } else if (activeStep === 1) {
      valid = await trigger(["username", "correo", "password", "passwordaux"]);
      if (valid && !passwordsMatch) valid = false;
    }

    if (valid) setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => setActiveStep((prev) => Math.max(prev - 1, 0));

  const onSubmit = async (data: FormData) => {
    try {
      const respuesta = (await usuarioService.registrarUsuario(data)).data;
      setActiveStep(2);
      Swal.fire(respuesta.message, respuesta.data as string, "success").then(
        () => {
          navigate("/login");
        }
      );
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error.message || "Error desconocido";
      Swal.fire("¡Hubo un error!", message, "error");
    }
  };

  return (
    <div className="registro-container">
      {loading ? (
        <div className="spinner-container">
          <CircularProgress />
        </div>
      ) : (
        <div className="registro-card animate__animated animate__zoomIn">
          <div className="registro-form col-left">
            <Button
              startIcon={<KeyboardBackspace />}
              onClick={() => navigate(-1)}
            >
              Volver
            </Button>
            <h1 className="titulo">Crear cuenta</h1>

            <Stepper activeStep={activeStep} orientation="horizontal">
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <form onSubmit={handleSubmit(onSubmit)}>
              {activeStep === 0 && (
                <>
                  <TextField
                    label="Nombre(s)"
                    fullWidth
                    margin="normal"
                    {...register("nombres", { required: "Ingrese su nombre" })}
                    error={!!errors.nombres}
                    helperText={errors.nombres?.message}
                  />
                  <TextField
                    label="Apellido(s)"
                    fullWidth
                    margin="normal"
                    {...register("apellidos", {
                      required: "Ingrese sus apellidos",
                    })}
                    error={!!errors.apellidos}
                    helperText={errors.apellidos?.message}
                  />
                  <TextField
                    label="Fecha de nacimiento"
                    type="date"
                    fullWidth
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                      },
                    }}
                    margin="normal"
                    {...register("fecha_nacimiento", {
                      required: "Ingrese su fecha de nacimiento",
                    })}
                    error={!!errors.fecha_nacimiento}
                    helperText={errors.fecha_nacimiento?.message}
                  />
                  <TextField
                    label="Teléfono"
                    fullWidth
                    margin="normal"
                    {...register("telefono", {
                      required: "Ingrese un teléfono válido",
                    })}
                    error={!!errors.telefono}
                    helperText={errors.telefono?.message}
                  />

                  <FormAutocomplete
                    name="id_genero"
                    label="Género"
                    control={control}
                    errors={errors}
                    options={generos}
                    getOptionLabel={(o) => o.descripcion}
                    getOptionValue={(o) => o.id}
                    rules={{ required: "Seleccione un género" }}
                    sx={{ width: "100%" }}
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
                    rules={{ required: "Seleccione un país" }}
                    sx={{ width: "100%" }}
                  />

                  <div className="botones-step">
                    <div />
                    <Button variant="contained" onClick={nextStep}>
                      Siguiente
                    </Button>
                  </div>
                </>
              )}

              {activeStep === 1 && (
                <>
                  <TextField
                    label="Correo"
                    type="email"
                    fullWidth
                    margin="normal"
                    {...register("correo", {
                      required: "Ingrese un correo válido",
                    })}
                    error={!!errors.correo}
                    helperText={errors.correo?.message}
                  />
                  <TextField
                    label="Contraseña"
                    type={hide ? "password" : "text"}
                    fullWidth
                    margin="normal"
                    {...register("password", {
                      required: "Ingrese una contraseña",
                    })}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setHide(!hide)}>
                              {hide ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                  <TextField
                    label="Confirmar contraseña"
                    type={hide2 ? "password" : "text"}
                    fullWidth
                    margin="normal"
                    {...register("passwordaux", {
                      required: "Confirme su contraseña",
                    })}
                    error={!!errors.passwordaux || !passwordsMatch}
                    helperText={
                      errors.passwordaux?.message ||
                      (!passwordsMatch ? "Las contraseñas no coinciden" : "")
                    }
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setHide2(!hide2)}>
                              {hide2 ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  <div className="botones-step">
                    <Button variant="outlined" onClick={prevStep}>
                      Anterior
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={!passwordsMatch}
                    >
                      <Done sx={{ mr: 1 }} />
                      Registrarse
                    </Button>
                  </div>
                </>
              )}

              {activeStep === 2 && (
                <div className="step-final">
                  <h2>¡Registro completado!</h2>
                </div>
              )}
            </form>
          </div>

          <div className="col-right">
            <img
              src="/images/registro.png"
              alt="Registro"
              className="registro-img"
            />
          </div>
        </div>
      )}
    </div>
  );
}
