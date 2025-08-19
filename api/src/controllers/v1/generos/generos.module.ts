import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Generos } from 'src/entities/generos.entity';
import { GenerosService } from 'src/services/generos.service';
import { GenerosController } from './generos.controller';
@Module({
    imports: [TypeOrmModule.forFeature([Generos])],
    controllers: [GenerosController],
    providers: [GenerosService],
})
export class GenerosModule { }
