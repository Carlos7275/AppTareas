import { jwtDecode } from "jwt-decode";

interface JWTPayload {
  exp: number; // tiempo de expiración en segundos
  iat?: number;
  [key: string]: any; // otros campos que pueda tener tu token
}

export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;

  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const now = Math.floor(Date.now() / 1000); // tiempo actual en segundos
    return decoded.exp < now; // true si expiró
  } catch (error) {
    console.error("Error decodificando token:", error);
    return true; // si falla, tratamos el token como expirado
  }
};
