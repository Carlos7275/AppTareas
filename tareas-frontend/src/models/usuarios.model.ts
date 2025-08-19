import type { Model } from "./model";

export interface Usuarios extends Model {
  nombres: string;
  apellidos: string;
  correo: string;
  fecha_nacimiento: string;
  foto: string;
  id_genero: number;
  id_pais: number;
  id_rol: number;
  rol: string;
  google_id: any;
  telefono: string;
  biografia: string;
  last_login:Date;
  created:Date;
}
