import type { Filtros } from "./filtros.model";
import type { Model } from "./model";
import type { TipoReporte } from "./tiporeporte.model";

export interface Reportes extends Model {
    id_usuario: number;
    id_tipo_reporte: number;
    filtros: Filtros;
    estado: string;
    nombreArchivo: string;
    error: string;
    intentos: number;
    tipo: TipoReporte;
}