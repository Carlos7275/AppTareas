import type { Paises } from "../models/paises.model";
import type { Peticion } from "../models/response.model";
import GenericService from "./generic.service";

export class PaisesService extends GenericService {
    url: string = "v1/paises";

    async obtenerPaises() {
        return (await this.api.get<Peticion<Paises>>(this.url)).data
    }
}