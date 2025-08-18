import { useState } from "react";
import { useForm } from "react-hook-form";
import { TextField, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff, Email } from "@mui/icons-material";
import "animate.css";
import "./login.css";
import Swal from "sweetalert2";
import { Link } from "react-router";
import { authService } from "../../main";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const respuesta = await authService.iniciarSesion(data);

      localStorage.setItem("jwt", respuesta.data.jwt);
      window.location.reload();
    } catch (error: any) {
      const mensaje = error?.response?.data?.message || "Error desconocido";
      Swal.fire("¡Hubo un error!", mensaje, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container animate__animated animate__zoomIn">
      <div className="login-card">
        <div className="login-form">
          <h2 className="login-title">Iniciar Sesión</h2>

          <form className="form" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              label="Correo"
              variant="outlined"
              type="email"
              fullWidth
              margin="normal"
              {...register("correo", {
                required: "El correo es obligatorio",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Ingresa un correo válido",
                },
              })}
              error={!!errors.correo}
              helperText={
                typeof errors.correo?.message === "string"
                  ? errors.correo.message
                  : undefined
              }
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Email />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              label="Contraseña"
              variant="outlined"
              type={showPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              {...register("password", {
                required: "La contraseña es obligatoria",
                minLength: {
                  value: 6,
                  message: "Debe tener al menos 6 caracteres",
                },
              })}
              error={!!errors.password}
              helperText={
                typeof errors.password?.message === "string"
                  ? errors.password.message
                  : undefined
              }
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <div className="checkbox-container">
              <input
                type="checkbox"
                id="sesionactiva"
                {...register("sesionactiva")}
              />
              <label htmlFor="sesionactiva">Mantener sesión activa</label>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? <span className="spinner"></span> : "Iniciar Sesión"}
            </button>
          </form>

          <div className="login-footer">
            <Link to="/registro">¿No tienes cuenta? Registrarse</Link>
          </div>
        </div>

        <div className="login-image">
          <img
            src="/images/imagen.gif"
            loading="lazy"
            alt="Ilustración de tareas"
          />
        </div>
      </div>
    </div>
  );
}
