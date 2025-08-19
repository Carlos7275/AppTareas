import {
    Body,
    Controller,
    Delete,
    HttpCode,
    Param,
    Post,
    Put,
    Query,
    Req,
    UseInterceptors,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiQuery,
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
} from '@nestjs/swagger';
import { Public } from 'src/decorators/public.decorator';
import { ChangePasswordDTO } from 'src/models/Usuarios/ChangePasswordDTO';
import { CreateUserDTO } from 'src/models/Usuarios/CreateUserDTO';
import { UpdateUserDTO } from 'src/models/Usuarios/UpdateUserDTO';
import { AuthService } from 'src/services/auth.service';
import { UsuariosService } from 'src/services/usuarios.service';
import { Utils } from 'src/utils/utils';
import { Image } from 'src/utils/image.utils';
import { UrlPrefixInterceptor } from 'src/interceptors/urlPreffix.interceptor';
import { Constants } from 'src/constants/constants';

@Controller('api/v1/usuarios/')
@ApiTags('Usuarios')
@ApiBearerAuth()
export class UsuariosController {
    constructor(
        private usuarioService: UsuariosService,
        private authService: AuthService,
    ) { }

    /**
     * Registrar un nuevo usuario
     * Endpoint público, puede asignarse rol dependiendo del usuario autenticado
     */
    @Post('crear')
    @Public()
    @HttpCode(200)
    @ApiOperation({ summary: 'Registrar usuario', description: 'Registra un nuevo usuario en el sistema.' })
    @ApiBody({ type: CreateUserDTO, required: true })
    @ApiResponse({ status: 200, description: 'Usuario registrado correctamente.' })
    async RegistrarUsuario(@Body() user: CreateUserDTO, @Req() request: any) {
        const id_usuario = request.user?.id;

        if (id_usuario) {
            const usuario = await this.authService.me(id_usuario);
            user.id_rol = usuario.id_rol === 2 ? 2 : user.id_rol;
        } else {
            user.id_rol = 2;
        }

        await this.usuarioService.create(user);
        return Utils.Response('Operación Exitosa', 'Se registró el usuario con éxito');
    }

    /**
     * Modificar los datos de un usuario existente
     * Se maneja la actualización de la foto y permisos de rol
     */
    @Put('modificar/:id')
    @ApiBearerAuth()
    @HttpCode(200)
    @ApiOperation({ summary: 'Modificar usuario', description: 'Modifica los datos de un usuario existente.' })
    @ApiParam({ name: 'id', type: Number, description: 'ID del usuario a modificar' })
    @ApiBody({ type: UpdateUserDTO, required: true })
    @ApiResponse({ status: 200, description: 'Usuario modificado correctamente.' })
    async ModificarUsuario(
        @Param('id') id: number,
        @Body() user: UpdateUserDTO,
    ) {
        const usuario = await this.authService.me(id);
        const hayPermiso = usuario.id_rol === 1;

        if (!hayPermiso) delete user.id_rol;

        if (user.foto != null) {
            user.foto = Image.saveImage('users', user.foto);
            const informacionUsuario = await this.usuarioService.findOneById(id);
            const rutaImagen = informacionUsuario.foto;

            if (rutaImagen && rutaImagen !== Constants.relativeImagePath + "/users/default.png") {
                const rutaRelativa = Utils.getRelativePath(rutaImagen);
                Image.deleteFile(rutaRelativa);
            }
        }

        await this.usuarioService.update(id, user);
        return Utils.Response('Operación Exitosa', 'Se modificó el usuario con éxito');
    }

    /**
     * Cambiar el estatus (activar/desactivar) de un usuario
     */
    @Delete('eliminar/:id')
    @ApiBearerAuth()
    @HttpCode(200)
    @ApiOperation({ summary: 'Cambiar estatus usuario', description: 'Activa o desactiva un usuario.' })
    @ApiParam({ name: 'id', type: Number, description: 'ID del usuario' })
    @ApiResponse({ status: 200, description: 'Estatus del usuario cambiado correctamente.' })
    async CambiarEstatusUsuario(@Param('id') id: number) {
        return Utils.Response('Operación Exitosa', await this.usuarioService.cambiarEstatus(id));
    }

    /**
     * Cambiar la contraseña del usuario autenticado
     */
    @Post('cambiar-contra')
    @ApiBearerAuth()
    @HttpCode(200)
    @ApiOperation({ summary: 'Cambiar contraseña', description: 'Permite cambiar la contraseña del usuario autenticado.' })
    @ApiBody({ type: ChangePasswordDTO, required: true })
    @ApiResponse({ status: 200, description: 'Contraseña cambiada correctamente.' })
    async CambiarContraseña(@Body() changePasswordDTO: ChangePasswordDTO, @Req() request) {
        const id_usuario = request.user.id;
        const { id } = await this.authService.me(id_usuario);
        await this.usuarioService.CambiarContraseña(id, changePasswordDTO);
        return Utils.Response('Operación Exitosa', '¡Se cambió la contraseña!');
    }

    /**
     * Listado de usuarios paginado y filtrable
     */
    @HttpCode(200)
    @Post('listado')
    @ApiBearerAuth()
    @UseInterceptors(new UrlPrefixInterceptor())
    @ApiOperation({ summary: 'Listado de usuarios', description: 'Obtiene un listado paginado de usuarios con filtros opcionales.' })
    @ApiQuery({ name: 'pagina', required: false, type: Number, description: 'Número de página' })
    @ApiQuery({ name: 'limite', required: false, type: Number, description: 'Cantidad de usuarios por página' })
    @ApiQuery({ name: 'busqueda', required: false, type: String, description: 'Término de búsqueda por correo, nombre o teléfono' })
    @ApiResponse({ status: 200, description: 'Listado de usuarios obtenido correctamente.' })
    async ObtenerUsuarios(
        @Query('pagina') pagina?: number,
        @Query('limite') limite?: number,
        @Query('busqueda') busqueda?: string,
    ) {
        const data = await this.usuarioService.paginate(
            pagina,
            limite,
            ['correo', 'username', 'id', 'detalles.nombres', 'detalles.telefono'],
            busqueda,
            ['password'],
            [{ name: 'detalles', type: 'inner' }, { name: 'rol', type: 'inner' }],
        );

        return Utils.Response('Operación Exitosa', data.data, busqueda, data.total);
    }
}
