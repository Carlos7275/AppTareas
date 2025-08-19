import type { Model } from "./model"

export interface Paises extends Model {
    nombre: string
    nombrecorto: string
    codigopais: string
    codigotelefono: string
    foto: string
    estatus: boolean
}