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
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
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
@ApiTags('usuarios')
export class UsuariosController {
    constructor(
        private usuarioService: UsuariosService,
        private authService: AuthService,
    ) { }

    @Post('crear')
    @Public()
    @ApiBearerAuth()
    @HttpCode(200)
    @ApiBody({ type: CreateUserDTO, required: true })
    async RegistrarUsuario(@Body() user: CreateUserDTO, @Req() request: Request) {
        const token = request.headers['authorization']
            .replace('Bearer ', '')
            .trim();

        if (token != 'null' && token) {
            const usuario = await this.authService.me(token);
            user.id_rol = usuario.id_rol === 2 ? 2 : user.id_rol;
        }
        await this.usuarioService.create(user, true);
        return Utils.Response(
            'Operacion Exitosa',
            'Se registro el usuario con exito',
        );
    }

    @Put('modificar/:id')
    @ApiBearerAuth()
    @HttpCode(200)
    @ApiBody({ type: UpdateUserDTO, required: true })
    async ModificarUsuario(
        @Param('id') id: number,
        @Body() user: UpdateUserDTO,
        @Req() request: Request,
    ) {
        const token = request.headers['authorization']
            .replace('Bearer ', '')
            .trim();

        const usuario = await this.authService.me(token);

        const hayPermiso = usuario.id_rol == 1;

        if (!hayPermiso) delete user.id_rol;
        if (user.foto != null) {
            user.foto = Image.saveImage('users', user.foto);
            const informacionUsuario = await this.usuarioService.findOneById(id);
            const rutaImagen = informacionUsuario.foto;

            if (rutaImagen && rutaImagen != Constants.relativeImagePath + "/users/default.png") {
                const rutaRelativa = Utils.getRelativePath(rutaImagen);
                Image.deleteFile(rutaRelativa);
            }
        }


        await this.usuarioService.update(id, user);
        return Utils.Response(
            'Operacion Exitosa',
            'Se modifico el usuario con exito',
        );
    }

    @Delete('eliminar/:id')
    @ApiBearerAuth()
    @HttpCode(200)
    async CambiarEstatusUsuario(@Param('id') id: number) {
        return Utils.Response(
            'Operacion Exitosa',
            await this.usuarioService.cambiarEstatus(id),
        );
    }

    @Post('cambiar-contra')
    @ApiBearerAuth()
    @HttpCode(200)
    @ApiBody({ type: ChangePasswordDTO, required: true })
    async CambiarContraseña(
        @Body() changePasswordDTO: ChangePasswordDTO,
        @Req() request: Request,
    ) {
        const token = request.headers['authorization']
            .replace('Bearer ', '')
            .trim();

        const { id } = await this.authService.me(token);
        await this.usuarioService.CambiarContraseña(id, changePasswordDTO);
        return Utils.Response('Operacion Exitosa', '¡Se cambio la contraseña!');
    }

    @HttpCode(200)
    @Post("listado")
    @ApiBearerAuth()
    @UseInterceptors(new UrlPrefixInterceptor())
    @ApiQuery({ name: 'pagina', required: false, type: Number })
    @ApiQuery({ name: 'limite', required: false, type: Number })
    @ApiQuery({ name: 'busqueda', required: false, type: String })
    async ObtenerUsuarios(

        @Query('pagina') pagina?: number,
        @Query('limite') limite?: number,
        @Query('busqueda') busqueda?: string,
    ) {
        let data = await this.usuarioService.paginate(
            pagina,
            limite,
            ['correo', 'username', 'id', 'detalles.nombres', 'detalles.telefono'],
            busqueda,
            ['password'],
            [{ name: 'detalles', type: "inner" }, { name: "rol", type: "inner" }],
        );
        return Utils.Response('Operacion Exitosa', data.data, busqueda, data.total);
    }


}
