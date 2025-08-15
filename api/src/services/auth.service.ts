import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Usuarios } from 'src/entities/usuarios.entity';
import { PayloadModel } from 'src/models/Payload/payload.model';
import { UsuariosService } from './usuarios.service';
import { ListaNegraService } from './lista-negra.service';
import { config } from 'dotenv';
config();
@Injectable()
export class AuthService {
    _token = process.env.jwtSecret;
    constructor(
        private usuarioService: UsuariosService,
        private jwtService: JwtService,
        private listaNegraService: ListaNegraService,
    ) { }

    async authenticateUser(
        email: string,
        pass: string,
    ): Promise<Partial<any> | false> {
        const user: Usuarios = await this.usuarioService.findOne({
            where: { correo: email, estatus: true },
            relations: ['detalles', 'rol'],
        });
        if (!user) {
            throw new UnauthorizedException('Verifique sus credenciales');
        }
        const isPasswordValid = await bcrypt.compare(pass, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Verifique su contraseña');
        }

        const userDto = {
            id: user.id,
            nombres: user.detalles.nombres,
            apellidos: user.detalles.apellidos,
            correo: user.correo,
            fecha_nacimiento: user.detalles.fecha_nacimiento,
            foto: user.detalles.foto,
            id_genero: user.detalles.id_genero,
            id_pais: user.detalles.id_pais,
            id_rol: user.id_rol,
            rol: user.rol.descripcion,
            telefono: user.detalles.telefono,
            username: user.username,
        };

        return userDto;
    }

    async login(
        user: Partial<any>,
        sesionactiva: boolean,
        timeout = null,
    ): Promise<string> {
        const payload: PayloadModel = {
            username: user.username,
            uid: user.id,
            email: user.correo,
            idrol: user.id_rol,
            rol: user.rol,
        };

        await this.usuarioService.actualizarFechaLogin(user.id);

        let expiresIn = sesionactiva ? '365d' : process.env.expireTime || '1h';
        expiresIn = timeout ? timeout : expiresIn;
        return this.jwtService.sign(payload, { expiresIn, secret: this._token });
    }

    async me(id: number): Promise<any> {

        const user: Usuarios = await this.usuarioService.findOne({
            where: { id, estatus: true },
            relations: ['detalles', 'rol'],
        });

        const userDto = {
            id: user.id,
            nombres: user.detalles.nombres,
            apellidos: user.detalles.apellidos,
            correo: user.correo,
            fecha_nacimiento: user.detalles.fecha_nacimiento,
            foto: user.detalles.foto,
            id_genero: user.detalles.id_genero,
            id_pais: user.detalles.id_pais,
            id_rol: user.id_rol,
            rol: user.rol.descripcion,
            telefono: user.detalles.telefono,
            username: user.username,
            estatus: user.estatus
        };

        return userDto;
    }

    async refreshToken(token: string): Promise<string> {
        const user = await this.jwtService.verifyAsync(token, {
            secret: this._token,
        });
        const payload: PayloadModel = {
            username: user.username,
            uid: user.uid,
            email: user.correo,
            idrol: user.idrol,
            rol: user.rol,
        };
        this.logout(token);

        let expiresIn = process.env.expireTime || '1h';

        return await this.jwtService.signAsync(payload, { expiresIn, secret: this._token });
    }

    async logout(token: string) {
        await this.listaNegraService.add(token);
    }

    async validarToken(token: string) {
        return await this.jwtService.verifyAsync(token, { secret: this._token });
    }
}
