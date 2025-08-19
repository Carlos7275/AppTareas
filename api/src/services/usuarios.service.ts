import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuarios } from 'src/entities/usuarios.entity';
import { UsuariosDetalle } from 'src/entities/usuarios_detalle.entity';
import { CreateUserDTO } from 'src/models/Usuarios/CreateUserDTO';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { GenericService } from './generic.service';
import { UpdateUserDTO } from 'src/models/Usuarios/UpdateUserDTO';
import { ChangePasswordDTO } from 'src/models/Usuarios/ChangePasswordDTO';
import { Relacion } from 'src/types/filtros.type';

@Injectable()
export class UsuariosService extends GenericService<Usuarios> {
    constructor(
        @InjectRepository(Usuarios)
        private readonly usuariosRepository: Repository<Usuarios>,
        @InjectRepository(UsuariosDetalle)
        private readonly usuariosDetalleRepository: Repository<UsuariosDetalle>,
    ) {
        super(usuariosRepository);
    }

    async create(usuarioDto: CreateUserDTO): Promise<any> {
        const queryRunner =
            this.usuariosRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const { correo, password, username, id_rol, ...detalle } =
                usuarioDto;

            const hashedPassword = await bcrypt.hash(
                password,
                await bcrypt.genSalt(),
            );
            const estatus = true;

            const usuario = this.usuariosRepository.create({
                correo,
                password: password != '' ? hashedPassword : '',
                id_rol,
                estatus,
            });

            const usuarioInsertResult = await queryRunner.manager.save(usuario);

            const usuarioDetalle = this.usuariosDetalleRepository.create({
                ...detalle,
                id: usuarioInsertResult.id,
            });

            await queryRunner.manager.save(usuarioDetalle);

            await queryRunner.commitTransaction();

            return usuarioInsertResult.id;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
    }


    async update(id: number, user: UpdateUserDTO) {
        const queryRunner =
            this.usuariosRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {

            let datosPrincipales = {
                correo: user.correo,
                username: user.username,
                id_rol: user.id_rol,
            };

            await this.usuariosRepository.update(id, datosPrincipales);

            let datos = {
                nombres: user.nombres,
                apellidos: user.apellidos,
                foto: user.foto,
                id_genero: user.id_genero,
                id_pais: user.id_pais,
                fecha_nacimiento: user.fecha_nacimiento,
                telefono: user.telefono,
            };
            if (user.foto == null) {
                delete datos.foto;
            }

            await queryRunner.manager.update(
                this.usuariosDetalleRepository.target,
                id,
                datos,
            );

            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async obtenerUsuarioId(id) {
        return await this.findOne({ where: { id: id } });
    }
    async findOneById(id: any): Promise<any> {
        const user: Usuarios = await this.findOne({
            where: { id: id },
            relations: ['detalles', 'rol'],
        });
        if (!user) return null;

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
            estatus: user.estatus
        };

        return userDto;
    }
    async findOneByEmail(correo: string): Promise<any> {
        const user: Usuarios = await this.findOne({
            where: { correo: correo },
            relations: ['detalles', 'rol'],
        });
        if (!user) return null;

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
        };

        return userDto;
    }

    async cambiarEstatus(id: number) {
        const user = await this.findOneById(id);
        if (!user) throw new NotFoundException(`No existe el usuario con ${id}`);

        const estatus = user.estatus ? false : true;

        this.usuariosRepository.update(id, { estatus });
        return `Se cambio el estatus del usuario a ${estatus ? "ACTIVO" : "INACTIVO"}`;
    }

    async actualizarFechaLogin(id: number) {
        const usuario = await this.usuariosRepository.findOneBy({ id });
        if (!usuario) throw new NotFoundException(`No existe el usuario con ${id}`);

        const fechaActual = new Date();
        this.usuariosRepository.update(id, { ultimo_login: fechaActual });
    }

    async CambiarContraseña(id: number, passwords: ChangePasswordDTO) {
        if (passwords.NuevaContraseña != passwords.ContraseñaAux)
            throw new BadRequestException('Las contraseñas no coinciden');

        const usuario = await this.obtenerUsuarioId(id);
        const contrasenaValida = await bcrypt.compare(
            passwords.Contraseña,
            usuario.password,
        );
        if (contrasenaValida)
            this.establecerContraseña(id, passwords.NuevaContraseña);
        else throw new BadRequestException('Contraseña actual incorrecta');
    }

    async establecerContraseña(id, password: string) {
        const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt());
        this.usuariosRepository.update(id, { password: hashedPassword });
    }

    async paginate(
        page?: number,
        limit?: number,
        searchFields?: string[],
        search?: string,
        ignoreFields?: string[],
        relations?: Relacion[],
    ): Promise<{ data: any; total: number }> {
        const { data, total } = await super.paginate(
            page,
            limit,
            searchFields,
            search,
            ignoreFields,
            relations,

        );

        const mappedData = data.map((user) => ({
            id: user.id,
            nombres: user.detalles.nombres,
            apellidos: user.detalles.apellidos,
            correo: user.correo,
            fecha_nacimiento: user.detalles.fecha_nacimiento,
            foto: user.detalles.foto,
            id_genero: user.detalles.id_genero,
            id_pais: user.detalles.id_pais,
            id_rol: user.id_rol,
            last_login: user.ultimo_login,
            created: user.created,
            rol: user.rol.descripcion,
            telefono: user.detalles.telefono,
            estatus: user.estatus
        }));

        return { data: mappedData, total };
    }

    public async ObtenerEstadisticasUsuario() {
        const result = await this.usuariosRepository.query(`
      SELECT
        COUNT(CASE WHEN estatus = 1 THEN 1 END) AS activos,
        COUNT(CASE WHEN estatus = 0 THEN 1 END) AS inactivos,
        COUNT(*) AS total
      FROM usuarios
    `);

        return result[0];
    }
}
