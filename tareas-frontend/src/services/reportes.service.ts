import type { Reportes } from "../models/reportes.model";
import type { Peticion } from "../models/response.model";
import GenericService from "./generic.service";

export class ReporteService extends GenericService {
    private readonly url = "v1/reportes/"


    async solicitarReporte(data: any) {
        return (await this.api.post<Peticion<string>>(`${this.url}solicitar-reporte`, JSON.stringify(data))).data;
    }

    async miListado(
        busqueda: string,
        pagina: number,
        limite: number,
        estado: string,
    ) {
        return (await (this.api.post<Peticion<Reportes>>(`${this.url}listado`, {}, { params: { busqueda, pagina, limite, estado } }))).data
    }
}