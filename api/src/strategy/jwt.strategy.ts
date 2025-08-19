import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PayloadModel } from 'src/models//Payload/payload.model';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: configService.get<boolean>('ignoreExpiration'),
      secretOrKey: configService.get<string>('jwtSecret'),
    });
  }

  async validate(payload: PayloadModel) {
    return {
      id: payload.uid,
      username: payload.username,
      correo: payload.email,
      idrol:payload.idrol,
      rol:payload.rol
    };
  }
}
