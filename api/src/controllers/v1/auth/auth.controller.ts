import { Controller, Post, UseGuards, Request, Get, Req, HttpCode, Body, Res, UseInterceptors } from '@nestjs/common';
import { AuthService } from 'src/services/auth.service';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { IncomingMessage } from 'http';
import { Public } from 'src/decorators/public.decorator';
import { LocalAuthGuard } from 'src/guards/local.guard';
import LoginModel from 'src/models/Login/login.model';
import { Utils } from 'src/utils/utils';
import { Throttle } from '@nestjs/throttler';
import { UrlPrefixInterceptor } from 'src/interceptors/urlPreffix.interceptor';
@ApiTags('Auth')
@Controller('api/v1/auth/')
export class AuthController {
    constructor(
        private authService: AuthService,
    ) { }

    @Post('login')
    @ApiBody({ type: LoginModel, required: true })
    @Public()
    @UseGuards(LocalAuthGuard)
    @HttpCode(200)
    @Throttle({ default: { limit: 3, ttl: 60000 } })
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
    async me(@Req() request: Request) {
        const token = request.headers['authorization']
            .replace('Bearer ', '')
            .trim();
        const user = await this.authService.me(token);
        return Utils.Response('¡Operacion Exitosa!', user);
    }

    @Get('refresh')
    @ApiBearerAuth()
    @HttpCode(200)
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
