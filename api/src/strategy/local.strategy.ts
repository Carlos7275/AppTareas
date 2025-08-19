import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
    ValidationError,
    ValidationPipe,
} from '@nestjs/common';
import { Usuarios } from 'src/entities/usuarios.entity';
import { AuthService } from 'src/services/auth.service';
import LoginModel from 'src/models/Login/login.model';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    validationPipe: any;
    constructor(private authService: AuthService) {
        super({
            usernameField: 'correo',
        });
        this.validationPipe = new ValidationPipe({
            exceptionFactory: (errors: ValidationError[]) => {
                const translatedErrors = errors
                    .map((error) => {
                        if (!error.constraints) {
                            return `${error.property}: error desconocido`;
                        }

                        const constraints = Object.values(error.constraints)
                            .map((constraint) => {
                                const constraintKey = Object.keys(error.constraints).find(
                                    (key) => error.constraints[key] === constraint,
                                );
                                return constraint
                            })
                            .join(', ');

                        return `${constraints}`;
                    })
                    .join('; ');

                return new BadRequestException(translatedErrors);
            },
        });
    }

    async validate(
        correo: string,
        password: string,
    ): Promise<Partial<Usuarios>> {
        await this.validationPipe.transform(
            { correo, password },
            {
                transform: true,

                metatype: LoginModel,
                type: 'body',
            },
        );

        const user = await this.authService.authenticateUser(
            correo,
            password,
        );
        if (!user) {
            throw new UnauthorizedException('Verifique sus Credenciales');
        }
        return user;
    }
}
