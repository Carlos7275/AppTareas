import { Module, OnModuleInit } from '@nestjs/common';
import { CommonModule } from './shared/common.module';
import { AuthModule } from './controllers/v1/auth/auth.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { DatabaseSeederService } from './services/databaseseeder.service';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { CustomThrottlerGuard } from './guards/customthrottler.guards';
import { JwtAuthGuard } from './guards/jwt.guard';
import { ErrorFilter } from './filters/error.filter';
import { ThrottlerModule } from '@nestjs/throttler';
import { UsuariosModule } from './controllers/v1/usuarios/usuarios.module';
import { GenerosModule } from './controllers/v1/generos/generos.module';
import { TareasController } from './controllers/v1/tareas/tareas.controller';
import { TareasModule } from './controllers/v1/tareas/tareas.module';
import { ReportesController } from './controllers/v1/reportes/reportes.controller';
import { ReportesModule } from './controllers/v1/reportes/reportes.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'), 
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
    GenerosModule,
    TareasModule,
    ReportesModule,
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
  controllers: [],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly databaseSeederService: DatabaseSeederService) { }



  async onModuleInit() {
    await this.databaseSeederService.seed();
  }
}
