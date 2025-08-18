import type { Estadisticas_Tareas } from "../models/estadisticas-tareas";
import type { Peticion } from "../models/response.model";
import type { Tareas } from "../models/tareas.model";
import GenericService from "./generic.service";

export class TareasService extends GenericService {
    url = "v1/tareas/"

    async crearTarea(data: any) {
        return (await this.api.post<Peticion<Tareas>>(`${this.url}crear`, JSON.stringify(data))).data;
    }

    async modificarTarea(id: number, data: any) {
        return (await this.api.put<Peticion<Tareas>>(`${this.url}modificar/${id}`, JSON.stringify(data))).data;
    }

    async eliminarTarea(id: number) {
        return (await this.api.delete<Peticion<Tareas>>(`${this.url}eliminar/${id}`)).data;

    }

    async cambiarEstado(id: number) {
        return (await this.api.put<Peticion<Tareas>>(`${this.url}cambiar-estado-completado/${id}`)).data;

    }

    async solicitarReporte(
        busqueda: string,
        prioridad: string,
        estatus: string,
        fechaInicio: string,
        fechaFin: string) {
        return (await this.api.get(`${this.url}reporte-tareas`, { responseType: "blob", params: { busqueda, prioridad, estatus, fechaInicio, fechaFin } }));
    }

    async obtenerEstadisticas() {
        return ((await this.api.get<Peticion<Estadisticas_Tareas>>(`${this.url}estadisticas`)).data)
    }

    async miListado(
        busqueda: string,
        pagina: number,
        limite: number,
        prioridad: string,
        estatus: string,
        fechaInicio: string,
        fechaFin: string) {
        return (await (this.api.post<Peticion<Tareas>>(`${this.url}mi-listado`, {}, { params: { busqueda, pagina, limite, prioridad, estatus, fechaInicio, fechaFin } }))).data
    }

}