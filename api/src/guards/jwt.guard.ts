import { ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from 'src/decorators/public.decorator';
import * as jwt from 'jsonwebtoken';
import { UsuariosService } from 'src/services/usuarios.service';
import { ListaNegraService } from 'src/services/lista-negra.service';
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private listaNegraService: ListaNegraService,
    private configService: ConfigService,
    private usuarioService: UsuariosService
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractJwtFromRequest(request);

    this.isTokenExpired(token);

    const usuario = await this.obtenerUsuario(token);
    const estaEnListaNegra = await this.listaNegraService.isBlacklisted(token)
    if (estaEnListaNegra || !usuario.estatus) {
      throw new ForbiddenException('No tienes acceso a este recurso.');
    }

    request.user = usuario;
    return true;

  }


  private extractJwtFromRequest(request: any): string {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('El token JWT es obligatorio y no fue proporcionado.');
    }

    const [, token] = authHeader.split(' ');
    if (!token) {
      throw new UnauthorizedException('El token JWT esta vácio.');
    }

    return token;
  }

  private async obtenerUsuario(token: string) {
    const { uid } = new JwtService().verify(token, {
      secret: this.configService.get<string>('jwtSecret'),
    });

    return await this.usuarioService.findOneById(uid);
  }
  private isTokenExpired(token: any) {
    try {
      const decodedToken = new JwtService().verify(token, {
        secret: this.configService.get<string>('jwtSecret'),
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError)
        throw new ForbiddenException('Su token ha expirado.');

      throw error;
    }
  }
}
