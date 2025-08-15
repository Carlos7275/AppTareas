import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from 'src/shared/common.module';
import { Usuarios } from 'src/entities/usuarios.entity';
import { UsuariosDetalle } from 'src/entities/usuarios_detalle.entity';
import { AuthService } from 'src/services/auth.service';
import { UsuariosService } from 'src/services/usuarios.service';
import { ListaNegraService } from 'src/services/lista-negra.service';

@Module({
  imports: [

    CommonModule,
    TypeOrmModule.forFeature([Usuarios, UsuariosDetalle]),


  ],
  controllers: [AuthController],
  providers: [AuthService, UsuariosService,ListaNegraService],
})
export class AuthModule { }
