import type { Peticion } from "../models/response.model";
import type { Usuarios } from "../models/usuarios.model";
import GenericService from "./generic.service";
export class AuthService extends GenericService {
    url = "v1/auth/";

    async iniciarSesion(data: any): Promise<Peticion<any>> {
        return (await this.api.post(`${this.url}login`, JSON.stringify(data))).data as Peticion<any>;
    }


    async me(): Promise<Peticion<Usuarios>> {
        return (await this.api.get(`${this.url}me`)).data as Peticion<Usuarios>;
    }

    async cerrarSesion(): Promise<Peticion<any>> {
        return (await this.api.get(`${this.url}logout`)).data as Peticion<any>;

    }
}