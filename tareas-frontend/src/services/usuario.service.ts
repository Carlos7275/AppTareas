import type { Peticion } from "../models/response.model";
import GenericService from "./generic.service";

export class UsuarioService extends GenericService {
    private readonly url = "v1/usuarios/";

    async registrarUsuario(data: any) {
        return await this.api.post<Peticion<string>>(`${this.url}crear`, JSON.stringify(data))
    }

    async modificarUsuario(id: number, data: any) {
        return (await this.api.put<Peticion<string>>(`${this.url}modificar/${id}`, JSON.stringify(data))).data
    }

    async cambiarContraseña(data: any) {
        return (await this.api.post<Peticion<string>>(`${this.url}cambiar-contra/`, JSON.stringify(data))).data

    }
}

