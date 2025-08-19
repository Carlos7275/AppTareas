import { jwtDecode } from "jwt-decode";

interface JWTPayload {
  exp: number;
  iat?: number;
  [key: string]: any;
}

export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;

  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  } catch (error) {
    console.error("Error decodificando token:", error);
    return true;
  }
};
