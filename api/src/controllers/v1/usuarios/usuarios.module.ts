import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from 'src/services/usuarios.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuarios } from 'src/entities/usuarios.entity';
import { UsuariosDetalle } from 'src/entities/usuarios_detalle.entity';
import { CommonModule } from 'src/shared/common.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Usuarios, UsuariosDetalle]),
        CommonModule
    ],
    providers: [],
    controllers: [UsuariosController]
})
export class UsuariosModule { }
