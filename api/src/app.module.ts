import { Module, OnModuleInit } from '@nestjs/common';
import { AuthController } from './controllers/v1/auth/auth.controller';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './shared/common.module';
import { AuthModule } from './controllers/v1/auth/auth.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { configDotenv } from 'dotenv';
import { DatabaseSeederService } from './services/databaseseeder.service';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { CustomThrottlerGuard } from './guards/customthrottler.guards';
import { JwtAuthGuard } from './guards/jwt.guard';
import { ErrorFilter } from './filters/error.filter';
import { ThrottlerModule } from '@nestjs/throttler';
import { LocalStrategy } from './strategy/local.strategy';
import { UsuariosController } from './v1/usuarios/usuarios.controller';
import { UsuariosController } from './controllers/v1/usuarios/usuarios.controller';
import { UsuariosModule } from './controllers/v1/usuarios/usuarios.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '/public/'),
      serveRoot: '/public',
    }),
    AuthModule,
    CommonModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
    UsuariosModule,
  ],
  providers: [DatabaseSeederService,

    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: ErrorFilter,
    },

    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard
    }],
  controllers: [UsuariosController],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly databaseSeederService: DatabaseSeederService) { }



  async onModuleInit() {
    await this.databaseSeederService.seed();
  }
}
