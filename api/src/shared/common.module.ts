import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from 'src/config/configuration';
import * as redisStore from 'cache-manager-redis-store';
import { RedisModule } from '@nestjs-modules/ioredis';
import { RedisService } from 'src/services/redis.service';
import { Usuarios } from 'src/entities/usuarios.entity';
import { UsuariosDetalle } from 'src/entities/usuarios_detalle.entity';
import { ListaNegraService } from 'src/services/lista-negra.service';
import { UsuariosService } from 'src/services/usuarios.service';
import { LocalStrategy } from 'src/strategy/local.strategy';
import { JwtStrategy } from 'src/strategy/jwt.strategy';
import { AuthService } from 'src/services/auth.service';

@Module({
    imports: [

        ConfigModule.forRoot({
            load: [configuration],
            isGlobal: true,

        }),
        CacheModule.register({
            isGlobal: true,
            store: redisStore,
            url: process.env.REDIS_URL,
        }),

        TypeOrmModule.forRoot({
            type: configuration().ormConfig.type,
            ...configuration().ormConfig,
        }),
        JwtModule.register({
            secret: configuration().jwtSecret,
            signOptions: {
                expiresIn: configuration().expireTime,
            },
        }),


        RedisModule.forRoot({
            type: 'single',
            url: process.env.REDIS_URL,
            options: {
                maxRetriesPerRequest: null,
                enableReadyCheck: false,
                retryStrategy(times) {

                    const delay = Math.min(times * 50, 2000);
                    return delay;
                },
            },
        }),


        TypeOrmModule.forFeature([Usuarios, UsuariosDetalle
        ]),


    ],
    providers: [
        JwtStrategy,
        LocalStrategy,
        ListaNegraService,
        UsuariosService,
        RedisService,
        JwtService,
        AuthService
    ],
    exports: [
        ListaNegraService,
        UsuariosService,
        RedisService,
        JwtService,
        AuthService
    ],
})
export class CommonModule { }
