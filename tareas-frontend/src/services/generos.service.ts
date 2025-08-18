import type { Generos } from "../models/generos.model";
import type { Peticion } from "../models/response.model";
import GenericService from "./generic.service";

export class GenerosService extends GenericService {
    private readonly url: string = "v1/generos";

    async obtenerGeneros() {
        return (await this.api.get<Peticion<Generos>>(this.url)).data
    }
}

