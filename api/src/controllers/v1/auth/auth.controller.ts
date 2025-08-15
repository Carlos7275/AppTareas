import { Controller, Post, UseGuards, Request, Get, Req, HttpCode, Body, Res, UseInterceptors } from '@nestjs/common';
import { AuthService } from 'src/services/auth.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IncomingMessage } from 'http';
import { Public } from 'src/decorators/public.decorator';
import { LocalAuthGuard } from 'src/guards/local.guard';
import LoginModel from 'src/models/Login/login.model';
import { Utils } from 'src/utils/utils';
import { Throttle } from '@nestjs/throttler';
import { UrlPrefixInterceptor } from 'src/interceptors/urlPreffix.interceptor';
@ApiTags('auth')
@Controller('api/v1/auth/')
export class AuthController {

    constructor(private authService: AuthService) { }

    @Post('login')
    @ApiBody({ type: LoginModel, required: true })
    @Public()
    @UseGuards(LocalAuthGuard)
    @HttpCode(200)
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @ApiOperation({ summary: 'Iniciar Sesión en el sistema', description: 'Obtiene un token JWT para el acceso al sistema.' })
    @ApiResponse({ status: 200, description: 'Inicio de sesión exitoso.' })
    @ApiResponse({ status: 400, description: 'Error de validación de la petición.' })
    async login(
        @Body() loginModel: LoginModel,
        @Request() req: IncomingMessage,
    ): Promise<any> {
        let jwt = await this.authService.login(
            req['user'],
            loginModel.sesionactiva,
        );

        return Utils.Response('¡Operación Exitosa!', { jwt });
    }


    @Get('me')
    @ApiBearerAuth()
    @UseInterceptors(new UrlPrefixInterceptor())
    @HttpCode(200)
    @Throttle({ default: { limit: 50, ttl: 60000 } })
    @ApiResponse({ status: 200, description: 'Obtiene la informacion del usuario exitosamente.' })
    @ApiResponse({ status: 401, description: 'Acceso no autorizado.' })
    @ApiResponse({ status: 403, description: 'El token JWT expiro.' })


    @ApiOperation({ summary: 'Me', description: 'Obtiene información del usuario logueado.' })
    async me(@Req() request: any) {
        const idusuario = request.user.id;
        const user = await this.authService.me(idusuario);
        return Utils.Response('¡Operacion Exitosa!', user);
    }

    @Get('refresh')
    @ApiBearerAuth()
    @HttpCode(200)
    @ApiOperation({ summary: 'RefreshToken', description: 'Crea un nuevo token con duracion de 1hr.' })
    @ApiResponse({ status: 200, description: 'Obtiene el token renovado exitosamente.' })
    @ApiResponse({ status: 401, description: 'Acceso no autorizado.' })
    @ApiResponse({ status: 403, description: 'El token JWT expiro.' })

    async refresh(@Req() request: Request, @Res() res) {
        const token = request.headers['authorization']
            .replace('Bearer ', '')
            .trim();
        const tokennuevo = await this.authService.refreshToken(token);
        res.cookie('jwt', tokennuevo, {
            sameSite: 'None',
            secure: true,
            httpOnly: true,
        });
        res.json(Utils.Response('¡Operacion Exitosa!', tokennuevo));
    }

    @Get('logout')
    @ApiBearerAuth()
    @HttpCode(200)
    @ApiOperation({ summary: 'Cerrar Sesión', description: 'Cierra sesión del sistema.' })
    @ApiResponse({ status: 200, description: 'Cierra sesión exitosamente.' })
    @ApiResponse({ status: 401, description: 'Acceso no autorizado.' })
    @ApiResponse({ status: 403, description: 'El token JWT expiro.' })



    async logout(@Req() request: Request, @Res() res) {
        const token = request.headers['authorization']
            .replace('Bearer ', '')
            .trim();


        await this.authService.logout(token);
        res.json(
            Utils.Response('¡Operacion Exitosa!', 'Se cerro sesión con exito'),
        );
    }
}
