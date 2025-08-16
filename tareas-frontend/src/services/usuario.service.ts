import type { Peticion } from "../models/response.model";
import GenericService from "./generic.service";

export class UsuarioService extends GenericService {
    url = "v1/usuarios/";

    async registrarUsuario(data: any) {
        return await this.api.post<Peticion<string>>(`${this.url}crear`, JSON.stringify(data))
    }

    async modificarUsuario(id: number, data: any): Promise<Peticion<string>> {
        return await this.api.put(`${this.url}modificar/${id}`, JSON.stringify(data)) as Peticion<string>;
    }
}